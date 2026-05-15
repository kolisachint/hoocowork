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

// Terminal palette is fixed to the design's dark theme regardless of app theme,
// so colors here are inlined hex (matching `--err` / `--brand-accent` in dark mode).
const ERR_COLOR = '#D9788A';
const ACC_COLOR = '#D6926B';

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
    <div className="terminal-bar">
      <span className={`kit-dot ${isConnected ? 'ok' : 'err'}`} />

      {hasSession && sessionDisplayNameShort && (
        <span className="term-tab active">{sessionDisplayNameShort}…</span>
      )}

      {!hasSession && <span className="term-meta">{statusNewSessionText}</span>}

      {!isInitialized && (
        <span className="term-meta" style={{ color: ERR_COLOR }}>
          {statusInitializingText}
        </span>
      )}

      {isRestarting && (
        <span className="term-meta" style={{ color: ACC_COLOR }}>
          …{statusRestartingText}
        </span>
      )}

      <span className="term-spacer" />

      {isConnected && (
        <button
          type="button"
          onClick={onDisconnect}
          className="term-tab inline-flex items-center gap-1"
          style={{ color: ERR_COLOR }}
          title={disconnectTitle}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{disconnectLabel}</span>
        </button>
      )}

      <button
        type="button"
        onClick={onRestart}
        disabled={disableRestart}
        className="term-tab inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
        title={restartTitle}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
  );
}
