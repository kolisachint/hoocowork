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
  bgClass: string;
  borderClass: string;
  textClass: string;
  subtextClass: string;
  buttonClass: string;
  description?: string;
};

const agentConfig: Record<AgentProvider, AgentVisualConfig> = {
  claude: {
    name: 'Claude',
    bgClass: 'bg-[var(--brand-accent)]/5',
    borderClass: 'border-[var(--brand-accent)]/20',
    textClass: 'text-foreground',
    subtextClass: 'text-muted-foreground',
    buttonClass: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 active:bg-[var(--brand-accent)]/80',
  },
  cursor: {
    name: 'Cursor',
    bgClass: 'bg-[var(--brand-accent)]/5',
    borderClass: 'border-[var(--brand-accent)]/20',
    textClass: 'text-foreground',
    subtextClass: 'text-muted-foreground',
    buttonClass: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 active:bg-[var(--brand-accent)]/80',
  },
  codex: {
    name: 'Codex',
    bgClass: 'bg-muted/50',
    borderClass: 'border-border',
    textClass: 'text-foreground',
    subtextClass: 'text-muted-foreground',
    buttonClass: 'bg-foreground/80 hover:bg-foreground/90 active:bg-foreground',
  },
  gemini: {
    name: 'Gemini',
    description: 'Google Gemini AI assistant',
    bgClass: 'bg-[var(--brand-accent)]/5',
    borderClass: 'border-[var(--brand-accent)]/20',
    textClass: 'text-foreground',
    subtextClass: 'text-muted-foreground',
    buttonClass: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 active:bg-[var(--brand-accent)]/80',
  },
  pi: {
    name: 'Pi',
    description: 'Pi AI coding agent',
    bgClass: 'bg-[var(--brand-accent)]/5',
    borderClass: 'border-[var(--brand-accent)]/20',
    textClass: 'text-foreground',
    subtextClass: 'text-muted-foreground',
    buttonClass: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 active:bg-[var(--brand-accent)]/80',
  },
  opencode: {
    name: 'OpenCode',
    description: 'OpenCode terminal coding agent',
    bgClass: 'bg-[var(--brand-accent)]/5',
    borderClass: 'border-[var(--brand-accent)]/20',
    textClass: 'text-foreground',
    subtextClass: 'text-muted-foreground',
    buttonClass: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 active:bg-[var(--brand-accent)]/80',
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
          <h3 className="text-lg font-medium text-foreground">{config.name}</h3>
          <p className="text-sm text-muted-foreground">{t(`agents.account.${agent}.description`)}</p>
        </div>
      </div>

      <div className={`${config.bgClass} border ${config.borderClass} rounded-lg p-4`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className={`font-medium ${config.textClass}`}>
                {t('agents.connectionStatus')}
              </div>
              <div className={`text-sm ${config.subtextClass}`}>
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
                <Badge variant="secondary" className="bg-muted">
                  {t('agents.authStatus.checking')}
                </Badge>
              ) : authStatus.authenticated ? (
                <Badge variant="secondary" className="bg-[var(--ok)]/10 text-[var(--ok)]">
                  {t('agents.authStatus.connected')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {t('agents.authStatus.disconnected')}
                </Badge>
              )}
            </div>
          </div>

          {agent === 'pi' ? (
            <div className="border-t border-border/50 pt-4">
              <div className={`text-sm ${config.subtextClass}`}>
                {t('agents.account.pi.configuredViaKeys')}
              </div>
              <div className={`mt-1 text-xs ${config.subtextClass} opacity-80`}>
                {t('agents.account.pi.manageKeysHint')}
              </div>
            </div>
          ) : authStatus.method !== 'api_key' && (
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${config.textClass}`}>
                    {authStatus.authenticated ? t('agents.login.reAuthenticate') : t('agents.login.title')}
                  </div>
                  <div className={`text-sm ${config.subtextClass}`}>
                    {authStatus.authenticated
                      ? t('agents.login.reAuthDescription')
                      : t('agents.login.description', { agent: config.name })}
                  </div>
                </div>
                <Button
                  onClick={onLogin}
                  className={`${config.buttonClass} text-white`}
                  size="sm"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {authStatus.authenticated ? t('agents.login.reLoginButton') : t('agents.login.button')}
                </Button>
              </div>
            </div>
          )}

          {authStatus.error && (
            <div className="border-t border-border/50 pt-4">
              <div className="text-sm text-[var(--err)]">
                {t('agents.error', { error: authStatus.error })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
