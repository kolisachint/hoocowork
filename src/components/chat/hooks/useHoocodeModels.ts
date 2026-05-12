import { useCallback, useEffect, useRef, useState } from 'react';

import { authenticatedFetch } from '../../../utils/api';

export type HoocodeModelOption = {
  value: string;
  label: string;
  provider: string;
  thinking: boolean;
  images: boolean;
  context: string | null;
};

type HoocodeModelsResponse = {
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

type UseHoocodeModelsResult = {
  models: HoocodeModelOption[];
  loading: boolean;
  error: string | null;
  installed: boolean;
  refresh: () => Promise<void>;
};

const toOption = (m: NonNullable<HoocodeModelsResponse['data']>['models'][number]): HoocodeModelOption => ({
  value: m.id,
  label: `${m.model} · ${m.provider}`,
  provider: m.provider,
  thinking: m.thinking,
  images: m.images,
  context: m.context,
});

export function useHoocodeModels({ enabled = true }: { enabled?: boolean } = {}): UseHoocodeModelsResult {
  const [models, setModels] = useState<HoocodeModelOption[]>([]);
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
      const payload = (await response.json()) as HoocodeModelsResponse;
      const data = payload.data;
      if (!payload.success || !data) {
        throw new Error(payload.error?.message || 'Failed to load Hoocode models');
      }
      setInstalled(data.installed);
      setModels(data.models.map(toOption));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load Hoocode models');
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
