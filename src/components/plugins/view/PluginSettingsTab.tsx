import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  RefreshCw,
  GitBranch,
  Loader2,
  ServerCrash,
  ShieldAlert,
  ExternalLink,
  BookOpen,
  Download,
  BarChart3,
  Search,
  Plus,
} from 'lucide-react';

import { usePlugins } from '../../../contexts/PluginsContext';
import type { Plugin } from '../../../contexts/PluginsContext';

import PluginIcon from './PluginIcon';

const STARTER_PLUGIN_URL = 'https://github.com/kolisachint/hoocowork-plugin-starter';
const TERMINAL_PLUGIN_URL = 'https://github.com/kolisachint/hoocowork-plugin-terminal';

/* ─── Toggle Switch ─────────────────────────────────────────────────────── */
function ToggleSwitch({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}

/* ─── Server Dot ────────────────────────────────────────────────────────── */
function ServerDot({ running, t }: { running: boolean; t: (key: string) => string }) {
  if (!running) return null;
  return (
    <span className="plugin-server-dot">
      <span className="ping" />
      <span>{t('pluginSettings.runningStatus')}</span>
    </span>
  );
}

/* ─── Plugin Row (design layout) ───────────────────────────────────────── */
type PluginRowProps = {
  plugin: Plugin;
  onToggle: (enabled: boolean) => void;
  onUpdate: () => void;
  onUninstall: () => void;
  updating: boolean;
  confirmingUninstall: boolean;
  onCancelUninstall: () => void;
  updateError: string | null;
};

function PluginRow({
  plugin,
  onToggle,
  onUpdate,
  onUninstall,
  updating,
  confirmingUninstall,
  onCancelUninstall,
  updateError,
}: PluginRowProps) {
  const { t } = useTranslation('settings');
  const repoShort = plugin.repoUrl
    ? plugin.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')
    : null;

  return (
    <div className={`plugin-row ${plugin.enabled ? 'on' : ''}`}>
      <div className="plugin-glyph">
        {plugin.icon ? (
          <PluginIcon
            pluginName={plugin.name}
            iconFile={plugin.icon}
            className="[&>svg]:h-5 [&>svg]:w-5"
          />
        ) : (
          <span>{'{ }'}</span>
        )}
      </div>

      <div className="plugin-body min-w-0">
        <div className="plugin-line1 flex-wrap">
          <span className="plugin-name">{plugin.displayName}</span>
          {plugin.author && (
            <span className="plugin-author">by {plugin.author}</span>
          )}
          <span className="plugin-ver">v{plugin.version}</span>
          {plugin.slot && (
            <span className="badge badge-info">{plugin.slot}</span>
          )}
          <ServerDot running={!!plugin.serverRunning} t={t} />
        </div>
        {plugin.description && (
          <div className="plugin-desc truncate">{plugin.description}</div>
        )}
        {repoShort && plugin.repoUrl && (
          <a
            href={plugin.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <GitBranch className="h-3 w-3" />
            <span className="max-w-[260px] truncate">{repoShort}</span>
          </a>
        )}

        {confirmingUninstall && (
          <div className="border-[var(--err)]/20 bg-[var(--err)]/5 mt-2 flex items-center justify-between gap-3 rounded border px-3 py-2">
            <span className="text-sm text-[var(--err)]">
              {t('pluginSettings.confirmUninstallMessage', { name: plugin.displayName })}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={onCancelUninstall}
                className="rounded border border-border px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t('pluginSettings.cancel')}
              </button>
              <button
                type="button"
                onClick={onUninstall}
                className="border-[var(--err)]/30 hover:bg-[var(--err)]/10 rounded border px-2.5 py-1 text-sm font-medium text-[var(--err)] transition-colors"
              >
                {t('pluginSettings.remove')}
              </button>
            </div>
          </div>
        )}

        {updateError && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--err)]">
            <ServerCrash className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{updateError}</span>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onUpdate}
          disabled={updating || !plugin.repoUrl}
          title={plugin.repoUrl ? t('pluginSettings.pullLatest') : t('pluginSettings.noGitRemote')}
          aria-label={t('pluginSettings.pullLatest')}
          className="icon-btn"
        >
          {updating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onUninstall}
          title={confirmingUninstall ? t('pluginSettings.confirmUninstall') : t('pluginSettings.uninstallPlugin')}
          aria-label={t('pluginSettings.uninstallPlugin')}
          className={`icon-btn ${
            confirmingUninstall ? 'text-[var(--err)] hover:text-[var(--err)]' : 'hover:text-[var(--err)]'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <ToggleSwitch
          checked={plugin.enabled}
          onChange={onToggle}
          ariaLabel={`${plugin.enabled ? t('pluginSettings.disable') : t('pluginSettings.enable')} ${plugin.displayName}`}
        />
      </div>
    </div>
  );
}

/* ─── Suggestion Card (Starter / Terminal) ─────────────────────────────── */
type SuggestionCardProps = {
  icon: React.ReactNode;
  name: string;
  badge: string;
  description: string;
  repoLabel: string;
  repoUrl: string;
  onInstall: () => void;
  installing: boolean;
  installLabel: string;
  installingLabel: string;
};

function SuggestionCard({
  icon,
  name,
  badge,
  description,
  repoLabel,
  repoUrl,
  onInstall,
  installing,
  installLabel,
  installingLabel,
}: SuggestionCardProps) {
  const { t } = useTranslation('settings');
  return (
    <div className="plugin-suggest-card">
      <div className="plugin-suggest-stripe" />
      <div className="plugin-suggest-body">
        <div className="plugin-suggest-icon">{icon}</div>
        <div className="plugin-suggest-meta">
          <div className="plugin-suggest-line">
            <span className="plugin-suggest-name">{name}</span>
            <span className="badge badge-accent">{badge}</span>
            <span className="badge badge-default">{t('pluginSettings.tab')}</span>
          </div>
          <p className="plugin-suggest-desc">{description}</p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="plugin-suggest-repo"
          >
            <GitBranch className="h-3 w-3" />
            {repoLabel}
          </a>
        </div>
        <button
          type="button"
          onClick={onInstall}
          disabled={installing}
          className="btn btn-solid btn-sm"
        >
          {installing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {installing ? installingLabel : installLabel}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function PluginSettingsTab() {
  const { t } = useTranslation('settings');
  const { plugins, loading, installPlugin, uninstallPlugin, updatePlugin, togglePlugin } =
    usePlugins();

  const [gitUrl, setGitUrl] = useState('');
  const [filter, setFilter] = useState('');
  const gitInputRef = useRef<HTMLInputElement | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installingStarter, setInstallingStarter] = useState(false);
  const [installingTerminal, setInstallingTerminal] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [confirmUninstall, setConfirmUninstall] = useState<string | null>(null);
  const [updatingPlugins, setUpdatingPlugins] = useState<Set<string>>(new Set());
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const enabledCount = useMemo(() => plugins.filter((p) => p.enabled).length, [plugins]);
  const filteredPlugins = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return plugins;
    return plugins.filter((p) => {
      const haystack = [p.displayName, p.name, p.description, p.author, p.slot]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [plugins, filter]);

  const handleUpdate = async (name: string) => {
    setUpdatingPlugins((prev) => new Set(prev).add(name));
    setUpdateErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    const result = await updatePlugin(name);
    if (!result.success) {
      setUpdateErrors((prev) => ({ ...prev, [name]: result.error || t('pluginSettings.updateFailed') }));
    }
    setUpdatingPlugins((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const handleInstall = async () => {
    if (!gitUrl.trim()) return;
    setInstalling(true);
    setInstallError(null);
    const result = await installPlugin(gitUrl.trim());
    if (result.success) {
      setGitUrl('');
    } else {
      setInstallError(result.error || t('pluginSettings.installFailed'));
    }
    setInstalling(false);
  };

  const handleInstallStarter = async () => {
    setInstallingStarter(true);
    setInstallError(null);
    const result = await installPlugin(STARTER_PLUGIN_URL);
    if (!result.success) {
      setInstallError(result.error || t('pluginSettings.installFailed'));
    }
    setInstallingStarter(false);
  };

  const handleInstallTerminal = async () => {
    setInstallingTerminal(true);
    setInstallError(null);
    const result = await installPlugin(TERMINAL_PLUGIN_URL);
    if (!result.success) {
      setInstallError(result.error || t('pluginSettings.installFailed'));
    }
    setInstallingTerminal(false);
  };

  const handleUninstall = async (name: string) => {
    if (confirmUninstall !== name) {
      setConfirmUninstall(name);
      return;
    }
    const result = await uninstallPlugin(name);
    if (result.success) {
      setConfirmUninstall(null);
    } else {
      setInstallError(result.error || t('pluginSettings.uninstallFailed'));
      setConfirmUninstall(null);
    }
  };

  const hasStarterInstalled = plugins.some((p) => p.name === 'project-stats');
  const hasTerminalInstalled = plugins.some((p) => p.name === 'web-terminal');

  return (
    <section className="plugins">
      {/* Header — design layout */}
      <div className="mcp-head">
        <div>
          <div className="cli-eyebrow">{t('pluginSettings.eyebrow')}</div>
          <div className="mcp-title">{t('pluginSettings.installedTitle')}</div>
          <div className="cli-sub">
            {t('pluginSettings.headerSubtitle', { enabled: enabledCount, total: plugins.length })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="input-wrap" style={{ width: 220 }}>
            <span className="input-prefix">
              <Search size={13} />
            </span>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('pluginSettings.filterPlaceholder')}
              aria-label={t('pluginSettings.filterAriaLabel')}
              className="input with-prefix"
            />
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => gitInputRef.current?.focus()}
          >
            <Plus size={13} />
            {t('pluginSettings.installButton')}
          </button>
        </div>
      </div>

      {/* Install from Git */}
      <div className="plugin-install-bar">
        <div className="input-wrap" style={{ flex: 1 }}>
          <span className="input-prefix">
            <GitBranch size={13} />
          </span>
          <input
            ref={gitInputRef}
            type="text"
            value={gitUrl}
            onChange={(e) => {
              setGitUrl(e.target.value);
              setInstallError(null);
            }}
            placeholder={t('pluginSettings.installPlaceholder')}
            aria-label={t('pluginSettings.installAriaLabel')}
            className="input with-prefix"
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleInstall();
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing || !gitUrl.trim()}
          className="btn btn-solid btn-sm"
        >
          {installing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('pluginSettings.installButton')
          )}
        </button>
      </div>

      {installError && <p className="text-sm text-[var(--err)]">{installError}</p>}

      <p className="plugin-security-note">
        <ShieldAlert className="mt-px h-3 w-3 flex-shrink-0" />
        <span>{t('pluginSettings.securityWarning')}</span>
      </p>

      {/* Suggested plugin cards */}
      {!loading && (!hasStarterInstalled || !hasTerminalInstalled) && (
        <div className="space-y-2">
          {!hasStarterInstalled && (
            <SuggestionCard
              icon={<BarChart3 className="h-5 w-5" />}
              name={t('pluginSettings.starterPlugin.name')}
              badge={t('pluginSettings.starterPlugin.badge')}
              description={t('pluginSettings.starterPlugin.description')}
              repoLabel="kolisachint/hoocowork-plugin-starter"
              repoUrl={STARTER_PLUGIN_URL}
              onInstall={handleInstallStarter}
              installing={installingStarter}
              installLabel={t('pluginSettings.starterPlugin.install')}
              installingLabel={t('pluginSettings.installing')}
            />
          )}
          {!hasTerminalInstalled && (
            <SuggestionCard
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 8l4 4-4 4" />
                  <line x1="13" y1="16" x2="17" y2="16" />
                </svg>
              }
              name={t('pluginSettings.terminalPlugin.name')}
              badge={t('pluginSettings.terminalPlugin.badge')}
              description={t('pluginSettings.terminalPlugin.description')}
              repoLabel="kolisachint/hoocowork-plugin-terminal"
              repoUrl={TERMINAL_PLUGIN_URL}
              onInstall={handleInstallTerminal}
              installing={installingTerminal}
              installLabel={t('pluginSettings.terminalPlugin.install')}
              installingLabel={t('pluginSettings.installing')}
            />
          )}
        </div>
      )}

      {/* Plugin List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('pluginSettings.scanningPlugins')}
        </div>
      ) : plugins.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('pluginSettings.noPluginsInstalled')}
        </p>
      ) : filteredPlugins.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('pluginSettings.noMatches')}
        </p>
      ) : (
        <div className="plugin-list">
          {filteredPlugins.map((plugin) => {
            const handleToggle = async (enabled: boolean) => {
              const r = await togglePlugin(plugin.name, enabled);
              if (!r.success) {
                setInstallError(r.error || t('pluginSettings.toggleFailed'));
              }
            };

            return (
              <PluginRow
                key={plugin.name}
                plugin={plugin}
                onToggle={(enabled) => void handleToggle(enabled)}
                onUpdate={() => void handleUpdate(plugin.name)}
                onUninstall={() => void handleUninstall(plugin.name)}
                updating={updatingPlugins.has(plugin.name)}
                confirmingUninstall={confirmUninstall === plugin.name}
                onCancelUninstall={() => setConfirmUninstall(null)}
                updateError={updateErrors[plugin.name] ?? null}
              />
            );
          })}
        </div>
      )}

      {/* Footer links */}
      <div className="plugin-foot-links">
        <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{t('pluginSettings.starterPluginLabel')}</span>
        <span className="sep">·</span>
        <a href={STARTER_PLUGIN_URL} target="_blank" rel="noopener noreferrer">
          {t('pluginSettings.starter')} <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <span className="sep">·</span>
        <a href="https://hoocowork.app/docs/plugin-overview" target="_blank" rel="noopener noreferrer">
          {t('pluginSettings.docs')} <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </section>
  );
}
