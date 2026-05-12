import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { sessionsDb } from '@/modules/database/index.js';
import {
  extractFirstValidJsonlData,
  findFilesRecursivelyCreatedAfter,
  normalizeSessionName,
  readFileTimestamps,
} from '@/shared/utils.js';
import type { IProviderSessionSynchronizer } from '@/shared/interfaces.js';
import type { AnyRecord } from '@/shared/types.js';

const PI_UNTITLED = 'Untitled Hoocode Session';

function getPiSessionsRoot(): string {
  return path.join(os.homedir(), '.hoocode', 'agent', 'sessions');
}

type ParsedPiSession = {
  sessionId: string;
  projectPath: string;
};

/**
 * Reads the first JSONL line of a Pi rollout to extract the session id and
 * the absolute cwd. Pi writes a `{"type":"session", id, cwd}` header as the
 * first record, which is far more reliable than decoding the slug-encoded
 * directory name (slug encoding is lossy and can't be inverted to a real path).
 */
async function parseSessionHeader(filePath: string): Promise<ParsedPiSession | null> {
  return extractFirstValidJsonlData<ParsedPiSession>(filePath, (raw) => {
    const data = raw as AnyRecord;
    if (data?.type !== 'session') return null;
    const sessionId = typeof data.id === 'string' ? data.id : null;
    const projectPath = typeof data.cwd === 'string' ? data.cwd : null;
    if (!sessionId || !projectPath) return null;
    return { sessionId, projectPath };
  });
}

/**
 * Pi rollouts persist messages as `{"type":"message", message:{role, content}}`.
 * The first user-text content makes a useful session title in the sidebar.
 */
async function extractFirstUserText(filePath: string): Promise<string | undefined> {
  try {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    let buffer = '';
    let result: string | undefined;
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const entry = JSON.parse(trimmed) as AnyRecord;
            if (entry.type !== 'message') continue;
            const msg = entry.message as AnyRecord | undefined;
            if (msg?.role !== 'user') continue;
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const part of content) {
              if (part?.type === 'text' && typeof part.text === 'string' && part.text.trim()) {
                result = part.text;
                stream.destroy();
                resolve();
                return;
              }
            }
          } catch {
            // skip malformed lines
          }
        }
      });
      stream.on('end', () => resolve());
      stream.on('error', (err) => reject(err));
      stream.on('close', () => resolve());
    });
    return result;
  } catch {
    return undefined;
  }
}

export class HoocodeSessionSynchronizer implements IProviderSessionSynchronizer {
  private readonly provider = 'hoocode' as const;

  async synchronize(_since?: Date): Promise<number> {
    const root = getPiSessionsRoot();
    if (!fs.existsSync(root)) {
      return 0;
    }

    // Pi files are not append-immutable across runs (a fork rewrites files), so
    // a full rescan is cheap and keeps project_path/custom_name in sync.
    const files = await findFilesRecursivelyCreatedAfter(root, '.jsonl', null);

    let count = 0;
    for (const filePath of files) {
      const indexed = await this.synchronizeFile(filePath);
      if (indexed) count += 1;
    }
    return count;
  }

  async synchronizeFile(filePath: string): Promise<string | null> {
    if (!filePath.endsWith('.jsonl')) {
      return null;
    }

    const parsed = await parseSessionHeader(filePath);
    if (!parsed) {
      return null;
    }

    const existing = sessionsDb.getSessionById(parsed.sessionId);
    let sessionName = existing?.custom_name ?? undefined;
    if (!sessionName || sessionName === PI_UNTITLED) {
      const firstUserText = await extractFirstUserText(filePath);
      sessionName = normalizeSessionName(firstUserText, PI_UNTITLED);
    }

    const timestamps = await readFileTimestamps(filePath);
    sessionsDb.createSession(
      parsed.sessionId,
      this.provider,
      parsed.projectPath,
      sessionName,
      timestamps.createdAt,
      timestamps.updatedAt,
      filePath,
    );

    return parsed.sessionId;
  }
}
