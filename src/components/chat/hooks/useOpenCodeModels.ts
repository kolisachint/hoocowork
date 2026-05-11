import { useCallback, useEffect, useRef, useState } from 'react';

import { authenticatedFetch } from '../../../utils/api';

export type OpenCodeModelOption = {
  value: string;
  label: string;
  provider: string;
};

type OpenCodeModelsResponse = {
  success: boolean;
  data?: {
    installed: boolean;
    models: Array<{
      provider: string;
      model: string;
      id: string;
    }>;
    fetchedAt: string | null;
    cached: boolean;
  };
  error?: { message?: string };
};

type UseOpenCodeModelsResult = {
  models: OpenCodeModelOption[];
  loading: boolean;
  error: string | null;
  installed: boolean;
  refresh: () => Promise<void>;
};

const toOption = (m: NonNullable<OpenCodeModelsResponse['data']>['models'][number]): OpenCodeModelOption => ({
  value: m.id,
  label: `${m.model} · ${m.provider}`,
  provider: m.provider,
});

export function useOpenCodeModels({ enabled = true }: { enabled?: boolean } = {}): UseOpenCodeModelsResult {
  const [models, setModels] = useState<OpenCodeModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState(true);
  const fetchedOnceRef = useRef(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`/api/providers/opencode/models${force ? '?force=true' : ''}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as OpenCodeModelsResponse;
      const data = payload.data;
      if (!payload.success || !data) {
        throw new Error(payload.error?.message || 'Failed to load OpenCode models');
      }
      setInstalled(data.installed);
      setModels(data.models.map(toOption));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load OpenCode models');
    } finally {
      setLoading(false);
      fetchedOnceRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!enabled || fetchedOnceRef.current) {
      return;
    }
    void load(false);
  }, [enabled, load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return { models, loading, error, installed, refresh };
}
