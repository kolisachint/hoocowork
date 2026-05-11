import { useCallback, useEffect, useRef, useState } from 'react';

import { authenticatedFetch } from '../../../utils/api';

export type PiModelOption = {
  value: string;
  label: string;
  provider: string;
  thinking: boolean;
  images: boolean;
  context: string | null;
};

type PiModelsResponse = {
  success: boolean;
  data?: {
    installed: boolean;
    models: Array<{
      provider: string;
      model: string;
      id: string;
      context: string | null;
      maxOutput: string | null;
      thinking: boolean;
      images: boolean;
    }>;
    fetchedAt: string | null;
    cached: boolean;
  };
  error?: { message?: string };
};

type UsePiModelsResult = {
  models: PiModelOption[];
  loading: boolean;
  error: string | null;
  installed: boolean;
  refresh: () => Promise<void>;
};

const toOption = (m: NonNullable<PiModelsResponse['data']>['models'][number]): PiModelOption => ({
  value: m.id,
  label: `${m.model} · ${m.provider}`,
  provider: m.provider,
  thinking: m.thinking,
  images: m.images,
  context: m.context,
});

export function usePiModels({ enabled = true }: { enabled?: boolean } = {}): UsePiModelsResult {
  const [models, setModels] = useState<PiModelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState(true);
  const fetchedOnceRef = useRef(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`/api/providers/pi/models${force ? '?force=true' : ''}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as PiModelsResponse;
      const data = payload.data;
      if (!payload.success || !data) {
        throw new Error(payload.error?.message || 'Failed to load Pi models');
      }
      setInstalled(data.installed);
      setModels(data.models.map(toOption));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load Pi models');
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
