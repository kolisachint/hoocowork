import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

import crossSpawn from 'cross-spawn';

import { notifyRunFailed, notifyRunStopped } from './services/notification-orchestrator.js';
import { sessionsService } from './modules/providers/services/sessions.service.js';
import { providerAuthService } from './modules/providers/services/provider-auth.service.js';
import { hoocodeModesService } from './modules/providers/services/hoocode-modes.service.js';
import { hoocodeModelsService } from './modules/providers/services/hoocode-models.service.js';
import { createNormalizedMessage } from './shared/utils.js';

// Mode names that are not "real" hoocode modes — these come from the codex-style
// permission-mode UI and would never match a system.md file. Skip them silently.
const NON_HOOCODE_MODES = new Set(['default', 'acceptEdits', 'bypassPermissions', 'auto']);

const spawnFunction = process.platform === 'win32' ? crossSpawn : spawn;

/**
 * Send a normalized message through whichever transport `ws` represents.
 * The chat WS path passes a `WebSocketWriter` whose .send() already
 * JSON.stringifies. Stringifying first here would double-encode the payload
 * and the client would silently drop it. Raw ws fallback for SSE-style usage.
 */
function sendHoocodeMessage(ws, message) {
  try {
    if (ws && (ws.isWebSocketWriter || ws.isSSEStreamWriter)) {
      ws.send(message);
      return;
    }
    if (ws && typeof ws.send === 'function') {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error('[Hoocode CLI] failed to send message:', error?.message || error);
  }
}

let activeHoocodeProcesses = new Map();

function getHoocodeSessionDir(projectPath) {
  const cleanPath = (projectPath || process.cwd()).replace(/[^\x20-\x7E]/g, '').trim();
  const encodedPath = cleanPath.replace(/[^a-zA-Z0-9-]/g, '-');
  return path.join(os.homedir(), '.hoocode', 'agent', 'sessions', encodedPath);
}

function findSessionFile(sessionId, projectPath) {
  const sessionDir = getHoocodeSessionDir(projectPath);
  if (!fs.existsSync(sessionDir)) {
    return null;
  }
  const files = fs.readdirSync(sessionDir);
  const match = files.find((f) => f.includes(sessionId) && f.endsWith('.jsonl'));
  return match ? path.join(sessionDir, match) : null;
}

async function spawnHoocode(command, options = {}, ws) {
  return new Promise(async (resolve, reject) => {
    const { sessionId, projectPath, cwd, model, forkSessionId, parentMessageId, permissionMode } = options;
    let capturedSessionId = sessionId;
    let sessionCreatedSent = false;
    let settled = false;

    const workingDir = cwd || projectPath || process.cwd();
    let processKey = capturedSessionId || `hoocode-${Date.now()}`;

    const settleOnce = (callback) => {
      if (settled) return;
      settled = true;
      activeHoocodeProcesses.delete(processKey);
      callback();
    };

    // Guard: a stale project entry (created from a Hoocode session-folder name like
    // "Users-sachinkoli-github-foo" rather than a real path) will give us a
    // workingDir that doesn't exist on disk. Hoocode exits silently with code -2 in
    // that case, leaving the chat hanging. Detect up-front and explain.
    try {
      const stat = fs.statSync(workingDir);
      if (!stat.isDirectory()) {
        sendHoocodeMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: `Hoocode working directory is not a directory: ${workingDir}`,
          sessionId: capturedSessionId,
          provider: 'hoocode',
        }));
        sendHoocodeMessage(ws, createNormalizedMessage({
          kind: 'complete',
          exitCode: 1,
          sessionId: capturedSessionId,
          provider: 'hoocode',
        }));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch {
      sendHoocodeMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: `Hoocode project folder not found on disk: ${workingDir}. The project entry in the sidebar may point at a stale or encoded path — pick the project with the real path (e.g. /Users/...) before starting a new chat.`,
        sessionId: capturedSessionId,
        provider: 'hoocode',
      }));
      sendHoocodeMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: 1,
        sessionId: capturedSessionId,
        provider: 'hoocode',
      }));
      settleOnce(() => resolve({ exitCode: 1 }));
      return;
    }

    const args = ['--mode', 'json'];

    if (model && model !== 'auto') {
      args.push('--model', model);
    }

    // Hoocode modes live as ~/.hoocode/modes/{name}/system.md files. There's no
    // CLI flag to select one, so we read the system.md content and append it to
    // the system prompt. UI-only permission modes (default/acceptEdits/etc.)
    // have no hoocode equivalent and are skipped.
    if (permissionMode && !NON_HOOCODE_MODES.has(permissionMode)) {
      try {
        const modeSystemPrompt = await hoocodeModesService.getSystemPrompt(permissionMode);
        if (modeSystemPrompt) {
          args.push('--append-system-prompt', modeSystemPrompt);
        }
      } catch (error) {
        console.warn('[Hoocode CLI] failed to load mode system prompt:', permissionMode, error?.message || error);
      }
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
      const authStatus = await providerAuthService.getProviderAuthStatus('hoocode');
      if (!authStatus.installed) {
        sendHoocodeMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: 'Hoocode is not installed. Run `npm install -g hoocode` to install.',
          sessionId: capturedSessionId,
          provider: 'hoocode',
        }));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch (error) {
      // Continue anyway, spawn will fail naturally if not installed
    }

    console.log('[Hoocode CLI] spawn args:', args.join(' '), 'cwd=', workingDir);
    const hoocodeProcess = spawnFunction('hoocode', args, {
      cwd: workingDir,
      // Detach stdin so hoocode doesn't block waiting for input in --print mode.
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    activeHoocodeProcesses.set(processKey, hoocodeProcess);

    let buffer = '';
    let stderrBuffer = '';
    let producedAnyJson = false;
    let sessionCreatedReceived = false;

    let stdoutByteCount = 0;
    let eventTypeCounts = {};
    let contextWindowCache = null;
    const resolveContextWindow = async () => {
      if (contextWindowCache != null) return contextWindowCache;
      contextWindowCache = await hoocodeModelsService.getContextWindow(model);
      return contextWindowCache;
    };
    hoocodeProcess.stdout.on('data', (data) => {
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

          // Hoocode embeds cumulative usage on each assistant message_end.
          // Surface it as a token_budget status so the composer's TokenUsagePie
          // updates exactly like Claude/Codex do.
          const usage = event?.message?.role === 'assistant' ? event?.message?.usage : null;
          const totalTokens = usage?.totalTokens;
          if (
            (event.type === 'message_end' || event.type === 'message') &&
            typeof totalTokens === 'number' &&
            totalTokens > 0
          ) {
            resolveContextWindow().then((total) => {
              sendHoocodeMessage(ws, createNormalizedMessage({
                kind: 'status',
                text: 'token_budget',
                tokenBudget: { used: totalTokens, total },
                sessionId: capturedSessionId,
                provider: 'hoocode',
              }));
            }).catch((err) => {
              console.warn('[Hoocode CLI] context-window lookup failed:', err?.message || err);
            });
          }

          const normalized = sessionsService.normalizeMessage('hoocode', event, capturedSessionId);
          for (const msg of normalized) {
            if (msg.kind === 'session_created' && msg.newSessionId && !capturedSessionId) {
              capturedSessionId = msg.newSessionId;
              // Re-key the process map so abort lookups work by real session id
              activeHoocodeProcesses.delete(processKey);
              processKey = capturedSessionId;
              activeHoocodeProcesses.set(processKey, hoocodeProcess);
              if (!sessionCreatedSent) {
                sessionCreatedSent = true;
                sendHoocodeMessage(ws, msg);
                sessionCreatedReceived = true;
                // If this is a fork/resume without a command, kill after session info
                if (!command || !command.trim()) {
                  try {
                    hoocodeProcess.kill('SIGTERM');
                  } catch {
                    // ignore
                  }
                }
                continue;
              }
            }
            sendHoocodeMessage(ws, msg);
          }
        } catch (parseError) {
          // Skip non-JSON lines
        }
      }
    });

    hoocodeProcess.stderr.on('data', (data) => {
      const text = data.toString();
      stderrBuffer += text;
      const trimmed = text.trim();
      if (!trimmed) return;
      sendHoocodeMessage(ws, createNormalizedMessage({
        kind: 'status',
        content: trimmed,
        sessionId: capturedSessionId,
        provider: 'hoocode',
      }));
    });

    hoocodeProcess.on('error', (error) => {
      const isMissing = error?.code === 'ENOENT';
      if (!isMissing) {
        console.error('[Hoocode CLI] Process error:', error);
      }
      sendHoocodeMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: isMissing
          ? 'Hoocode is not installed. Run `npm install -g hoocode` to install.'
          : `Hoocode process error: ${error.message}`,
        sessionId: capturedSessionId,
        provider: 'hoocode',
      }));
      // Resolve rather than reject for ENOENT so the WS layer doesn't log a duplicate
      // "Chat WebSocket error" — the user already got the friendly install hint above.
      if (isMissing) {
        settleOnce(() => resolve({ exitCode: 127 }));
      } else {
        settleOnce(() => reject(error));
      }
    });

    hoocodeProcess.on('close', (exitCode) => {
      console.log('[Hoocode CLI] close exitCode=' + exitCode + ' stdoutBytes=' + stdoutByteCount + ' producedAnyJson=' + producedAnyJson + ' events=' + JSON.stringify(eventTypeCounts));
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim());
          producedAnyJson = true;
          const normalized = sessionsService.normalizeMessage('hoocode', event, capturedSessionId);
          for (const msg of normalized) {
            sendHoocodeMessage(ws, msg);
          }
        } catch {
          // ignore final non-JSON buffer
        }
      }

      // If Hoocode exited without emitting any JSON event (e.g. unauthenticated
      // provider, missing API key, invalid model), surface the buffered stderr
      // as an error so the chat doesn't appear stuck on "Processing".
      if (!producedAnyJson) {
        const detail = stderrBuffer.trim() || `hoocode exited with code ${exitCode ?? 0} and produced no output`;
        console.warn('[Hoocode CLI] no JSON output. stderr:', detail.slice(0, 500));
        sendHoocodeMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: detail,
          sessionId: capturedSessionId,
          provider: 'hoocode',
        }));
      }

      sendHoocodeMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: exitCode ?? 0,
        sessionId: capturedSessionId,
        provider: 'hoocode',
      }));

      if (exitCode !== 0 && exitCode !== null) {
        notifyRunFailed({ provider: 'hoocode', sessionId: capturedSessionId, error: `Hoocode exited with code ${exitCode}` });
      } else {
        notifyRunStopped({ provider: 'hoocode', sessionId: capturedSessionId });
      }

      settleOnce(() => resolve({ exitCode: exitCode ?? 0 }));
    });
  });
}

function abortPiSession(sessionId) {
  const proc = activeHoocodeProcesses.get(sessionId);
  if (!proc) {
    return false;
  }
  try {
    proc.kill('SIGTERM');
    activeHoocodeProcesses.delete(sessionId);
    return true;
  } catch {
    return false;
  }
}

function isPiSessionActive(sessionId) {
  return activeHoocodeProcesses.has(sessionId);
}

function getActivePiSessions() {
  return Array.from(activeHoocodeProcesses.keys());
}

export {
  spawnHoocode,
  abortPiSession,
  isPiSessionActive,
  getActivePiSessions,
};
