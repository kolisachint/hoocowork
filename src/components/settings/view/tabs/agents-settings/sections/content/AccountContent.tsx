import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button } from '../../../../../../../shared/view/ui';
import SessionProviderLogo from '../../../../../../llm-logo-provider/SessionProviderLogo';
import type { AgentProvider, AuthStatus } from '../../../../../types/types';

type AccountContentProps = {
  agent: AgentProvider;
  authStatus: AuthStatus;
  onLogin: () => void;
};

type AgentVisualConfig = {
  name: string;
  description?: string;
};

const agentConfig: Record<AgentProvider, AgentVisualConfig> = {
  claude: {
    name: 'Claude',
  },
  cursor: {
    name: 'Cursor',
  },
  codex: {
    name: 'Codex',
  },
  gemini: {
    name: 'Gemini',
    description: 'Google Gemini AI assistant',
  },
  pi: {
    name: 'Pi',
    description: 'Pi AI coding agent',
  },
  opencode: {
    name: 'OpenCode',
    description: 'OpenCode terminal coding agent',
  },
};

export default function AccountContent({ agent, authStatus, onLogin }: AccountContentProps) {
  const { t } = useTranslation('settings');
  const config = agentConfig[agent];

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center gap-3">
        <SessionProviderLogo provider={agent} className="h-6 w-6" />
        <div>
          <h3 className="text-lg font-medium">{config.name}</h3>
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{t(`agents.account.${agent}.description`)}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4" style={{ background: 'var(--paper-2)', borderColor: 'var(--line)' }}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
                  <div className="font-medium">
                {t('agents.connectionStatus')}
              </div>
              <div className={`text-sm ${'text-[var(--ink-3)]'}`}>
                {authStatus.loading ? (
                  t('agents.authStatus.checkingAuth')
                ) : authStatus.authenticated ? (
                  t('agents.authStatus.loggedInAs', {
                    email: authStatus.email || t('agents.authStatus.authenticatedUser'),
                  })
                ) : (
                  t('agents.authStatus.notConnected')
                )}
              </div>
            </div>
            <div>
              {authStatus.loading ? (
                <Badge variant="secondary">
                  {t('agents.authStatus.checking')}
                </Badge>
              ) : authStatus.authenticated ? (
                <Badge variant="secondary" className="badge-ok">
                  {t('agents.authStatus.connected')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="badge-default">
                  {t('agents.authStatus.disconnected')}
                </Badge>
              )}
            </div>
          </div>

          {agent === 'pi' ? (
            <div className="pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <div className={`text-sm ${'text-[var(--ink-3)]'}`}>
                {t('agents.account.pi.configuredViaKeys')}
              </div>
              <div className="mt-1 text-xs opacity-80" style={{ color: 'var(--ink-3)' }}>
                {t('agents.account.pi.manageKeysHint')}
              </div>
            </div>
          ) : authStatus.method !== 'api_key' && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="flex items-center justify-between">
                <div>
              <div className="font-medium">
                    {authStatus.authenticated ? t('agents.login.reAuthenticate') : t('agents.login.title')}
                  </div>
              <div className="text-sm" style={{ color: 'var(--ink-3)' }}>
                    {authStatus.authenticated
                      ? t('agents.login.reAuthDescription')
                      : t('agents.login.description', { agent: config.name })}
                  </div>
                </div>
                <Button
                  onClick={onLogin}
                  className="btn btn-accent text-white"
                  size="sm"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {authStatus.authenticated ? t('agents.login.reLoginButton') : t('agents.login.button')}
                </Button>
              </div>
            </div>
          )}

          {authStatus.error && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="text-sm" style={{ color: 'var(--err)' }}>
                {t('agents.error', { error: authStatus.error })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
