import { spawn } from 'child_process';
import crossSpawn from 'cross-spawn';
import path from 'path';
import os from 'os';
import fs from 'fs';

import { notifyRunFailed, notifyRunStopped } from './services/notification-orchestrator.js';
import { sessionsService } from './modules/providers/services/sessions.service.js';
import { providerAuthService } from './modules/providers/services/provider-auth.service.js';
import { createNormalizedMessage } from './shared/utils.js';

const spawnFunction = process.platform === 'win32' ? crossSpawn : spawn;

/**
 * Send a normalized message through whichever transport `ws` represents.
 * The chat WS path passes a `WebSocketWriter` whose .send() already
 * JSON.stringifies. Stringifying first here would double-encode the payload
 * and the client would silently drop it. Raw ws fallback for SSE-style usage.
 */
function sendPiMessage(ws, message) {
  try {
    if (ws && (ws.isWebSocketWriter || ws.isSSEStreamWriter)) {
      ws.send(message);
      return;
    }
    if (ws && typeof ws.send === 'function') {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error('[Pi CLI] failed to send message:', error?.message || error);
  }
}

let activePiProcesses = new Map();

function getPiSessionDir(projectPath) {
  const cleanPath = (projectPath || process.cwd()).replace(/[^\x20-\x7E]/g, '').trim();
  const encodedPath = cleanPath.replace(/[^a-zA-Z0-9-]/g, '-');
  return path.join(os.homedir(), '.pi', 'agent', 'sessions', encodedPath);
}

function findSessionFile(sessionId, projectPath) {
  const sessionDir = getPiSessionDir(projectPath);
  if (!fs.existsSync(sessionDir)) {
    return null;
  }
  const files = fs.readdirSync(sessionDir);
  const match = files.find((f) => f.includes(sessionId) && f.endsWith('.jsonl'));
  return match ? path.join(sessionDir, match) : null;
}

async function spawnPi(command, options = {}, ws) {
  return new Promise(async (resolve, reject) => {
    const { sessionId, projectPath, cwd, model, forkSessionId, parentMessageId } = options;
    let capturedSessionId = sessionId;
    let sessionCreatedSent = false;
    let settled = false;

    const workingDir = cwd || projectPath || process.cwd();
    let processKey = capturedSessionId || `pi-${Date.now()}`;

    const settleOnce = (callback) => {
      if (settled) return;
      settled = true;
      activePiProcesses.delete(processKey);
      callback();
    };

    // Guard: a stale project entry (created from a Pi session-folder name like
    // "Users-sachinkoli-github-foo" rather than a real path) will give us a
    // workingDir that doesn't exist on disk. Pi exits silently with code -2 in
    // that case, leaving the chat hanging. Detect up-front and explain.
    try {
      const stat = fs.statSync(workingDir);
      if (!stat.isDirectory()) {
        sendPiMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: `Pi working directory is not a directory: ${workingDir}`,
          sessionId: capturedSessionId,
          provider: 'pi',
        }));
        sendPiMessage(ws, createNormalizedMessage({
          kind: 'complete',
          exitCode: 1,
          sessionId: capturedSessionId,
          provider: 'pi',
        }));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch {
      sendPiMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: `Pi project folder not found on disk: ${workingDir}. The project entry in the sidebar may point at a stale or encoded path — pick the project with the real path (e.g. /Users/...) before starting a new chat.`,
        sessionId: capturedSessionId,
        provider: 'pi',
      }));
      sendPiMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: 1,
        sessionId: capturedSessionId,
        provider: 'pi',
      }));
      settleOnce(() => resolve({ exitCode: 1 }));
      return;
    }

    const args = ['--mode', 'json'];

    if (model && model !== 'auto') {
      args.push('--model', model);
    }

    if (forkSessionId) {
      args.push('--fork', forkSessionId);
    } else if (capturedSessionId) {
      args.push('--session', capturedSessionId);
    }

    if (command && command.trim()) {
      args.push('--print', command);
    }

    try {
      const authStatus = await providerAuthService.getProviderAuthStatus('pi');
      if (!authStatus.installed) {
        sendPiMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: 'Pi is not installed. Run `npm install -g @earendil-works/pi-coding-agent` to install.',
          sessionId: capturedSessionId,
          provider: 'pi',
        }));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch (error) {
      // Continue anyway, spawn will fail naturally if not installed
    }

    console.log('[Pi CLI] spawn args:', args.join(' '), 'cwd=', workingDir);
    const piProcess = spawnFunction('pi', args, {
      cwd: workingDir,
      // Detach stdin so pi doesn't block waiting for input in --print mode.
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    activePiProcesses.set(processKey, piProcess);

    let buffer = '';
    let stderrBuffer = '';
    let producedAnyJson = false;
    let sessionCreatedReceived = false;

    let stdoutByteCount = 0;
    let eventTypeCounts = {};
    piProcess.stdout.on('data', (data) => {
      stdoutByteCount += data.length;
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          producedAnyJson = true;
          eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
          const normalized = sessionsService.normalizeMessage('pi', event, capturedSessionId);
          for (const msg of normalized) {
            if (msg.kind === 'session_created' && msg.newSessionId && !capturedSessionId) {
              capturedSessionId = msg.newSessionId;
              // Re-key the process map so abort lookups work by real session id
              activePiProcesses.delete(processKey);
              processKey = capturedSessionId;
              activePiProcesses.set(processKey, piProcess);
              if (!sessionCreatedSent) {
                sessionCreatedSent = true;
                sendPiMessage(ws, msg);
                sessionCreatedReceived = true;
                // If this is a fork/resume without a command, kill after session info
                if (!command || !command.trim()) {
                  try {
                    piProcess.kill('SIGTERM');
                  } catch {
                    // ignore
                  }
                }
                continue;
              }
            }
            sendPiMessage(ws, msg);
          }
        } catch (parseError) {
          // Skip non-JSON lines
        }
      }
    });

    piProcess.stderr.on('data', (data) => {
      const text = data.toString();
      stderrBuffer += text;
      const trimmed = text.trim();
      if (!trimmed) return;
      sendPiMessage(ws, createNormalizedMessage({
        kind: 'status',
        content: trimmed,
        sessionId: capturedSessionId,
        provider: 'pi',
      }));
    });

    piProcess.on('error', (error) => {
      const isMissing = error?.code === 'ENOENT';
      if (!isMissing) {
        console.error('[Pi CLI] Process error:', error);
      }
      sendPiMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: isMissing
          ? 'Pi is not installed. Run `npm install -g @earendil-works/pi-coding-agent` to install.'
          : `Pi process error: ${error.message}`,
        sessionId: capturedSessionId,
        provider: 'pi',
      }));
      // Resolve rather than reject for ENOENT so the WS layer doesn't log a duplicate
      // "Chat WebSocket error" — the user already got the friendly install hint above.
      if (isMissing) {
        settleOnce(() => resolve({ exitCode: 127 }));
      } else {
        settleOnce(() => reject(error));
      }
    });

    piProcess.on('close', (exitCode) => {
      console.log('[Pi CLI] close exitCode=' + exitCode + ' stdoutBytes=' + stdoutByteCount + ' producedAnyJson=' + producedAnyJson + ' events=' + JSON.stringify(eventTypeCounts));
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim());
          producedAnyJson = true;
          const normalized = sessionsService.normalizeMessage('pi', event, capturedSessionId);
          for (const msg of normalized) {
            sendPiMessage(ws, msg);
          }
        } catch {
          // ignore final non-JSON buffer
        }
      }

      // If Pi exited without emitting any JSON event (e.g. unauthenticated
      // provider, missing API key, invalid model), surface the buffered stderr
      // as an error so the chat doesn't appear stuck on "Processing".
      if (!producedAnyJson) {
        const detail = stderrBuffer.trim() || `pi exited with code ${exitCode ?? 0} and produced no output`;
        console.warn('[Pi CLI] no JSON output. stderr:', detail.slice(0, 500));
        sendPiMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: detail,
          sessionId: capturedSessionId,
          provider: 'pi',
        }));
      }

      sendPiMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: exitCode ?? 0,
        sessionId: capturedSessionId,
        provider: 'pi',
      }));

      if (exitCode !== 0 && exitCode !== null) {
        notifyRunFailed({ provider: 'pi', sessionId: capturedSessionId, error: `Pi exited with code ${exitCode}` });
      } else {
        notifyRunStopped({ provider: 'pi', sessionId: capturedSessionId });
      }

      settleOnce(() => resolve({ exitCode: exitCode ?? 0 }));
    });
  });
}

function abortPiSession(sessionId) {
  const proc = activePiProcesses.get(sessionId);
  if (!proc) {
    return false;
  }
  try {
    proc.kill('SIGTERM');
    activePiProcesses.delete(sessionId);
    return true;
  } catch {
    return false;
  }
}

function isPiSessionActive(sessionId) {
  return activePiProcesses.has(sessionId);
}

function getActivePiSessions() {
  return Array.from(activePiProcesses.keys());
}

export {
  spawnPi,
  abortPiSession,
  isPiSessionActive,
  getActivePiSessions,
};
