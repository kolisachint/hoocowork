import { ExternalLink, KeyRound, X } from 'lucide-react';
import StandaloneShell from '../../standalone-shell/view/StandaloneShell';
import { DEFAULT_PROJECT_FOR_EMPTY_SHELL, IS_PLATFORM } from '../../../constants/config';
import type { LLMProvider } from '../../../types/app';

type ProviderLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  provider?: LLMProvider;
  onComplete?: (exitCode: number) => void;
  customCommand?: string;
  isAuthenticated?: boolean;
};

const getProviderCommand = ({
  provider,
  customCommand,
  isAuthenticated: _isAuthenticated,
}: {
  provider: LLMProvider;
  customCommand?: string;
  isAuthenticated: boolean;
}) => {
  if (customCommand) {
    return customCommand;
  }

  if (provider === 'claude') {
    return 'claude --dangerously-skip-permissions /login';
  }

  if (provider === 'cursor') {
    return 'cursor-agent login';
  }

  if (provider === 'codex') {
    return IS_PLATFORM ? 'codex login --device-auth' : 'codex login';
  }

  return 'gemini status';
};

const getProviderTitle = (provider: LLMProvider) => {
  if (provider === 'claude') return 'Claude CLI Login';
  if (provider === 'cursor') return 'Cursor CLI Login';
  if (provider === 'codex') return 'Codex CLI Login';
  return 'Gemini CLI Configuration';
};

export default function ProviderLoginModal({
  isOpen,
  onClose,
  provider = 'claude',
  onComplete,
  customCommand,
  isAuthenticated = false,
}: ProviderLoginModalProps) {
  if (!isOpen) {
    return null;
  }

  const command = getProviderCommand({ provider, customCommand, isAuthenticated });
  const title = getProviderTitle(provider);

  const handleComplete = (exitCode: number) => {
    onComplete?.(exitCode);
    // Keep the modal open so users can read terminal output before closing.
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 max-md:items-stretch max-md:justify-stretch">
      <div className="flex h-3/4 w-full max-w-4xl flex-col rounded-lg bg-background shadow-xl max-md:m-0 max-md:h-full max-md:max-w-none max-md:rounded-none md:m-4 md:h-3/4 md:max-w-4xl md:rounded-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close login modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {provider === 'gemini' ? (
            <div className="flex h-full flex-col items-center justify-center bg-muted/50 p-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-accent)]/10">
                <KeyRound className="h-8 w-8 text-[var(--brand-accent)]" />
              </div>

              <h4 className="mb-3 text-xl font-medium text-foreground">Setup Gemini API Access</h4>

              <p className="mb-8 max-w-md text-muted-foreground">
                The Gemini CLI requires an API key to function. Configure it in your terminal first.
              </p>

              <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 text-left shadow-sm">
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/10 text-sm font-medium text-[var(--brand-accent)]">
                      1
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-foreground">Get your API key</p>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="flex inline-flex items-center gap-1 text-sm text-[var(--brand-accent)] hover:underline"
                      >
                        Google AI Studio <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/10 text-sm font-medium text-[var(--brand-accent)]">
                      2
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-foreground">Run configuration</p>
                      <p className="mb-2 text-sm text-muted-foreground">Open your terminal and run:</p>
                      <code className="block rounded bg-muted px-3 py-2 font-mono text-sm text-[var(--brand-accent)]">
                        gemini config set api_key YOUR_KEY
                      </code>
                    </div>
                  </li>
                </ol>
              </div>

              <button
                onClick={onClose}
                className="mt-8 rounded-lg bg-[var(--brand-accent)] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[var(--brand-accent)]/90"
              >
                Done
              </button>
            </div>
          ) : (
            <StandaloneShell project={DEFAULT_PROJECT_FOR_EMPTY_SHELL} command={command} onComplete={handleComplete} minimal={true} />
          )}
        </div>
      </div>
    </div>
  );
}
