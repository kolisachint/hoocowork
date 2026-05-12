import { GitBranch, Mail, User } from 'lucide-react';

type GitConfigurationStepProps = {
  gitName: string;
  gitEmail: string;
  isSubmitting: boolean;
  onGitNameChange: (value: string) => void;
  onGitEmailChange: (value: string) => void;
};

export default function GitConfigurationStep({
  gitName,
  gitEmail,
  isSubmitting,
  onGitNameChange,
  onGitEmailChange,
}: GitConfigurationStepProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-accent-soft)]">
          <GitBranch className="h-8 w-8 text-[var(--brand-accent)]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-[var(--ink)]">Git Configuration</h2>
        <p className="text-[var(--ink-3)]">
          Configure your git identity to ensure proper attribution for commits.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="gitName" className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
            <User className="h-4 w-4" />
            Git Name <span className="text-[var(--err)]">*</span>
          </label>
          <input
            type="text"
            id="gitName"
            value={gitName}
            onChange={(event) => onGitNameChange(event.target.value)}
            className="input w-full px-4 py-3"
            placeholder="John Doe"
            required
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-[var(--ink-3)]">Saved as `git config --global user.name`.</p>
        </div>

        <div>
          <label htmlFor="gitEmail" className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
            <Mail className="h-4 w-4" />
            Git Email <span className="text-[var(--err)]">*</span>
          </label>
          <input
            type="email"
            id="gitEmail"
            value={gitEmail}
            onChange={(event) => onGitEmailChange(event.target.value)}
            className="input w-full px-4 py-3"
            placeholder="john@example.com"
            required
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-[var(--ink-3)]">Saved as `git config --global user.email`.</p>
        </div>
      </div>
    </div>
  );
}
