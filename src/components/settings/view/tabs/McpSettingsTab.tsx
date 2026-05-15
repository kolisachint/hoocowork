import { useMemo, useState } from 'react';

import { useServerPlatform } from '../../../../hooks/useServerPlatform';
import McpServers from '../../../mcp/view/McpServers';
import { MCP_PROVIDER_NAMES } from '../../../mcp/constants';
import type { McpProject, McpProvider } from '../../../mcp/types';
import type { SettingsProject } from '../../types/types';

type McpSettingsTabProps = {
  projects: SettingsProject[];
};

export default function McpSettingsTab({ projects }: McpSettingsTabProps) {
  const [selectedProvider, setSelectedProvider] = useState<McpProvider>('claude');
  const { isWindowsServer } = useServerPlatform();

  const visibleProviders = useMemo<McpProvider[]>(() => {
    const all: McpProvider[] = ['claude', 'cursor', 'codex', 'gemini', 'hoocode', 'opencode'];
    return isWindowsServer ? all.filter((id) => id !== 'cursor') : all;
  }, [isWindowsServer]);

  const currentProjects = useMemo<McpProject[]>(
    () => projects.map((project) => ({
      projectId: project.name,
      displayName: project.displayName,
      fullPath: project.fullPath,
      path: project.path,
    })),
    [projects],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 px-[var(--s-5)] pt-[var(--s-4)]">
        <span className="cli-eyebrow">Provider</span>
        <div className="settings-segment flex-wrap">
          {visibleProviders.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => setSelectedProvider(provider)}
              className={`segment-btn ${selectedProvider === provider ? 'active' : ''}`}
            >
              {MCP_PROVIDER_NAMES[provider]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <McpServers selectedProvider={selectedProvider} currentProjects={currentProjects} />
      </div>
    </div>
  );
}
