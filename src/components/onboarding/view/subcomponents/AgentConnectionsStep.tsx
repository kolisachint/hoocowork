import type { LLMProvider } from '../../../../types/app';
import type { ProviderAuthStatusMap } from '../../../provider-auth/types';
import AgentConnectionCard from './AgentConnectionCard';

type AgentConnectionsStepProps = {
  providerStatuses: ProviderAuthStatusMap;
  onOpenProviderLogin: (provider: LLMProvider) => void;
};

const KIT_CONNECTED = 'bg-secondary border-foreground';
const KIT_ICON_WRAP = 'bg-secondary';
const KIT_LOGIN = 'bg-primary hover:bg-primary/90 text-primary-foreground';

const providerCards = [
  {
    provider: 'claude' as const,
    title: 'Claude Code',
    connectedClassName: KIT_CONNECTED,
    iconContainerClassName: KIT_ICON_WRAP,
    loginButtonClassName: KIT_LOGIN,
  },
  {
    provider: 'cursor' as const,
    title: 'Cursor',
    connectedClassName: KIT_CONNECTED,
    iconContainerClassName: KIT_ICON_WRAP,
    loginButtonClassName: KIT_LOGIN,
  },
  {
    provider: 'codex' as const,
    title: 'OpenAI Codex',
    connectedClassName: KIT_CONNECTED,
    iconContainerClassName: KIT_ICON_WRAP,
    loginButtonClassName: KIT_LOGIN,
  },
  {
    provider: 'gemini' as const,
    title: 'Gemini',
    connectedClassName: KIT_CONNECTED,
    iconContainerClassName: KIT_ICON_WRAP,
    loginButtonClassName: KIT_LOGIN,
  },
  {
    provider: 'pi' as const,
    title: 'Pi',
    connectedClassName: KIT_CONNECTED,
    iconContainerClassName: KIT_ICON_WRAP,
    loginButtonClassName: KIT_LOGIN,
  },
  {
    provider: 'opencode' as const,
    title: 'OpenCode',
    connectedClassName: KIT_CONNECTED,
    iconContainerClassName: KIT_ICON_WRAP,
    loginButtonClassName: KIT_LOGIN,
  },
];

export default function AgentConnectionsStep({
  providerStatuses,
  onOpenProviderLogin,
}: AgentConnectionsStepProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Step 2</p>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">Connect Your AI Agents</h2>
        <p className="text-muted-foreground">
          Login to one or more AI coding assistants. All are optional.
        </p>
      </div>

      <div className="space-y-3">
        {providerCards.map((providerCard) => (
          <AgentConnectionCard
            key={providerCard.provider}
            provider={providerCard.provider}
            title={providerCard.title}
            status={providerStatuses[providerCard.provider]}
            connectedClassName={providerCard.connectedClassName}
            iconContainerClassName={providerCard.iconContainerClassName}
            loginButtonClassName={providerCard.loginButtonClassName}
            onLogin={() => onOpenProviderLogin(providerCard.provider)}
          />
        ))}
      </div>

      <div className="pt-2 text-center text-sm text-muted-foreground">
        <p>You can configure these later in Settings.</p>
      </div>
    </div>
  );
}
