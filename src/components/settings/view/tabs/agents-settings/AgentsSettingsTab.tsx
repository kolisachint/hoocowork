import { useEffect, useMemo, useState } from 'react';

import { useServerPlatform } from '../../../../../hooks/useServerPlatform';
import type { AgentCategory, AgentProvider } from '../../../types/types';

import type { AgentContext, AgentsSettingsTabProps } from './types';
import AgentCategoryContentSection from './sections/AgentCategoryContentSection';
import AgentCategoryTabsSection from './sections/AgentCategoryTabsSection';
import AgentSelectorSection from './sections/AgentSelectorSection';

export default function AgentsSettingsTab({
  providerAuthStatus,
  onProviderLogin,
  claudePermissions,
  onClaudePermissionsChange,
  cursorPermissions,
  onCursorPermissionsChange,
  codexPermissionMode,
  onCodexPermissionModeChange,
  geminiPermissionMode,
  onGeminiPermissionModeChange,
  projects,
  onOpenMcpSettings,
}: AgentsSettingsTabProps & { onOpenMcpSettings: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState<AgentProvider>('claude');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>('permissions');
  const { isWindowsServer } = useServerPlatform();

  const visibleAgents = useMemo<AgentProvider[]>(() => {
    const all: AgentProvider[] = ['claude', 'cursor', 'codex', 'gemini', 'hoocode', 'opencode'];
    if (isWindowsServer) {
      return all.filter((id) => id !== 'cursor');
    }

    return all;
  }, [isWindowsServer]);

  useEffect(() => {
    if (isWindowsServer && selectedAgent === 'cursor') {
      setSelectedAgent('claude');
    }
  }, [isWindowsServer, selectedAgent]);

  useEffect(() => {
    if (selectedAgent === 'hoocode' && selectedCategory !== 'account') {
      setSelectedCategory('account');
      return;
    }

    if (selectedAgent === 'opencode' && selectedCategory === 'permissions') {
      setSelectedCategory('account');
    }
  }, [selectedAgent, selectedCategory]);

  const agentContextById = useMemo<Record<AgentProvider, AgentContext>>(() => ({
    claude: {
      authStatus: providerAuthStatus.claude,
      onLogin: () => onProviderLogin('claude'),
    },
    cursor: {
      authStatus: providerAuthStatus.cursor,
      onLogin: () => onProviderLogin('cursor'),
    },
    codex: {
      authStatus: providerAuthStatus.codex,
      onLogin: () => onProviderLogin('codex'),
    },
    gemini: {
      authStatus: providerAuthStatus.gemini,
      onLogin: () => onProviderLogin('gemini'),
    },
    hoocode: {
      authStatus: providerAuthStatus.hoocode,
      onLogin: () => onProviderLogin('hoocode'),
    },
    opencode: {
      authStatus: providerAuthStatus.opencode,
      onLogin: () => onProviderLogin('opencode'),
    },
  }), [
    onProviderLogin,
    providerAuthStatus.claude,
    providerAuthStatus.codex,
    providerAuthStatus.cursor,
    providerAuthStatus.gemini,
    providerAuthStatus.hoocode,
    providerAuthStatus.opencode,
  ]);

  return (
    <>
      <div className="settings-h1">Agents</div>
      <div className="settings-sub">Per-agent account, permissions, tools, models.</div>

      <AgentSelectorSection
        agents={visibleAgents}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
        agentContextById={agentContextById}
      />

      <AgentCategoryTabsSection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedAgent={selectedAgent}
      />

      <AgentCategoryContentSection
        selectedAgent={selectedAgent}
        selectedCategory={selectedCategory}
        agentContextById={agentContextById}
        claudePermissions={claudePermissions}
        onClaudePermissionsChange={onClaudePermissionsChange}
        cursorPermissions={cursorPermissions}
        onCursorPermissionsChange={onCursorPermissionsChange}
        codexPermissionMode={codexPermissionMode}
        onCodexPermissionModeChange={onCodexPermissionModeChange}
        geminiPermissionMode={geminiPermissionMode}
        onGeminiPermissionModeChange={onGeminiPermissionModeChange}
        projects={projects}
        onOpenMcpSettings={onOpenMcpSettings}
      />
    </>
  );
}
