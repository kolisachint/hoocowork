import { LogIn, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import SessionProviderLogo from '../../../../../../llm-logo-provider/SessionProviderLogo';
import type { AgentProvider, AuthStatus } from '../../../../../types/types';

type AccountContentProps = {
  agent: AgentProvider;
  authStatus: AuthStatus;
  onLogin: () => void;
};

const AGENT_NAMES: Record<AgentProvider, string> = {
  claude: 'Claude',
  cursor: 'Cursor',
  codex: 'Codex',
  gemini: 'Gemini',
  hoocode: 'Hoocode',
  opencode: 'OpenCode',
};

export default function AccountContent({ agent, authStatus, onLogin }: AccountContentProps) {
  const { t } = useTranslation('settings');
  const name = AGENT_NAMES[agent];

  const statusDotClass = authStatus.loading
    ? 'dot-off'
    : authStatus.authenticated
      ? 'dot-ok'
      : 'dot-off';

  // Design: Authentication row with method hint
  const authHint = authStatus.loading
    ? t('agents.authStatus.checkingAuth')
    : authStatus.authenticated
      ? authStatus.method === 'oauth'
        ? t('agents.account.oauthConnected', { email: authStatus.email || t('agents.authStatus.authenticatedUser') })
        : t('agents.authStatus.loggedInAs', { email: authStatus.email || t('agents.authStatus.authenticatedUser') })
      : t('agents.authStatus.notConnected');

  // Show login button for most agents
  const showLoginRow = agent !== 'hoocode' && authStatus.method !== 'api_key';

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{t('tabs.account')}</div>
      </div>
      <div className="settings-section-body">
        {/* Authentication row - v2 account-card */}
        <div className="settings-row">
          <div style={{ flex: 1 }}>
            <div className={`account-card ${authStatus.authenticated ? 'connected' : ''}`}>
              <span className="agent-conn-icon">
                <SessionProviderLogo provider={agent} className="h-5 w-5" />
              </span>
              <div className="account-card-meta">
                <div className="account-card-name">{name}</div>
                <div className="account-card-state">
                  <span className={`status-dot ${statusDotClass}`} />
                  <span>{authHint}</span>
                </div>
              </div>
              {showLoginRow && (
                <button type="button" className="btn btn-sm btn-outline" onClick={onLogin}>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>
                    {authStatus.authenticated
                      ? t('agents.login.reAuthenticate')
                      : t('agents.login.button')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Workspace row - design style */}
        {authStatus.authenticated && agent === 'claude' && (
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label">{t('agents.account.workspace')}</div>
              <div className="settings-row-hint">{t('agents.account.workspaceHint', { path: '~/.claude' })}</div>
            </div>
            <div className="settings-row-ctrl">
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  // Open workspace folder - could use electron shell or just alert for now
                  window.open('file://~/.claude', '_blank');
                }}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{t('agents.account.open')}</span>
              </button>
            </div>
          </div>
        )}

        {agent === 'hoocode' && (
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label">{t('agents.account.hoocode.configuredViaKeys')}</div>
              <div className="settings-row-hint">{t('agents.account.hoocode.manageKeysHint')}</div>
            </div>
          </div>
        )}

        {authStatus.error && (
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label text-[var(--err)]">
                {t('agents.error', { error: authStatus.error })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
