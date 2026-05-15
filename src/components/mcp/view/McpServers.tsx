import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit3,
  ExternalLink,
  Lock,
  Plus,
  Server,
  Trash2,
  Users,
} from 'lucide-react';

import type { McpProject, McpProvider, McpScope, ProviderMcpServer } from '../types';
import { IS_PLATFORM } from '../../../constants/config';
import { cn } from '../../../lib/utils';
import {
  MCP_GLOBAL_SUPPORTED_SCOPES,
  MCP_GLOBAL_SUPPORTED_TRANSPORTS,
  MCP_PROVIDER_BUTTON_CLASSES,
  MCP_PROVIDER_NAMES,
} from '../constants';
import { useMcpServers } from '../hooks/useMcpServers';
import { maskSecret } from '../utils/mcpFormatting';

import McpServerFormModal from './modals/McpServerFormModal';

type McpServersProps = {
  selectedProvider: McpProvider;
  currentProjects: McpProject[];
};

type StatusTone = 'ok' | 'warn' | 'err' | 'off';

function StatusDot({ tone }: { tone: StatusTone }) {
  const colorClass = {
    ok: 'bg-[var(--ok)]',
    warn: 'bg-[var(--warn)]',
    err: 'bg-[var(--err)]',
    off: 'bg-[var(--ink-4)]',
  }[tone];

  return <span className={cn('inline-block h-2 w-2 rounded-full', colorClass)} />;
}

const CONFIG_PATHS: Record<McpProvider, string> = {
  claude: '~/.claude/mcp.json',
  cursor: '~/.cursor/mcp.json',
  codex: '~/.codex/mcp.json',
  gemini: '~/.gemini/mcp.json',
  hoocode: '~/.hoocode/mcp.json',
  opencode: '~/.opencode/mcp.json',
};

const getScopeLabel = (scope: McpScope): string => scope;

const getServerKey = (server: ProviderMcpServer): string => (
  `${server.provider}:${server.scope}:${server.workspacePath || 'global'}:${server.name}`
);

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

const getCommandDisplay = (server: ProviderMcpServer): string => {
  if (server.command) {
    const args = (server.args || []).join(' ');
    return args ? `${server.command} ${args}` : server.command;
  }
  return server.url || '';
};

const getEnvDisplay = (server: ProviderMcpServer): string => {
  const envEntries = Object.entries(server.env || {});
  if (envEntries.length > 0) {
    return envEntries.map(([key, value]) => `${key}=${maskSecret(value)}`).join(', ');
  }
  if (server.envVars && server.envVars.length > 0) {
    return server.envVars.join(', ');
  }
  return '$HOME, $PATH';
};

type McpRowProps = {
  server: ProviderMcpServer;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
};

function McpRow({ server, isOpen, onToggle, onEdit, onDelete, editLabel, deleteLabel }: McpRowProps) {
  const status = getServerStatus(server);
  const toolsCount = (server.args?.length || 0) + (server.envVars?.length || 0);
  const cmdDisplay = getCommandDisplay(server);
  const envDisplay = getEnvDisplay(server);
  const scopeLabel = getScopeLabel(server.scope);

  return (
    <div className={cn('mcp-row', isOpen && 'open')}>
      <button type="button" className="mcp-row-head" onClick={onToggle}>
        <span className="mcp-glyph">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>
        <span className="mcp-name truncate">{server.name}</span>
        <span className="mcp-transport">{server.transport || 'stdio'}</span>
        <span className="mcp-tools">{toolsCount} tools</span>
        <span className="mcp-status">
          <StatusDot tone={status} /> {getStatusLabel(status)}
        </span>
        <span className="mcp-toggle">
          <input
            type="checkbox"
            checked={status === 'ok'}
            onClick={(e) => e.stopPropagation()}
            readOnly
          />
        </span>
      </button>

      {isOpen && (
        <div className="mcp-detail">
          <div className="mcp-kv">
            <span className="mcp-k">command</span>
            <code className="mcp-v">{cmdDisplay || '—'}</code>
          </div>
          <div className="mcp-kv">
            <span className="mcp-k">transport</span>
            <code className="mcp-v">{server.transport || 'stdio'}</code>
          </div>
          <div className="mcp-kv">
            <span className="mcp-k">scope</span>
            <code className="mcp-v">
              {scopeLabel}
              {server.projectDisplayName ? ` · ${server.projectDisplayName}` : ''}
            </code>
          </div>
          {server.cwd && (
            <div className="mcp-kv">
              <span className="mcp-k">cwd</span>
              <code className="mcp-v">{server.cwd}</code>
            </div>
          )}
          <div className="mcp-kv">
            <span className="mcp-k">env</span>
            <code className="mcp-v">{envDisplay}</code>
          </div>
          <div className="mcp-kv">
            <span className="mcp-k">timeout</span>
            <code className="mcp-v">30s</code>
          </div>

          <div className="mcp-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
              <Edit3 size={13} />
              {editLabel}
            </button>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              className="btn btn-ghost btn-sm text-[var(--err)] hover:text-[var(--err)] hover:opacity-80"
              onClick={onDelete}
            >
              <Trash2 size={13} />
              {deleteLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamMcpFeatureCard() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">Team MCP Configs</h4>
            <Lock className="h-3 w-3 text-muted-foreground/60" />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Share MCP server configurations across your team. Everyone stays in sync automatically.
          </p>
          <a
            href="https://hoocowork.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
          >
            Available with HooCowork Pro
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function McpServers({ selectedProvider, currentProjects }: McpServersProps) {
  const { t } = useTranslation('settings');
  const [openServerId, setOpenServerId] = useState<string | null>(null);

  const {
    servers,
    isLoading,
    isLoadingProjectScopes,
    loadError,
    deleteError,
    saveStatus,
    isFormOpen,
    isGlobalFormOpen,
    editingServer,
    openForm,
    openGlobalForm,
    closeForm,
    closeGlobalForm,
    submitForm,
    submitGlobalForm,
    deleteServer,
  } = useMcpServers({ selectedProvider, currentProjects });

  const providerName = MCP_PROVIDER_NAMES[selectedProvider];
  const configPath = CONFIG_PATHS[selectedProvider] || `~/.${selectedProvider}/mcp.json`;
  const healthyCount = useMemo(
    () => servers.filter((s) => getServerStatus(s) === 'ok').length,
    [servers],
  );

  const globalButtonLabel = 'Add Global MCP Server';
  const providerButtonLabel = `Add ${providerName} MCP Server`;
  const globalAddDescription = 'Add Global MCP Server writes one common stdio or HTTP server to Claude, Cursor, Codex, and Gemini.';
  const providerAddDescription = `${providerButtonLabel} only changes ${providerName}.`;
  const globalModalDescription = 'Adds this MCP server to every provider: Claude, Cursor, Codex, and Gemini. '
    + 'Only stdio and HTTP transports are supported because the same config must work across all providers.';

  return (
    <section className="mcp">
      <div className="mcp-head">
        <div>
          <div className="cli-eyebrow">Model context protocol</div>
          <div className="mcp-title">{t('mcpServers.title')}</div>
          <div className="cli-sub">
            Configured in <code>{configPath}</code> · {servers.length} servers · {healthyCount} healthy
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openGlobalForm}
            className={cn('btn btn-solid btn-sm', MCP_PROVIDER_BUTTON_CLASSES[selectedProvider])}
            title={globalAddDescription}
          >
            <Plus size={13} />
            {globalButtonLabel}
          </button>
          <button
            type="button"
            onClick={() => openForm()}
            className="btn btn-outline btn-sm"
            title={providerAddDescription}
          >
            <Plus size={13} />
            {providerButtonLabel}
          </button>
        </div>
      </div>

      <div className="min-h-4">
        {saveStatus === 'success' && (
          <span className="animate-in fade-in text-xs text-muted-foreground">{t('saveStatus.success')}</span>
        )}
        {isLoadingProjectScopes && (
          <span className="animate-in fade-in text-xs text-muted-foreground">Refreshing project scopes...</span>
        )}
      </div>

      {(loadError || deleteError) && (
        <div className="flex items-center gap-2 rounded-[var(--radius-2)] border border-[var(--err)]/30 bg-[var(--err-soft)] px-3 py-2 text-sm text-[var(--err)]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{deleteError || loadError}</span>
        </div>
      )}

      {isLoading && servers.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading MCP servers...</div>
      ) : servers.length === 0 ? (
        <div className="py-10 text-center">
          <Server className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t('mcpServers.empty')}</p>
        </div>
      ) : (
        <div className="mcp-list">
          {servers.map((server) => {
            const key = getServerKey(server);
            return (
              <McpRow
                key={key}
                server={server}
                isOpen={openServerId === key}
                onToggle={() => setOpenServerId(openServerId === key ? null : key)}
                onEdit={() => openForm(server)}
                onDelete={() => deleteServer(server)}
                editLabel={t('mcpServers.actions.edit')}
                deleteLabel={t('mcpServers.actions.delete')}
              />
            );
          })}
        </div>
      )}

      {selectedProvider === 'codex' && (
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="mb-2 font-medium text-foreground">{t('mcpServers.help.title')}</h4>
          <p className="text-sm text-muted-foreground">{t('mcpServers.help.description')}</p>
        </div>
      )}

      {selectedProvider === 'claude' && !IS_PLATFORM && <TeamMcpFeatureCard />}

      <McpServerFormModal
        provider={selectedProvider}
        isOpen={isFormOpen}
        editingServer={editingServer}
        currentProjects={currentProjects}
        title={editingServer ? undefined : providerButtonLabel}
        submitLabel={providerButtonLabel}
        onClose={closeForm}
        onSubmit={submitForm}
      />

      <McpServerFormModal
        provider={selectedProvider}
        mode="global"
        isOpen={isGlobalFormOpen}
        editingServer={null}
        currentProjects={currentProjects}
        title={globalButtonLabel}
        description={globalModalDescription}
        submitLabel={globalButtonLabel}
        supportedScopes={MCP_GLOBAL_SUPPORTED_SCOPES}
        supportedTransports={MCP_GLOBAL_SUPPORTED_TRANSPORTS}
        onClose={closeGlobalForm}
        onSubmit={(formData) => submitGlobalForm(formData)}
      />
    </section>
  );
}
