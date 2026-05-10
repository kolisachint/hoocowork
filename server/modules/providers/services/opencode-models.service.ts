import { spawn } from 'node:child_process';

import { providerAuthService } from '@/modules/providers/services/provider-auth.service.js';

type OpenCodeModel = {
  provider: string;
  model: string;
  id: string;
};

type CacheEntry = {
  fetchedAt: number;
  models: OpenCodeModel[];
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const OPENCODE_LIST_TIMEOUT_MS = 8000;
let cache: CacheEntry | null = null;
let inflight: Promise<OpenCodeModel[]> | null = null;

/**
 * Parses `opencode models` stdout. Output is one identifier per line in
 * `provider/model` format (e.g. `opencode/claude-opus-4-7`). Lines without a
 * slash are skipped.
 */
const parseOpenCodeListOutput = (raw: string): OpenCodeModel[] => {
  const out: OpenCodeModel[] = [];
  for (const line of raw.split('\n')) {
    const id = line.trim();
    if (!id || !id.includes('/')) {
      continue;
    }
    const slashIndex = id.indexOf('/');
    const provider = id.slice(0, slashIndex);
    const model = id.slice(slashIndex + 1);
    if (!provider || !model) {
      continue;
    }
    out.push({ provider, model, id });
  }
  return out;
};

const runOpenCodeListModels = (): Promise<OpenCodeModel[]> =>
  new Promise((resolve, reject) => {
    const child = spawn('opencode', ['models'], {
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
      reject(new Error(`opencode models timed out after ${OPENCODE_LIST_TIMEOUT_MS}ms`));
    }, OPENCODE_LIST_TIMEOUT_MS);

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
        reject(new Error(`opencode models exited with code ${code}: ${stderr.trim() || 'no stderr'}`));
        return;
      }
      try {
        resolve(parseOpenCodeListOutput(stdout));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });

export type OpenCodeModelsResult = {
  installed: boolean;
  models: OpenCodeModel[];
  fetchedAt: string | null;
  cached: boolean;
};

class OpenCodeModelsService {
  async getModels({ force = false }: { force?: boolean } = {}): Promise<OpenCodeModelsResult> {
    const now = Date.now();
    if (!force && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
      return {
        installed: true,
        models: cache.models,
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
        cached: true,
      };
    }

    const installed = await providerAuthService.isProviderInstalled('opencode');
    if (!installed) {
      return { installed: false, models: [], fetchedAt: null, cached: false };
    }

    if (!inflight) {
      inflight = runOpenCodeListModels()
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

export const openCodeModelsService = new OpenCodeModelsService();
