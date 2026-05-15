type StandaloneShellHeaderProps = {
  title: string;
  isCompleted: boolean;
  onClose?: (() => void) | null;
};

export default function StandaloneShellHeader({
  title,
  isCompleted,
  onClose = null,
}: StandaloneShellHeaderProps) {
  return (
    <div className="terminal-bar">
      <span className="term-tab active">{title}</span>
      {isCompleted && <span className="term-meta">completed</span>}
      <span className="term-spacer" />
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="term-tab inline-flex items-center gap-1"
          title="Close"
          aria-label="Close"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
