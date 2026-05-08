import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import type { IProviderSessionSynchronizer } from '@/shared/interfaces.js';
import { sessionsDb } from '@/modules/database/index.js';

function getPiSessionsRoot(): string {
  return path.join(os.homedir(), '.pi', 'agent', 'sessions');
}

function extractSessionIdFromFilename(filename: string): string | null {
  const match = filename.match(/_([a-f0-9-]+)\.jsonl$/i);
  return match ? match[1] : null;
}

export class PiSessionSynchronizer implements IProviderSessionSynchronizer {
  async synchronize(_since?: Date): Promise<number> {
    const root = getPiSessionsRoot();
    if (!fs.existsSync(root)) {
      return 0;
    }

    let count = 0;
    const projectDirs = fs.readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const projectDir of projectDirs) {
      const projectPath = path.join(root, projectDir);
      const files = fs.readdirSync(projectPath)
        .filter((f) => f.endsWith('.jsonl'));

      for (const file of files) {
        const sessionId = extractSessionIdFromFilename(file);
        if (!sessionId) continue;

        const stats = fs.statSync(path.join(projectPath, file));
        const projectPathDecoded = projectDir.replace(/^--/, '').replace(/--/g, '/');

        sessionsDb.createSession(
          sessionId,
          'pi',
          projectPathDecoded,
          undefined,
          undefined,
          stats.mtime.toISOString(),
          path.join(projectPath, file),
        );
        count++;
      }
    }

    return count;
  }

  async synchronizeFile(filePath: string): Promise<string | null> {
    if (!filePath.endsWith('.jsonl')) {
      return null;
    }

    const sessionId = extractSessionIdFromFilename(path.basename(filePath));
    if (!sessionId) {
      return null;
    }

    const stats = fs.statSync(filePath);
    const projectDir = path.basename(path.dirname(filePath));
    const projectPathDecoded = projectDir.replace(/^--/, '').replace(/--/g, '/');

    sessionsDb.createSession(
      sessionId,
      'pi',
      projectPathDecoded,
      undefined,
      undefined,
      stats.mtime.toISOString(),
      filePath,
    );

    return sessionId;
  }
}
