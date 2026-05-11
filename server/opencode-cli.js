import { spawn } from 'child_process';
import fs from 'fs';

import crossSpawn from 'cross-spawn';

import { notifyRunFailed, notifyRunStopped } from './services/notification-orchestrator.js';
import { sessionsService } from './modules/providers/services/sessions.service.js';
import { providerAuthService } from './modules/providers/services/provider-auth.service.js';
import { triggerProviderSessionsRefresh } from './modules/providers/services/sessions-watcher.service.js';
import { createNormalizedMessage } from './shared/utils.js';

const spawnFunction = process.platform === 'win32' ? crossSpawn : spawn;

/**
 * Phase 1 OpenCode adapter.
 *
 * Spawns `opencode run --format json` per turn and pipes its newline-delimited
 * JSON events through the shared sessions normalizer. Until the OpenCode wire
 * format is fully reverse-engineered, the OpenCodeSessionsProvider falls back
 * to surfacing each event's text payload as a `stream_delta` so the chat UI
 * shows raw output. As event kinds are pinned down, extend the normalizer.
 */
function sendOpenCodeMessage(ws, message) {
  try {
    if (ws && (ws.isWebSocketWriter || ws.isSSEStreamWriter)) {
      ws.send(message);
      return;
    }
    if (ws && typeof ws.send === 'function') {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error('[OpenCode CLI] failed to send message:', error?.message || error);
  }
}

const activeOpenCodeProcesses = new Map();

async function spawnOpenCode(command, options = {}, ws) {
  return new Promise(async (resolve, reject) => {
    const { sessionId, projectPath, cwd, model, forkSessionId } = options;
    let capturedSessionId = sessionId;
    let settled = false;

    const workingDir = cwd || projectPath || process.cwd();
    let processKey = capturedSessionId || `opencode-${Date.now()}`;

    const settleOnce = (callback) => {
      if (settled) return;
      settled = true;
      activeOpenCodeProcesses.delete(processKey);
      callback();
    };

    try {
      const stat = fs.statSync(workingDir);
      if (!stat.isDirectory()) {
        sendOpenCodeMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: `OpenCode working directory is not a directory: ${workingDir}`,
          sessionId: capturedSessionId,
          provider: 'opencode',
        }));
        sendOpenCodeMessage(ws, createNormalizedMessage({
          kind: 'complete',
          exitCode: 1,
          sessionId: capturedSessionId,
          provider: 'opencode',
        }));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch {
      sendOpenCodeMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: `OpenCode project folder not found on disk: ${workingDir}`,
        sessionId: capturedSessionId,
        provider: 'opencode',
      }));
      sendOpenCodeMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: 1,
        sessionId: capturedSessionId,
        provider: 'opencode',
      }));
      settleOnce(() => resolve({ exitCode: 1 }));
      return;
    }

    try {
      const authStatus = await providerAuthService.getProviderAuthStatus('opencode');
      if (!authStatus.installed) {
        sendOpenCodeMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: 'OpenCode is not installed. Install via `brew install sst/tap/opencode` or see https://opencode.ai.',
          sessionId: capturedSessionId,
          provider: 'opencode',
        }));
        settleOnce(() => resolve({ exitCode: 1 }));
        return;
      }
    } catch {
      // Continue; spawn will fail naturally if missing.
    }

    const args = [
      'run',
      '--format', 'json',
      '--dangerously-skip-permissions',
      // Surface OpenCode's own warnings/errors on stderr so we can forward
      // them as status events. Without this the boot can stall silently for
      // 30-60s while plugins and the LLM provider initialize, leaving the
      // chat UI with no feedback at all.
      '--print-logs',
      '--log-level', 'WARN',
    ];

    if (model && model !== 'auto') {
      args.push('--model', model);
    }

    if (forkSessionId) {
      args.push('--session', forkSessionId, '--fork');
    } else if (capturedSessionId) {
      args.push('--session', capturedSessionId);
    }

    if (command && command.trim()) {
      args.push(command);
    }

    console.log('[OpenCode CLI] spawn args:', args.join(' '), 'cwd=', workingDir);

    // Emit an immediate status so the chat UI shows progress while OpenCode
    // boots its plugin chain. The first JSON event can take 30s+ on cold runs.
    sendOpenCodeMessage(ws, createNormalizedMessage({
      kind: 'status',
      content: 'Starting OpenCode…',
      sessionId: capturedSessionId,
      provider: 'opencode',
    }));

    const proc = spawnFunction('opencode', args, {
      cwd: workingDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    activeOpenCodeProcesses.set(processKey, proc);

    // Periodic heartbeat while we wait for OpenCode's first event so the
    // chat UI doesn't appear frozen during the cold-boot window.
    const heartbeat = setInterval(() => {
      if (producedAnyEvent) {
        clearInterval(heartbeat);
        return;
      }
      sendOpenCodeMessage(ws, createNormalizedMessage({
        kind: 'status',
        content: 'OpenCode is still booting…',
        sessionId: capturedSessionId,
        provider: 'opencode',
      }));
    }, 15000);

    let buffer = '';
    let stderrBuffer = '';
    let producedAnyEvent = false;
    let stdoutByteCount = 0;
    const eventTypeCounts = {};

    proc.stdout.on('data', (data) => {
      stdoutByteCount += data.length;
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          // Phase 1: surface non-JSON lines as plain text so users see something.
          sendOpenCodeMessage(ws, createNormalizedMessage({
            kind: 'stream_delta',
            content: line,
            sessionId: capturedSessionId,
            provider: 'opencode',
          }));
          continue;
        }

        producedAnyEvent = true;
        const evType = (event && event.type) || 'unknown';
        eventTypeCounts[evType] = (eventTypeCounts[evType] || 0) + 1;

        // Capture session id from the first event that carries one so resume works.
        const candidateSessionId = event?.sessionID || event?.session_id || event?.session?.id;
        if (candidateSessionId && !capturedSessionId) {
          capturedSessionId = candidateSessionId;
          activeOpenCodeProcesses.delete(processKey);
          processKey = capturedSessionId;
          activeOpenCodeProcesses.set(processKey, proc);
          sendOpenCodeMessage(ws, createNormalizedMessage({
            kind: 'session_created',
            newSessionId: capturedSessionId,
            sessionId: capturedSessionId,
            provider: 'opencode',
          }));
          // OpenCode persists to its own SQLite DB, so the chokidar file
          // watcher never sees a new session. Manually trigger a sync +
          // sidebar refresh so the new session appears immediately.
          triggerProviderSessionsRefresh('opencode', capturedSessionId, 'add').catch((err) => {
            console.warn('[OpenCode CLI] sidebar refresh failed:', err?.message || err);
          });
        }

        const normalized = sessionsService.normalizeMessage('opencode', event, capturedSessionId);
        for (const msg of normalized) {
          sendOpenCodeMessage(ws, msg);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderrBuffer += text;
      const trimmed = text.trim();
      if (!trimmed) return;
      sendOpenCodeMessage(ws, createNormalizedMessage({
        kind: 'status',
        content: trimmed,
        sessionId: capturedSessionId,
        provider: 'opencode',
      }));
    });

    proc.on('error', (error) => {
      clearInterval(heartbeat);
      const isMissing = error?.code === 'ENOENT';
      if (!isMissing) {
        console.error('[OpenCode CLI] Process error:', error);
      }
      sendOpenCodeMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: isMissing
          ? 'OpenCode is not installed.'
          : `OpenCode process error: ${error.message}`,
        sessionId: capturedSessionId,
        provider: 'opencode',
      }));
      if (isMissing) {
        settleOnce(() => resolve({ exitCode: 127 }));
      } else {
        settleOnce(() => reject(error));
      }
    });

    proc.on('close', (exitCode) => {
      clearInterval(heartbeat);
      console.log('[OpenCode CLI] close exitCode=' + exitCode + ' stdoutBytes=' + stdoutByteCount + ' producedAnyEvent=' + producedAnyEvent + ' events=' + JSON.stringify(eventTypeCounts));

      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim());
          producedAnyEvent = true;
          const normalized = sessionsService.normalizeMessage('opencode', event, capturedSessionId);
          for (const msg of normalized) {
            sendOpenCodeMessage(ws, msg);
          }
        } catch {
          sendOpenCodeMessage(ws, createNormalizedMessage({
            kind: 'stream_delta',
            content: buffer,
            sessionId: capturedSessionId,
            provider: 'opencode',
          }));
        }
      }

      if (!producedAnyEvent) {
        const detail = stderrBuffer.trim() || `opencode exited with code ${exitCode ?? 0} and produced no output`;
        console.warn('[OpenCode CLI] no JSON output. stderr:', detail.slice(0, 500));
        sendOpenCodeMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: detail,
          sessionId: capturedSessionId,
          provider: 'opencode',
        }));
      }

      sendOpenCodeMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: exitCode ?? 0,
        sessionId: capturedSessionId,
        provider: 'opencode',
      }));

      if (exitCode !== 0 && exitCode !== null) {
        notifyRunFailed({ provider: 'opencode', sessionId: capturedSessionId, error: `OpenCode exited with code ${exitCode}` });
      } else {
        notifyRunStopped({ provider: 'opencode', sessionId: capturedSessionId });
      }

      // Final refresh after the turn completes so the sidebar picks up the
      // updated title / time_updated for this session.
      if (capturedSessionId) {
        triggerProviderSessionsRefresh('opencode', capturedSessionId, 'change').catch((err) => {
          console.warn('[OpenCode CLI] post-turn sidebar refresh failed:', err?.message || err);
        });
      }

      settleOnce(() => resolve({ exitCode: exitCode ?? 0 }));
    });
  });
}

function abortOpenCodeSession(sessionId) {
  const proc = activeOpenCodeProcesses.get(sessionId);
  if (!proc) {
    return false;
  }
  try {
    proc.kill('SIGTERM');
    activeOpenCodeProcesses.delete(sessionId);
    return true;
  } catch {
    return false;
  }
}

function isOpenCodeSessionActive(sessionId) {
  return activeOpenCodeProcesses.has(sessionId);
}

function getActiveOpenCodeSessions() {
  return Array.from(activeOpenCodeProcesses.keys());
}

export {
  spawnOpenCode,
  abortOpenCodeSession,
  isOpenCodeSessionActive,
  getActiveOpenCodeSessions,
};
