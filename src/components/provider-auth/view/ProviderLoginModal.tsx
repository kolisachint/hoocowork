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
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-shell cli-select h-3/4 w-full max-w-4xl max-md:m-0 max-md:h-full max-md:max-w-none max-md:rounded-none md:m-4 md:h-3/4 md:max-w-4xl">
        <div className="modal-head">
          <div className="modal-head-title">
            <h3>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close login modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {provider === 'gemini' ? (
            <div className="modal-body items-center justify-center text-center" style={{ background: 'var(--paper-2)' }}>
              <div className="bg-[var(--brand-accent)]/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <KeyRound className="h-8 w-8 text-[var(--brand-accent)]" />
              </div>

              <h4 className="mb-3 text-xl font-medium text-foreground">Setup Gemini API Access</h4>

              <p className="mb-8 max-w-md text-muted-foreground">
                The Gemini CLI requires an API key to function. Configure it in your terminal first.
              </p>

              <div className="plm-gemini-steps w-full max-w-lg">
                <div className="plm-gemini-step">
                  <div className="plm-step-num">1</div>
                  <div className="plm-step-text">
                    <p className="text-sm font-medium text-foreground m-0">Get your API key</p>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-[var(--brand-accent)] hover:underline"
                    >
                      Google AI Studio <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="plm-gemini-step">
                  <div className="plm-step-num">2</div>
                  <div className="plm-step-text">
                    <p className="text-sm font-medium text-foreground m-0">Run configuration</p>
                    <p className="text-sm text-muted-foreground m-0">Open your terminal and run:</p>
                    <code>gemini config set api_key YOUR_KEY</code>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-solid mt-8"
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
