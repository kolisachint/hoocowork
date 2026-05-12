import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

import { sessionsDb } from '@/modules/database/index.js';
import type { IProviderSessions } from '@/shared/interfaces.js';
import type { AnyRecord, FetchHistoryOptions, FetchHistoryResult, NormalizedMessage } from '@/shared/types.js';
import { createNormalizedMessage, generateMessageId, readObjectRecord } from '@/shared/utils.js';

const PROVIDER = 'hoocode';

/**
 * Hoocode rollouts live under ~/.hoocode/agent/sessions/<slug>/<timestamp>_<id>.jsonl, but
 * the slug-encoded folder name is lossy (path separators collapse to `-`) and
 * cannot be reliably reversed to a real cwd. The synchronizer persists the
 * jsonl_path on the session row, so prefer that. Fall back to a directory scan
 * only when the row is missing or the file has moved.
 */
function findSessionFile(sessionId: string, projectPath: string): string | null {
  const indexed = sessionsDb.getSessionById(sessionId)?.jsonl_path;
  if (indexed && fs.existsSync(indexed)) {
    return indexed;
  }

  const root = path.join(os.homedir(), '.hoocode', 'agent', 'sessions');
  if (!fs.existsSync(root)) return null;

  const cleanPath = (projectPath || '').replace(/[^\x20-\x7E]/g, '').trim();
  const encodedPath = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9-]/g, '-') : '';
  const candidates = encodedPath
    ? [path.join(root, encodedPath)]
    : fs.readdirSync(root).map((d) => path.join(root, d));

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    const match = files.find((f) => f.includes(sessionId) && f.endsWith('.jsonl'));
    if (match) return path.join(dir, match);
  }
  return null;
}

type PiMessageContent = {
  type: string;
  text?: string;
  thinking?: string;
  toolCallId?: string;
  toolName?: string;
  arguments?: AnyRecord;
  id?: string;
  name?: string;
  isError?: boolean;
  content?: unknown;
};

function extractTextFromContent(content: PiMessageContent[] | string | undefined): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  const parts: string[] = [];
  for (const part of content) {
    if (part.type === 'text' && part.text) {
      parts.push(part.text);
    } else if (part.type === 'thinking' && part.thinking) {
      parts.push(part.thinking);
    }
  }
  return parts.join('\n');
}

function extractToolCalls(content: PiMessageContent[] | undefined): Array<{ toolCallId: string; toolName: string; arguments: AnyRecord }> {
  if (!content || typeof content === 'string') return [];
  const calls: Array<{ toolCallId: string; toolName: string; arguments: AnyRecord }> = [];
  for (const part of content) {
    if (part.type !== 'toolCall') continue;
    // Live --mode json events use toolCallId/toolName; on-disk rollout entries
    // use id/name. Accept both shapes so streaming and history both work.
    const toolCallId = part.toolCallId ?? part.id;
    const toolName = part.toolName ?? part.name;
    if (!toolCallId || !toolName) continue;
    calls.push({
      toolCallId,
      toolName,
      arguments: part.arguments ?? {},
    });
  }
  return calls;
}

function extractToolResults(content: PiMessageContent[] | undefined): Array<{ toolCallId: string; text: string; isError: boolean }> {
  if (!content || typeof content === 'string') return [];
  const results: Array<{ toolCallId: string; text: string; isError: boolean }> = [];
  for (const part of content) {
    if (part.type === 'toolResult' && part.toolCallId) {
      results.push({
        toolCallId: part.toolCallId,
        text: part.text ?? '',
        isError: Boolean(part.isError),
      });
    }
  }
  return results;
}

/**
 * Pi rollouts wrap a `toolResult` reply in a top-level message with
 * `role: 'toolResult'`, where the result text lives in `message.content`
 * (an array of `{type:'text', text}` parts).
 */
function flattenToolResultMessageContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const record = part as PiMessageContent;
      if (record.type === 'text' && typeof record.text === 'string') return record.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export class HoocodeSessionsProvider implements IProviderSessions {
  normalizeMessage(rawMessage: unknown, sessionId: string | null): NormalizedMessage[] {
    const raw = readObjectRecord(rawMessage);
    if (!raw) return [];

    const messages: NormalizedMessage[] = [];

    if (raw.type === 'session' && raw.id) {
      messages.push(createNormalizedMessage({
        kind: 'session_created',
        sessionId: String(raw.id),
        provider: PROVIDER,
        newSessionId: String(raw.id),
      }));
      return messages;
    }

    // On-disk rollout entries persist messages as `{type:"message", message:{role, content}}`
    // and are NOT split into start/update/end like the live --mode json events.
    // History reads see only this shape, so handle it explicitly to populate
    // user/assistant text, tool calls, tool results, and thinking content.
    if (raw.type === 'message' && raw.message) {
      const msg = raw.message as AnyRecord;
      const role = msg.role as string | undefined;
      const ts = (raw.timestamp as string | undefined)
        ?? (typeof msg.timestamp === 'number' ? new Date(msg.timestamp).toISOString() : undefined)
        ?? new Date().toISOString();
      const messageId = (raw.id as string | undefined) ?? generateMessageId('hoocode');
      const parentId = raw.parentId as string | undefined;

      if (role === 'user' || role === 'assistant') {
        const content = msg.content as PiMessageContent[] | string | undefined;
        const text = extractTextFromContent(content);

        if (role === 'assistant' && Array.isArray(content)) {
          for (const part of content) {
            if (part?.type === 'thinking' && typeof part.thinking === 'string' && part.thinking.trim()) {
              messages.push(createNormalizedMessage({
                id: generateMessageId('hoocode'),
                sessionId,
                timestamp: ts,
                provider: PROVIDER,
                kind: 'thinking',
                content: part.thinking,
                parentId,
              }));
            }
          }
        }

        if (text) {
          messages.push(createNormalizedMessage({
            id: messageId,
            sessionId,
            timestamp: ts,
            provider: PROVIDER,
            kind: 'text',
            role: role === 'user' ? 'user' : 'assistant',
            content: text,
            parentId,
            messageId,
          }));
        }

        if (role === 'assistant') {
          for (const tc of extractToolCalls(Array.isArray(content) ? content : undefined)) {
            messages.push(createNormalizedMessage({
              id: tc.toolCallId,
              sessionId,
              timestamp: ts,
              provider: PROVIDER,
              kind: 'tool_use',
              toolName: tc.toolName,
              toolInput: tc.arguments,
              toolId: tc.toolCallId,
              parentId: messageId,
            }));
          }
        }

        return messages;
      }

      if (role === 'toolResult') {
        const toolCallId = typeof msg.toolCallId === 'string' ? msg.toolCallId : '';
        const text = flattenToolResultMessageContent(msg.content);
        messages.push(createNormalizedMessage({
          id: messageId,
          sessionId,
          timestamp: ts,
          provider: PROVIDER,
          kind: 'tool_result',
          toolId: toolCallId,
          content: text,
          isError: Boolean(msg.isError),
          parentId,
        }));
        return messages;
      }

      return messages;
    }

    // Skip rollout-only metadata entries that have no chat representation.
    if (
      raw.type === 'model_change'
      || raw.type === 'thinking_level_change'
      || raw.type === 'custom'
      || raw.type === 'compaction'
      || raw.type === 'agent_start'
      || raw.type === 'agent_end'
      || raw.type === 'turn_start'
      || raw.type === 'turn_end'
    ) {
      return messages;
    }

    if (raw.type === 'message_start' && raw.message) {
      const msg = raw.message as AnyRecord;
      const role = msg.role === 'user' ? 'user' : 'assistant';
      const content = msg.content as PiMessageContent[] | undefined;
      const text = extractTextFromContent(content);

      if (text) {
        messages.push(createNormalizedMessage({
          id: generateMessageId('hoocode'),
          sessionId: sessionId ?? '',
          timestamp: new Date().toISOString(),
          provider: PROVIDER,
          kind: 'text',
          role,
          content: text,
          parentId: raw.parentId as string | undefined,
          messageId: raw.id as string | undefined,
        }));
      }

      if (role === 'assistant') {
        const toolCalls = extractToolCalls(content);
        for (const tc of toolCalls) {
          messages.push(createNormalizedMessage({
            id: generateMessageId('hoocode'),
            sessionId: sessionId ?? '',
            timestamp: new Date().toISOString(),
            provider: PROVIDER,
            kind: 'tool_use',
            toolName: tc.toolName,
            toolInput: tc.arguments,
            toolId: tc.toolCallId,
            parentId: raw.id as string | undefined,
          }));
        }
      }

      if (role === 'user') {
        const toolResults = extractToolResults(content);
        for (const tr of toolResults) {
          messages.push(createNormalizedMessage({
            id: generateMessageId('hoocode'),
            sessionId: sessionId ?? '',
            timestamp: new Date().toISOString(),
            provider: PROVIDER,
            kind: 'tool_result',
            toolId: tr.toolCallId,
            content: tr.text,
            isError: tr.isError,
            parentId: raw.id as string | undefined,
          }));
        }
      }

      return messages;
    }

    if (raw.type === 'message_update' && raw.assistantMessageEvent) {
      const event = raw.assistantMessageEvent as AnyRecord;
      if (event.type === 'thinking_delta' && event.delta) {
        messages.push(createNormalizedMessage({
          id: generateMessageId('hoocode'),
          sessionId: sessionId ?? '',
          timestamp: new Date().toISOString(),
          provider: PROVIDER,
          kind: 'thinking',
          content: String(event.delta),
        }));
      }
      if (event.type === 'text_delta' && event.delta) {
        messages.push(createNormalizedMessage({
          id: generateMessageId('hoocode'),
          sessionId: sessionId ?? '',
          timestamp: new Date().toISOString(),
          provider: PROVIDER,
          kind: 'stream_delta',
          content: String(event.delta),
        }));
      }
      return messages;
    }

    if (raw.type === 'message_end') {
      // Emit the final consolidated assistant message so the chat renders the
      // full response. The streaming deltas alone aren't displayed by the
      // client; without a final 'text' kind the conversation looks empty.
      const msg = raw.message as AnyRecord | undefined;
      if (msg && msg.role === 'assistant') {
        const content = msg.content as PiMessageContent[] | undefined;
        const finalText = extractTextFromContent(content);
        if (finalText) {
          messages.push(createNormalizedMessage({
            id: generateMessageId('hoocode'),
            sessionId: sessionId ?? '',
            timestamp: new Date().toISOString(),
            provider: PROVIDER,
            kind: 'text',
            role: 'assistant',
            content: finalText,
            parentId: raw.parentId as string | undefined,
            messageId: raw.id as string | undefined,
          }));
        }
        // Also emit any tool calls that landed in the final message.
        const toolCalls = extractToolCalls(content);
        for (const tc of toolCalls) {
          messages.push(createNormalizedMessage({
            id: generateMessageId('hoocode'),
            sessionId: sessionId ?? '',
            timestamp: new Date().toISOString(),
            provider: PROVIDER,
            kind: 'tool_use',
            toolName: tc.toolName,
            toolInput: tc.arguments,
            toolId: tc.toolCallId,
            parentId: raw.id as string | undefined,
          }));
        }
      }
      messages.push(createNormalizedMessage({
        kind: 'stream_end',
        sessionId: sessionId ?? '',
        provider: PROVIDER,
      }));
      return messages;
    }

    return messages;
  }

  async fetchHistory(sessionId: string, options: FetchHistoryOptions = {}): Promise<FetchHistoryResult> {
    const { limit = null, offset = 0, projectPath = '' } = options;

    const sessionFile = findSessionFile(sessionId, projectPath);
    if (!sessionFile) {
      return { messages: [], total: 0, hasMore: false, offset: 0, limit: null };
    }

    try {
      const entries: AnyRecord[] = [];
      const fileStream = fs.createReadStream(sessionFile);
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      for await (const line of rl) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line) as AnyRecord;
          entries.push(entry);
        } catch {
          // skip malformed lines
        }
      }

      const normalized: NormalizedMessage[] = [];
      for (const entry of entries) {
        normalized.push(...this.normalizeMessage(entry, sessionId));
      }

      // Attach tool_result content onto its originating tool_use so the chat UI
      // can render call+result inline (mirrors the codex history pipeline).
      const toolResultMap = new Map<string, NormalizedMessage>();
      for (const msg of normalized) {
        if (msg.kind === 'tool_result' && msg.toolId) {
          toolResultMap.set(msg.toolId, msg);
        }
      }
      for (const msg of normalized) {
        if (msg.kind === 'tool_use' && msg.toolId && toolResultMap.has(msg.toolId)) {
          const toolResult = toolResultMap.get(msg.toolId);
          if (toolResult) {
            msg.toolResult = { content: toolResult.content, isError: toolResult.isError };
          }
        }
      }

      const total = normalized.length;
      let paginated = normalized;
      let hasMore = false;

      if (limit !== null) {
        const startIndex = Math.max(0, total - offset - limit);
        const endIndex = total - offset;
        paginated = normalized.slice(startIndex, endIndex);
        hasMore = startIndex > 0;
      }

      return {
        messages: paginated,
        total,
        hasMore,
        offset: offset + paginated.length,
        limit,
      };
    } catch (error) {
      console.error(`[HoocodeProvider] Failed to load session ${sessionId}:`, error);
      return { messages: [], total: 0, hasMore: false, offset: 0, limit: null };
    }
  }
}
