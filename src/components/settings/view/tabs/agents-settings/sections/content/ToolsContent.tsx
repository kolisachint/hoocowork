import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

import type { AgentProvider } from '../../../../../types/types';
import type { McpProject, McpProvider, ProviderMcpServer } from '../../../../../../mcp/types';
import { useMcpServers } from '../../../../../../mcp/hooks/useMcpServers';

type ToolsContentProps = {
  agent: AgentProvider;
  projects: McpProject[];
  onOpenMcpSettings: () => void;
};

type StatusTone = 'ok' | 'warn' | 'err' | 'off';

const getServerStatus = (server: ProviderMcpServer): StatusTone => {
  const hasCommand = !!server.command?.trim();
  const hasUrl = !!server.url?.trim();
  return hasCommand || hasUrl ? 'ok' : 'err';
};

const getStatusLabel = (tone: StatusTone): string => {
  if (tone === 'ok') return 'running';
  if (tone === 'err') return 'error';
  if (tone === 'warn') return 'degraded';
  return 'stopped';
};

// Estimate tool count from server args/env
const getToolCount = (server: ProviderMcpServer): number => {
  // This is a heuristic - in reality we'd need to query the MCP server
  // For now, use args length as a proxy or default to 1
  return (server.args?.length || 0) > 0 ? server.args!.length : 1;
};

export default function ToolsContent({ agent, projects, onOpenMcpSettings }: ToolsContentProps) {
  const { t } = useTranslation('settings');
  const [localServers, setLocalServers] = useState<ProviderMcpServer[]>([]);

  const {
    servers,
    isLoading,
  } = useMcpServers({
    selectedProvider: agent as McpProvider,
    currentProjects: projects,
  });

  // Sync servers from hook to local state for toggles
  useEffect(() => {
    setLocalServers(servers);
  }, [servers]);

  // Toggle server enabled/disabled state
  const toggleServer = (serverName: string) => {
    // In a real implementation, this would call an API to enable/disable the server
    // For now, we just toggle a local enabled state
    setLocalServers((prev) =>
      prev.map((s) =>
        s.name === serverName ? { ...s, _enabled: !(s as ProviderMcpServer & { _enabled?: boolean })._enabled } : s
      )
    );
  };

  // Filter servers for this provider
  const agentServers = localServers.filter((s) => s.provider === agent);

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{t('tools.title')}</div>
        <div className="settings-section-desc">{t('tools.desc')}</div>
      </div>
      <div className="settings-section-body">
        {isLoading ? (
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-hint">{t('tools.loading')}</div>
            </div>
          </div>
        ) : agentServers.length === 0 ? (
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-hint">{t('tools.empty')}</div>
            </div>
          </div>
        ) : (
          agentServers.map((server) => {
            const status = getServerStatus(server);
            const toolCount = getToolCount(server);
            const statusLabel = getStatusLabel(status);
            const isEnabled = (server as ProviderMcpServer & { _enabled?: boolean })._enabled !== false;

            return (
              <div key={server.name} className="settings-row">
                <div className="settings-row-text">
                  <div className="settings-row-label">{server.name}</div>
                  <div className="settings-row-hint">
                    {toolCount} {toolCount === 1 ? t('tools.toolSingular') : t('tools.toolPlural')} · {statusLabel}
                  </div>
                </div>
                <div className="settings-row-ctrl">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleServer(server.name)}
                    />
                    <span className="toggle-track"><span className="toggle-thumb" /></span>
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Link to full MCP settings */}
      <div className="settings-panic">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenMcpSettings}>
          <ExternalLink className="h-3.5 w-3.5" />
          <span>{t('tools.manageInMcpSettings')}</span>
        </button>
      </div>
    </div>
  );
}
