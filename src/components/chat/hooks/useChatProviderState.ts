import { useCallback, useEffect, useRef, useState } from 'react';

import { authenticatedFetch } from '../../../utils/api';
import { CLAUDE_MODELS, CODEX_MODELS, CURSOR_MODELS, GEMINI_MODELS, OPENCODE_MODELS, HOOCODE_MODELS } from '../../../../shared/modelConstants';
import type { PendingPermissionRequest, PermissionMode } from '../types/types';
import type { ProjectSession, LLMProvider } from '../../../types/app';

const getPermissionModesForProvider = (provider: LLMProvider, hoocodeModes?: string[]): PermissionMode[] => {
  if (provider === 'codex') {
    return ['default', 'acceptEdits', 'bypassPermissions'];
  }
  if (provider === 'claude') {
    return ['default', 'auto', 'acceptEdits', 'bypassPermissions', 'plan'];
  }
  if (provider === 'hoocode') {
    // Hoocode modes are dynamic (filesystem entries under ~/.hoocode/modes/).
    // Always include 'default' (no system-prompt override) plus whatever the
    // server discovered. Falls back to a known set when the list hasn't loaded.
    const dynamic = hoocodeModes && hoocodeModes.length > 0
      ? hoocodeModes
      : ['plan'];
    return ['default', ...dynamic] as PermissionMode[];
  }
  return ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
};

interface UseChatProviderStateArgs {
  selectedSession: ProjectSession | null;
  hoocodeModes?: string[];
}

export function useChatProviderState({ selectedSession, hoocodeModes }: UseChatProviderStateArgs) {
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');
  const [pendingPermissionRequests, setPendingPermissionRequests] = useState<PendingPermissionRequest[]>([]);
  const [provider, setProvider] = useState<LLMProvider>(() => {
    return (localStorage.getItem('selected-provider') as LLMProvider) || 'claude';
  });
  const [cursorModel, setCursorModel] = useState<string>(() => {
    return localStorage.getItem('cursor-model') || CURSOR_MODELS.DEFAULT;
  });
  const [claudeModel, setClaudeModel] = useState<string>(() => {
    return localStorage.getItem('claude-model') || CLAUDE_MODELS.DEFAULT;
  });
  const [codexModel, setCodexModel] = useState<string>(() => {
    return localStorage.getItem('codex-model') || CODEX_MODELS.DEFAULT;
  });
  const [geminiModel, setGeminiModel] = useState<string>(() => {
    return localStorage.getItem('gemini-model') || GEMINI_MODELS.DEFAULT;
  });
  const [hoocodeModel, setHoocodeModel] = useState<string>(() => {
    return localStorage.getItem('hoocode-model') || HOOCODE_MODELS.DEFAULT;
  });
  const [openCodeModel, setOpenCodeModel] = useState<string>(() => {
    return localStorage.getItem('opencode-model') || OPENCODE_MODELS.DEFAULT;
  });

  const lastProviderRef = useRef(provider);

  useEffect(() => {
    if (!selectedSession?.id) {
      return;
    }

    const savedMode = localStorage.getItem(`permissionMode-${selectedSession.id}`) as PermissionMode | null;
    const validModes = getPermissionModesForProvider(provider, hoocodeModes);
    setPermissionMode(savedMode && validModes.includes(savedMode) ? savedMode : 'default');
  }, [selectedSession?.id, provider, hoocodeModes]);

  useEffect(() => {
    if (!selectedSession?.__provider || selectedSession.__provider === provider) {
      return;
    }

    setProvider(selectedSession.__provider);
    localStorage.setItem('selected-provider', selectedSession.__provider);

    const modelKey = `${selectedSession.__provider}-model`;
    const stored = localStorage.getItem(modelKey);
    if (stored) {
      if (selectedSession.__provider === 'claude') setClaudeModel(stored);
      else if (selectedSession.__provider === 'cursor') setCursorModel(stored);
      else if (selectedSession.__provider === 'codex') setCodexModel(stored);
      else if (selectedSession.__provider === 'gemini') setGeminiModel(stored);
      else if (selectedSession.__provider === 'hoocode') setHoocodeModel(stored);
      else if (selectedSession.__provider === 'opencode') setOpenCodeModel(stored);
    }
  }, [provider, selectedSession]);

  // Sync React state when an external surface (CLI tab pick, etc.) writes
  // `selected-provider` to localStorage. The same-window write doesn't fire a
  // native `storage` event, so we rely on a custom `provider-changed` event.
  useEffect(() => {
    const syncProvider = (nextProvider: LLMProvider) => {
      setProvider((current) => (current === nextProvider ? current : nextProvider));

      const stored = localStorage.getItem(`${nextProvider}-model`);
      if (!stored) return;
      if (nextProvider === 'claude') setClaudeModel(stored);
      else if (nextProvider === 'cursor') setCursorModel(stored);
      else if (nextProvider === 'codex') setCodexModel(stored);
      else if (nextProvider === 'gemini') setGeminiModel(stored);
      else if (nextProvider === 'hoocode') setHoocodeModel(stored);
      else if (nextProvider === 'opencode') setOpenCodeModel(stored);
    };

    const handleProviderChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ provider?: string }>).detail;
      const nextProvider = detail?.provider as LLMProvider | undefined;
      if (nextProvider) syncProvider(nextProvider);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'selected-provider' || !event.newValue) return;
      syncProvider(event.newValue as LLMProvider);
    };

    window.addEventListener('provider-changed', handleProviderChanged);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('provider-changed', handleProviderChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (lastProviderRef.current === provider) {
      return;
    }
    setPendingPermissionRequests([]);
    lastProviderRef.current = provider;
  }, [provider]);

  useEffect(() => {
    setPendingPermissionRequests((previous) =>
      previous.filter((request) => !request.sessionId || request.sessionId === selectedSession?.id),
    );
  }, [selectedSession?.id]);

  useEffect(() => {
    if (provider !== 'cursor') {
      return;
    }

    authenticatedFetch('/api/cursor/config')
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !data.config?.model?.modelId) {
          return;
        }

        const modelId = data.config.model.modelId as string;
        if (!localStorage.getItem('cursor-model')) {
          setCursorModel(modelId);
        }
      })
      .catch((error) => {
        console.error('Error loading Cursor config:', error);
      });
  }, [provider]);

  const cyclePermissionMode = useCallback(() => {
    const modes = getPermissionModesForProvider(provider, hoocodeModes);

    const currentIndex = modes.indexOf(permissionMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    setPermissionMode(nextMode);

    if (selectedSession?.id) {
      localStorage.setItem(`permissionMode-${selectedSession.id}`, nextMode);
    }
  }, [permissionMode, provider, selectedSession?.id, hoocodeModes]);

  return {
    provider,
    setProvider,
    cursorModel,
    setCursorModel,
    claudeModel,
    setClaudeModel,
    codexModel,
    setCodexModel,
    geminiModel,
    setGeminiModel,
    hoocodeModel,
    setHoocodeModel,
    openCodeModel,
    setOpenCodeModel,
    permissionMode,
    setPermissionMode,
    pendingPermissionRequests,
    setPendingPermissionRequests,
    cyclePermissionMode,
  };
}
