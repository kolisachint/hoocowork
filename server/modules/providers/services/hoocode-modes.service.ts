import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type HoocodeMode = {
  name: string;
  description: string | null;
  systemPath: string;
};

const HOOCODE_MODES_DIR = path.join(os.homedir(), '.hoocode', 'modes');

const stripFrontmatter = (content: string): string => {
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      return content.slice(end + 4).replace(/^\s+/, '');
    }
  }
  return content;
};

const extractDescription = (content: string): string | null => {
  const body = stripFrontmatter(content).trim();
  if (!body) return null;
  const firstLine = body.split('\n').find((line) => line.trim().length > 0);
  if (!firstLine) return null;
  const cleaned = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
  return cleaned.length > 160 ? `${cleaned.slice(0, 157)}…` : cleaned;
};

const readSystemMd = async (modeName: string): Promise<{ description: string | null; systemPath: string } | null> => {
  const systemPath = path.join(HOOCODE_MODES_DIR, modeName, 'system.md');
  try {
    const content = await fs.readFile(systemPath, 'utf8');
    return { description: extractDescription(content), systemPath };
  } catch {
    return null;
  }
};

export const hoocodeModesService = {
  async listModes(): Promise<{ installed: boolean; modes: HoocodeMode[] }> {
    let entries: string[];
    try {
      entries = await fs.readdir(HOOCODE_MODES_DIR);
    } catch {
      return { installed: false, modes: [] };
    }

    const modes: HoocodeMode[] = [];
    for (const entry of entries.sort()) {
      const stat = await fs.stat(path.join(HOOCODE_MODES_DIR, entry)).catch(() => null);
      if (!stat?.isDirectory()) continue;
      const sysInfo = await readSystemMd(entry);
      if (!sysInfo) continue;
      modes.push({ name: entry, description: sysInfo.description, systemPath: sysInfo.systemPath });
    }

    return { installed: true, modes };
  },

  async getSystemPrompt(modeName: string): Promise<string | null> {
    if (!/^[a-z0-9][a-z0-9_-]{0,40}$/i.test(modeName)) return null;
    const systemPath = path.join(HOOCODE_MODES_DIR, modeName, 'system.md');
    try {
      return await fs.readFile(systemPath, 'utf8');
    } catch {
      return null;
    }
  },
};
