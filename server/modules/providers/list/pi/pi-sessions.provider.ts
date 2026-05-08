import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

import type { IProviderSessions } from '@/shared/interfaces.js';
import type { AnyRecord, FetchHistoryOptions, FetchHistoryResult, NormalizedMessage } from '@/shared/types.js';
import { createNormalizedMessage, generateMessageId, readObjectRecord } from '@/shared/utils.js';

const PROVIDER = 'pi';

function getPiSessionDir(projectPath: string): string {
  const cleanPath = (projectPath || process.cwd()).replace(/[^\x20-\x7E]/g, '').trim();
  const encodedPath = cleanPath.replace(/[^a-zA-Z0-9-]/g, '-');
  return path.join(os.homedir(), '.pi', 'agent', 'sessions', encodedPath);
}

function findSessionFile(sessionId: string, projectPath: string): string | null {
  const sessionDir = getPiSessionDir(projectPath);
  if (!fs.existsSync(sessionDir)) {
    return null;
  }
  const files = fs.readdirSync(sessionDir);
  const match = files.find((f) => f.includes(sessionId) && f.endsWith('.jsonl'));
  return match ? path.join(sessionDir, match) : null;
}

type PiMessageContent = {
  type: string;
  text?: string;
  thinking?: string;
  toolCallId?: string;
  toolName?: string;
  arguments?: AnyRecord;
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
    if (part.type === 'toolCall' && part.toolCallId && part.toolName) {
      calls.push({
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        arguments: part.arguments ?? {},
      });
    }
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
        isError: false,
      });
    }
  }
  return results;
}

export class PiSessionsProvider implements IProviderSessions {
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

    if (raw.type === 'message_start' && raw.message) {
      const msg = raw.message as AnyRecord;
      const role = msg.role === 'user' ? 'user' : 'assistant';
      const content = msg.content as PiMessageContent[] | undefined;
      const text = extractTextFromContent(content);

      if (text) {
        messages.push(createNormalizedMessage({
          id: generateMessageId('pi'),
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
            id: generateMessageId('pi'),
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
            id: generateMessageId('pi'),
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
          id: generateMessageId('pi'),
          sessionId: sessionId ?? '',
          timestamp: new Date().toISOString(),
          provider: PROVIDER,
          kind: 'thinking',
          content: String(event.delta),
        }));
      }
      if (event.type === 'text_delta' && event.delta) {
        messages.push(createNormalizedMessage({
          id: generateMessageId('pi'),
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
      console.error(`[PiProvider] Failed to load session ${sessionId}:`, error);
      return { messages: [], total: 0, hasMore: false, offset: 0, limit: null };
    }
  }
}
