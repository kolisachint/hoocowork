import { useCallback, useEffect, useRef, useState } from 'react';

import { authenticatedFetch } from '../../../utils/api';

export type HoocodeMode = {
  name: string;
  description: string | null;
};

type HoocodeModesResponse = {
  success: boolean;
  data?: {
    installed: boolean;
    modes: HoocodeMode[];
  };
  error?: { message?: string };
};

type UseHoocodeModesResult = {
  modes: HoocodeMode[];
  loading: boolean;
  error: string | null;
  installed: boolean;
  refresh: () => Promise<void>;
};

export function useHoocodeModes({ enabled = true }: { enabled?: boolean } = {}): UseHoocodeModesResult {
  const [modes, setModes] = useState<HoocodeMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState(true);
  const fetchedOnceRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('/api/providers/hoocode/modes');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as HoocodeModesResponse;
      const data = payload.data;
      if (!payload.success || !data) {
        throw new Error(payload.error?.message || 'Failed to load Hoocode modes');
      }
      setInstalled(data.installed);
      setModes(data.modes);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load Hoocode modes');
    } finally {
      setLoading(false);
      fetchedOnceRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!enabled || fetchedOnceRef.current) return;
    void load();
  }, [enabled, load]);

  return { modes, loading, error, installed, refresh: load };
}
