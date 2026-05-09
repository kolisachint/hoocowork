import { spawn } from 'node:child_process';

import { providerAuthService } from '@/modules/providers/services/provider-auth.service.js';

type PiModel = {
  provider: string;
  model: string;
  id: string;
  context: string | null;
  maxOutput: string | null;
  thinking: boolean;
  images: boolean;
};

type CacheEntry = {
  fetchedAt: number;
  models: PiModel[];
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const PI_LIST_TIMEOUT_MS = 8000;
let cache: CacheEntry | null = null;
let inflight: Promise<PiModel[]> | null = null;

const toBoolean = (raw: string): boolean => raw.trim().toLowerCase() === 'yes';

const parsePiListOutput = (raw: string): PiModel[] => {
  const lines = raw.split('\n').map((l) => l.replace(/\s+$/, '')).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const header = lines[0];
  if (!/^provider\s+model/i.test(header)) {
    return [];
  }

  const out: PiModel[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(/\s{2,}/);
    if (cols.length < 2) {
      continue;
    }
    const [provider, model, context, maxOutput, thinking, images] = cols;
    if (!provider || !model) {
      continue;
    }
    out.push({
      provider: provider.trim(),
      model: model.trim(),
      id: `${provider.trim()}/${model.trim()}`,
      context: context?.trim() || null,
      maxOutput: maxOutput?.trim() || null,
      thinking: thinking ? toBoolean(thinking) : false,
      images: images ? toBoolean(images) : false,
    });
  }
  return out;
};

const runPiListModels = (): Promise<PiModel[]> =>
  new Promise((resolve, reject) => {
    const child = spawn('pi', ['--list-models'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        child.kill('SIGTERM');
      } catch {
        // ignore
      }
      reject(new Error(`pi --list-models timed out after ${PI_LIST_TIMEOUT_MS}ms`));
    }, PI_LIST_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (err) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`pi --list-models exited with code ${code}: ${stderr.trim() || 'no stderr'}`));
        return;
      }
      try {
        // Pi writes the model table to stdout when stdout is a TTY but to
        // stderr when invoked non-interactively (which is always for us).
        // Parse whichever stream actually contains the header row.
        const looksLikeTable = (text: string) => /\bprovider\s+model\b/i.test(text);
        const source = looksLikeTable(stdout) ? stdout : looksLikeTable(stderr) ? stderr : stdout;
        resolve(parsePiListOutput(source));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });

export type PiModelsResult = {
  installed: boolean;
  models: PiModel[];
  fetchedAt: string | null;
  cached: boolean;
};

class PiModelsService {
  async getModels({ force = false }: { force?: boolean } = {}): Promise<PiModelsResult> {
    const now = Date.now();
    if (!force && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
      return {
        installed: true,
        models: cache.models,
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
        cached: true,
      };
    }

    const installed = await providerAuthService.isProviderInstalled('pi');
    if (!installed) {
      return { installed: false, models: [], fetchedAt: null, cached: false };
    }

    if (!inflight) {
      inflight = runPiListModels()
        .then((models) => {
          cache = { fetchedAt: Date.now(), models };
          return models;
        })
        .finally(() => {
          inflight = null;
        });
    }

    const models = await inflight;
    return {
      installed: true,
      models,
      fetchedAt: cache ? new Date(cache.fetchedAt).toISOString() : null,
      cached: false,
    };
  }
}

export const piModelsService = new PiModelsService();
