type ShellHeaderProps = {
  isConnected: boolean;
  isInitialized: boolean;
  isRestarting: boolean;
  hasSession: boolean;
  sessionDisplayNameShort: string | null;
  onDisconnect: () => void;
  onRestart: () => void;
  statusNewSessionText: string;
  statusInitializingText: string;
  statusRestartingText: string;
  disconnectLabel: string;
  disconnectTitle: string;
  restartLabel: string;
  restartTitle: string;
  disableRestart: boolean;
};

export default function ShellHeader({
  isConnected,
  isInitialized,
  isRestarting,
  hasSession,
  sessionDisplayNameShort,
  onDisconnect,
  onRestart,
  statusNewSessionText,
  statusInitializingText,
  statusRestartingText,
  disconnectLabel,
  disconnectTitle,
  restartLabel,
  restartTitle,
  disableRestart,
}: ShellHeaderProps) {
  return (
    <div className="terminal-bar flex-shrink-0 border-b border-[var(--line)] bg-[var(--paper-2)] px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`kit-dot ${isConnected ? 'ok' : 'err'}`} />

          {hasSession && sessionDisplayNameShort && (
            <span className="text-xs text-[var(--brand-accent)]">({sessionDisplayNameShort}...)</span>
          )}

          {!hasSession && <span className="text-xs text-[var(--ink-3)]">{statusNewSessionText}</span>}

          {!isInitialized && <span className="text-xs text-[var(--warn)]">{statusInitializingText}</span>}

          {isRestarting && <span className="text-xs text-[var(--brand-accent)]">…{statusRestartingText}</span>}
        </div>

        <div className="flex items-center space-x-3">
          {isConnected && (
            <button
              onClick={onDisconnect}
              className="flex items-center space-x-1 rounded-[var(--radius-1)] bg-[var(--err)] px-3 py-1 text-xs text-[var(--paper)] hover:opacity-90"
              title={disconnectTitle}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{disconnectLabel}</span>
            </button>
          )}

          <button
            onClick={onRestart}
            disabled={disableRestart}
            className="flex items-center space-x-1 text-xs text-[var(--ink-3)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
            title={restartTitle}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{restartLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
