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

    const settleOnce = (callback) => {
      if (settled) return;
      settled = true;
      activePiProcesses.delete(processKey);
      callback();
    };

    try {
      const authStatus = await providerAuthService.getProviderAuthStatus('pi');
      if (!authStatus.installed) {
        ws.send(JSON.stringify(createNormalizedMessage({
          kind: 'error',
          content: 'Pi is not installed. Run `npm install -g @earendil-works/pi-coding-agent` to install.',
          sessionId: capturedSessionId,
          provider: 'pi',
        })));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch (error) {
      // Continue anyway, spawn will fail naturally if not installed
    }

    const piProcess = spawnFunction('pi', args, {
      cwd: workingDir,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    activePiProcesses.set(processKey, piProcess);

    let buffer = '';
    let sessionCreatedReceived = false;

    piProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
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
                ws.send(JSON.stringify(msg));
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
            ws.send(JSON.stringify(msg));
          }
        } catch (parseError) {
          // Skip non-JSON lines
        }
      }
    });

    piProcess.stderr.on('data', (data) => {
      const text = data.toString().trim();
      if (!text) return;
      ws.send(JSON.stringify(createNormalizedMessage({
        kind: 'status',
        content: text,
        sessionId: capturedSessionId,
        provider: 'pi',
      })));
    });

    piProcess.on('error', (error) => {
      console.error('[Pi CLI] Process error:', error);
      ws.send(JSON.stringify(createNormalizedMessage({
        kind: 'error',
        content: `Pi process error: ${error.message}`,
        sessionId: capturedSessionId,
        provider: 'pi',
      })));
      settleOnce(() => reject(error));
    });

    piProcess.on('close', (exitCode) => {
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim());
          const normalized = sessionsService.normalizeMessage('pi', event, capturedSessionId);
          for (const msg of normalized) {
            ws.send(JSON.stringify(msg));
          }
        } catch {
          // ignore final non-JSON buffer
        }
      }

      ws.send(JSON.stringify(createNormalizedMessage({
        kind: 'complete',
        exitCode: exitCode ?? 0,
        sessionId: capturedSessionId,
        provider: 'pi',
      })));

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
