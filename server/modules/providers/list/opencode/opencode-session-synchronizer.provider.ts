import os from 'node:os';
import path from 'node:path';

import { sessionsDb } from '@/modules/database/index.js';
import type { IProviderSessionSynchronizer } from '@/shared/interfaces.js';
import { normalizeSessionName } from '@/shared/utils.js';

const OPENCODE_DB_PATH = path.join(os.homedir(), '.local', 'share', 'opencode', 'opencode.db');

type OpenCodeSessionRow = {
  id: string;
  directory: string;
  title: string | null;
  time_created: number;
  time_updated: number;
};

function toIso(epochMillis: number | null | undefined): string {
  if (typeof epochMillis !== 'number' || !Number.isFinite(epochMillis)) {
    return new Date().toISOString();
  }
  return new Date(epochMillis).toISOString();
}

/**
 * Indexes OpenCode sessions from its SQLite store into the shared sessions DB.
 *
 * OpenCode persists conversations under `~/.local/share/opencode/opencode.db`;
 * we treat the `session` table as the source of truth and copy
 * `id/directory/title/time_*` into the cross-provider sessions index used by
 * the sidebar. Heavy data (messages/parts) stays in OpenCode's DB and is
 * loaded on demand by `OpenCodeSessionsProvider.fetchHistory`.
 */
export class OpenCodeSessionSynchronizer implements IProviderSessionSynchronizer {
  private readonly provider = 'opencode' as const;

  async synchronize(_since?: Date): Promise<number> {
    // The shared `scan_state.last_scanned_at` cursor is global, so honoring it
    // here would skip backfill on the first boot after OpenCode is introduced.
    // The session table is small and the UPSERT is cheap, so always full-scan.
    let rows: OpenCodeSessionRow[];
    try {
      const { default: Database } = await import('better-sqlite3');
      const db = new Database(OPENCODE_DB_PATH, { readonly: true, fileMustExist: true });
      try {
        rows = db
          .prepare<[], OpenCodeSessionRow>(
            `SELECT id, directory, title, time_created, time_updated
             FROM session
             ORDER BY time_updated ASC`,
          )
          .all();
      } finally {
        db.close();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // ENOENT is normal — opencode just isn't installed/used on this host.
      if (!/ENOENT|fileMustExist|unable to open/i.test(message)) {
        console.warn('[OpenCodeSync] failed to read opencode.db:', message);
      }
      return 0;
    }

    let processed = 0;
    for (const row of rows) {
      // OpenCode allows directory="" for global sessions; skip those rather
      // than registering an empty project path that would confuse the sidebar.
      if (!row.directory || !row.directory.trim()) {
        continue;
      }

      const sessionName = normalizeSessionName(row.title ?? undefined, 'Untitled OpenCode Session');
      sessionsDb.createSession(
        row.id,
        this.provider,
        row.directory,
        sessionName,
        toIso(row.time_created),
        toIso(row.time_updated),
        // Heavy data lives in OpenCode's SQLite store; keep jsonl_path null
        // since fetchHistory queries the DB directly.
        null,
      );
      processed += 1;
    }

    return processed;
  }

  /**
   * OpenCode does not write per-session JSONL files, so the filesystem watcher
   * never fires `synchronizeFile` for it. Implementing it as a no-op keeps the
   * watcher orchestration generic without forcing a special-case branch.
   */
  async synchronizeFile(_filePath: string): Promise<string | null> {
    return null;
  }
}
