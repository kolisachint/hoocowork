import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

type NewBranchModalProps = {
  isOpen: boolean;
  currentBranch: string;
  isCreatingBranch: boolean;
  onClose: () => void;
  onCreateBranch: (branchName: string) => Promise<boolean>;
};

export default function NewBranchModal({
  isOpen,
  currentBranch,
  isCreatingBranch,
  onClose,
  onCreateBranch,
}: NewBranchModalProps) {
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNewBranchName('');
    }
  }, [isOpen]);

  const handleCreateBranch = async (): Promise<boolean> => {
    const branchName = newBranchName.trim();
    if (!branchName) {
      return false;
    }

    try {
      const success = await onCreateBranch(branchName);
      if (success) {
        setNewBranchName('');
        onClose();
      }
      return success;
    } catch (error) {
      console.error('Failed to create branch:', error);
      return false;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-shell relative w-full max-w-md overflow-hidden rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-branch-title"
      >
        <div className="modal-head">
          <div className="modal-head-title">
            <h3 id="new-branch-title">Create New Branch</h3>
          </div>
        </div>

        <div className="modal-body">
          <div>
            <label htmlFor="git-new-branch-name" className="mb-2 block text-[var(--fs-sm)] font-medium text-[var(--ink-2)]">
              Branch Name
            </label>
            <input
              id="git-new-branch-name"
              type="text"
              value={newBranchName}
              onChange={(event) => setNewBranchName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !isCreatingBranch) {
                  event.preventDefault();
                  event.stopPropagation();
                  void handleCreateBranch();
                  return;
                }

                if (event.key === 'Escape' && !isCreatingBranch) {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose();
                }
              }}
              placeholder="feature/new-feature"
              className="w-full rounded-[var(--radius-1)] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:border-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              autoFocus
            />
          </div>

          <p className="text-[var(--fs-base)] text-[var(--ink-3)]">
            This will create a new branch from the current branch ({currentBranch})
          </p>
        </div>

        <div className="modal-foot">
          <button
            onClick={onClose}
            className="rounded-[var(--radius-1)] px-4 py-2 text-[var(--fs-sm)] text-[var(--ink-3)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleCreateBranch()}
            disabled={!newBranchName.trim() || isCreatingBranch}
            className="flex items-center gap-2 rounded-[var(--radius-1)] bg-[var(--ink)] px-4 py-2 text-[var(--fs-sm)] text-[var(--paper)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreatingBranch ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                <span>Create Branch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
