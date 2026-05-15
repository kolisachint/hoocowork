import { GitBranch } from 'lucide-react';

type GitRepositoryErrorStateProps = {
  error: string;
  details?: string;
};

export default function GitRepositoryErrorState({ error, details }: GitRepositoryErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-[var(--ink-3)]">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[var(--radius-2)] bg-[var(--paper-2)]">
        <GitBranch className="h-8 w-8 opacity-40" />
      </div>
      <h3 className="mb-3 text-center text-lg font-medium text-[var(--ink)]">{error}</h3>
      {details && (
        <p className="mb-6 max-w-md text-center text-sm leading-relaxed">{details}</p>
      )}
      <div className="max-w-md rounded-[var(--radius-2)] border border-[var(--brand-accent-soft)] bg-[var(--brand-accent-soft)] p-4">
        <p className="text-center text-sm text-[var(--brand-accent)]">
          <strong>Tip:</strong> Run{' '}
          <code className="rounded-[var(--radius-1)] bg-[var(--brand-accent-soft)] px-2 py-1 font-mono text-xs">git init</code>{' '}
          in your project directory to initialize git source control.
        </p>
      </div>
    </div>
  );
}
