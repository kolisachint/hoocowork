import os from 'node:os';
import path from 'node:path';

import type { IProviderSessions } from '@/shared/interfaces.js';
import type { AnyRecord, FetchHistoryOptions, FetchHistoryResult, NormalizedMessage } from '@/shared/types.js';
import { createNormalizedMessage, generateMessageId, readObjectRecord } from '@/shared/utils.js';

const PROVIDER = 'opencode';
const OPENCODE_DB_PATH = path.join(os.homedir(), '.local', 'share', 'opencode', 'opencode.db');

type OpenCodePartType =
  | 'text'
  | 'reasoning'
  | 'tool'
  | 'step-start'
  | 'step-finish'
  | 'patch'
  | 'subtask'
  | 'compaction'
  | string;

type OpenCodePart = AnyRecord & { type: OpenCodePartType };

type OpenCodeMessageRow = {
  id: string;
  session_id: string;
  time_created: number;
  data: string;
};

type OpenCodePartRow = {
  id: string;
  message_id: string;
  session_id: string;
  time_created: number;
  data: string;
};

function toIso(epochMillis: number | null | undefined): string {
  if (typeof epochMillis !== 'number' || !Number.isFinite(epochMillis)) {
    return new Date().toISOString();
  }
  return new Date(epochMillis).toISOString();
}

/**
 * Converts one persisted OpenCode `part` (typed JSON payload) into normalized
 * messages. `messageRole` comes from the parent message row so a `text` part
 * under a `user`-role message becomes a user `text` event rather than an
 * assistant one.
 */
function normalizePart(
  part: OpenCodePart,
  context: {
    sessionId: string | null;
    role: 'user' | 'assistant';
    messageId: string;
    timestamp: string;
  },
): NormalizedMessage[] {
  const baseId = part.id ? String(part.id) : `${context.messageId}_${generateMessageId('opencode')}`;
  const type = part.type;

  switch (type) {
    case 'text': {
      const text = typeof part.text === 'string' ? part.text : '';
      if (!text.trim()) {
        return [];
      }
      return [createNormalizedMessage({
        id: baseId,
        sessionId: context.sessionId,
        timestamp: context.timestamp,
        provider: PROVIDER,
        kind: 'text',
        role: context.role,
        content: text,
      })];
    }

    case 'reasoning': {
      const text = typeof part.text === 'string' ? part.text : '';
      if (!text.trim()) {
        return [];
      }
      return [createNormalizedMessage({
        id: baseId,
        sessionId: context.sessionId,
        timestamp: context.timestamp,
        provider: PROVIDER,
        kind: 'thinking',
        content: text,
      })];
    }

    case 'tool': {
      const state = readObjectRecord(part.state) ?? {};
      const status = typeof state.status === 'string' ? state.status : 'unknown';
      const toolName = typeof part.tool === 'string' ? part.tool : 'tool';
      const toolId = typeof part.callID === 'string' ? part.callID : baseId;
      const toolInput = state.input;

      const messages: NormalizedMessage[] = [createNormalizedMessage({
        id: baseId,
        sessionId: context.sessionId,
        timestamp: context.timestamp,
        provider: PROVIDER,
        kind: 'tool_use',
        toolName,
        toolInput,
        toolId,
      })];

      // For completed/error tool invocations, surface a paired tool_result so
      // the chat UI shows output the same way it does for Claude/Cursor.
      if (status === 'completed' || status === 'error') {
        const output = typeof state.output === 'string'
          ? state.output
          : state.output != null
            ? JSON.stringify(state.output)
            : typeof state.error === 'string'
              ? state.error
              : '';
        messages.push(createNormalizedMessage({
          id: `${baseId}_tr`,
          sessionId: context.sessionId,
          timestamp: context.timestamp,
          provider: PROVIDER,
          kind: 'tool_result',
          toolId,
          content: output,
          isError: status === 'error',
        }));
      }

      return messages;
    }

    case 'patch': {
      // OpenCode collapses file edits into a `patch` event listing changed
      // files; surface as a synthetic Edit tool_use so the existing tool
      // renderer can show it without a special-case branch.
      const files = Array.isArray(part.files) ? part.files.map(String) : [];
      return [createNormalizedMessage({
        id: baseId,
        sessionId: context.sessionId,
        timestamp: context.timestamp,
        provider: PROVIDER,
        kind: 'tool_use',
        toolName: 'Edit',
        toolInput: { files, hash: part.hash },
        toolId: baseId,
      })];
    }

    case 'subtask': {
      // Delegated agent runs — render as a TodoList-style tool_use.
      return [createNormalizedMessage({
        id: baseId,
        sessionId: context.sessionId,
        timestamp: context.timestamp,
        provider: PROVIDER,
        kind: 'tool_use',
        toolName: 'Task',
        toolInput: {
          agent: part.agent,
          description: part.description,
          command: part.command,
          model: part.model,
          prompt: part.prompt,
        },
        toolId: baseId,
      })];
    }

    case 'step-start':
    case 'step-finish':
    case 'compaction':
      // Bookkeeping events; not surfaced in chat. step-finish carries token
      // usage which is read separately by fetchHistory.
      return [];

    default: {
      // Unknown part kind — only surface if it carries a text payload, so we
      // never silently drop content but also don't spam the chat with empty
      // status frames.
      const text = typeof part.text === 'string'
        ? part.text
        : typeof part.content === 'string'
          ? part.content
          : '';
      if (!text.trim()) {
        return [];
      }
      return [createNormalizedMessage({
        id: baseId,
        sessionId: context.sessionId,
        timestamp: context.timestamp,
        provider: PROVIDER,
        kind: 'text',
        role: context.role,
        content: text,
      })];
    }
  }
}

export class OpenCodeSessionsProvider implements IProviderSessions {
  /**
   * Normalizes a live `opencode run --format json` event line.
   *
   * Two shapes coexist on the wire:
   *  - control envelopes like `{type:"error", sessionID, error:{...}}`
   *  - payload events that re-emit a persisted `part` (text/reasoning/tool/...)
   *
   * Both are handled here so the chat UI stays consistent with what the SQLite
   * store would replay on reload.
   */
  normalizeMessage(rawMessage: unknown, sessionId: string | null): NormalizedMessage[] {
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return [createNormalizedMessage({
        id: generateMessageId('opencode'),
        kind: 'stream_delta',
        content: rawMessage,
        sessionId,
        provider: PROVIDER,
      })];
    }

    const raw = readObjectRecord(rawMessage);
    if (!raw) {
      return [];
    }

    const eventSessionId = typeof raw.sessionID === 'string'
      ? raw.sessionID
      : sessionId;
    const timestamp = typeof raw.timestamp === 'number'
      ? toIso(raw.timestamp)
      : new Date().toISOString();
    const messageId = typeof raw.messageID === 'string'
      ? raw.messageID
      : generateMessageId('opencode');

    if (raw.type === 'error') {
      const errInfo = readObjectRecord(raw.error) ?? {};
      const errData = readObjectRecord(errInfo.data) ?? {};
      const message = typeof errData.message === 'string'
        ? errData.message
        : typeof errInfo.name === 'string'
          ? errInfo.name
          : 'OpenCode error';
      return [createNormalizedMessage({
        id: generateMessageId('opencode'),
        sessionId: eventSessionId,
        timestamp,
        provider: PROVIDER,
        kind: 'error',
        content: message,
      })];
    }

    // Payload events carry a persisted `part` shape inline. Try a `.part`
    // wrapper first (used by some bus events), then fall back to treating the
    // event itself as the part.
    const partLike = readObjectRecord(raw.part) ?? raw;
    if (typeof partLike.type === 'string') {
      const role: 'user' | 'assistant' = raw.role === 'user' ? 'user' : 'assistant';
      return normalizePart(partLike as OpenCodePart, {
        sessionId: eventSessionId,
        role,
        messageId,
        timestamp,
      });
    }

    return [];
  }

  /**
   * Loads persisted history for one OpenCode session from the SQLite store.
   *
   * OpenCode keeps each conversation as a `session` row whose body lives in
   * `message` (one per turn) and `part` (typed payloads under each message).
   * Pagination matches the Codex provider's "page from the end" semantics so
   * the chat UI's "load earlier" button works the same way.
   */
  async fetchHistory(
    sessionId: string,
    options: FetchHistoryOptions = {},
  ): Promise<FetchHistoryResult> {
    const { limit = null, offset = 0 } = options;

    let rows: OpenCodePartRow[];
    let messageRoles: Map<string, 'user' | 'assistant'>;
    try {
      const { default: Database } = await import('better-sqlite3');
      const db = new Database(OPENCODE_DB_PATH, { readonly: true, fileMustExist: true });
      try {
        const messageRows = db
          .prepare<[string], OpenCodeMessageRow>(
            `SELECT id, session_id, time_created, data
             FROM message
             WHERE session_id = ?
             ORDER BY time_created ASC, id ASC`,
          )
          .all(sessionId);

        messageRoles = new Map();
        for (const m of messageRows) {
          try {
            const parsed = JSON.parse(m.data) as AnyRecord;
            messageRoles.set(m.id, parsed.role === 'user' ? 'user' : 'assistant');
          } catch {
            messageRoles.set(m.id, 'assistant');
          }
        }

        rows = db
          .prepare<[string], OpenCodePartRow>(
            `SELECT id, message_id, session_id, time_created, data
             FROM part
             WHERE session_id = ?
             ORDER BY time_created ASC, id ASC`,
          )
          .all(sessionId);
      } finally {
        db.close();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[OpenCodeProvider] Failed to load session ${sessionId}:`, message);
      return { messages: [], total: 0, hasMore: false, offset: 0, limit: null };
    }

    const tokenUsage: { used: number; total: number } | null = (() => {
      // Pull the most recent step-finish to seed token-budget UI; matches
      // Codex's behavior of carrying usage on the history result.
      let latest: AnyRecord | null = null;
      for (const row of rows) {
        try {
          const part = JSON.parse(row.data) as AnyRecord;
          if (part.type === 'step-finish' && readObjectRecord(part.tokens)) {
            latest = part.tokens as AnyRecord;
          }
        } catch {
          // ignore
        }
      }
      if (!latest) return null;
      const totalTokens = (latest.input as number ?? 0) + (latest.output as number ?? 0)
        + (latest.reasoning as number ?? 0);
      return { used: typeof latest.total === 'number' ? latest.total : totalTokens, total: 200000 };
    })();

    const normalized: NormalizedMessage[] = [];
    const toolUseMap = new Map<string, NormalizedMessage>();
    for (const row of rows) {
      let part: OpenCodePart;
      try {
        part = JSON.parse(row.data) as OpenCodePart;
      } catch {
        continue;
      }

      const role = messageRoles.get(row.message_id) ?? 'assistant';
      const out = normalizePart(part, {
        sessionId,
        role,
        messageId: row.message_id,
        timestamp: toIso(row.time_created),
      });

      for (const msg of out) {
        if (msg.kind === 'tool_use' && msg.toolId) {
          toolUseMap.set(msg.toolId, msg);
        }
        normalized.push(msg);
      }
    }

    // Attach paired tool_results to their tool_use entries so the renderer
    // shows output inline (mirrors Cursor's normalization).
    for (const msg of normalized) {
      if (msg.kind === 'tool_result' && msg.toolId && toolUseMap.has(msg.toolId)) {
        const toolUse = toolUseMap.get(msg.toolId);
        if (toolUse) {
          toolUse.toolResult = { content: msg.content, isError: msg.isError };
        }
      }
    }

    const total = normalized.length;
    if (limit !== null) {
      const startIndex = Math.max(0, total - offset - limit);
      const endIndex = total - offset;
      return {
        messages: normalized.slice(startIndex, endIndex),
        total,
        hasMore: startIndex > 0,
        offset,
        limit,
        tokenUsage: tokenUsage ?? undefined,
      };
    }

    return {
      messages: normalized,
      total,
      hasMore: false,
      offset: 0,
      limit: null,
      tokenUsage: tokenUsage ?? undefined,
    };
  }
}
