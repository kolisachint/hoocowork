import type { AhoocodeErrorPayload } from './types';

export async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function resolveAhoocodeErrorMessage(payload: AhoocodeErrorPayload | null, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  return payload.error ?? payload.message ?? fallback;
}
