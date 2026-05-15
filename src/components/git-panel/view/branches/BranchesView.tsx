import { GitBranch, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { ConfirmationRequest, GitRemoteStatus } from '../../types/types';
import NewBranchModal from '../modals/NewBranchModal';

type BranchesViewProps = {
  isMobile: boolean;
  isLoading: boolean;
  currentBranch: string;
  localBranches: string[];
  remoteBranches: string[];
  remoteStatus: GitRemoteStatus | null;
  isCreatingBranch: boolean;
  onSwitchBranch: (branchName: string) => Promise<boolean>;
  onCreateBranch: (branchName: string) => Promise<boolean>;
  onDeleteBranch: (branchName: string) => Promise<boolean>;
  onRequestConfirmation: (request: ConfirmationRequest) => void;
};

type BranchRowProps = {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  aheadCount: number;
  behindCount: number;
  onSwitch: () => void;
  onDelete: () => void;
};

function BranchRow({ name, isCurrent, isRemote, aheadCount, behindCount, onSwitch, onDelete }: BranchRowProps) {
  return (
    <div className={`group git-br-row ${isCurrent ? 'current' : ''}`}>
      <span className="git-br-glyph">{isRemote ? '◉' : '⎇'}</span>
      <span className="git-br-name truncate">{name}</span>

      {isCurrent ? (
        <>
          <span className="git-br-pill">current</span>
          <span className="git-rs">
            {aheadCount > 0 && <span className="git-ahead">↑{aheadCount}</span>}
            {behindCount > 0 && <span className="git-behind">↓{behindCount}</span>}
          </span>
        </>
      ) : isRemote ? (
        <>
          <span className="git-br-pill git-br-pill-muted">remote</span>
          <span aria-hidden />
        </>
      ) : (
        <>
          <button
            onClick={onSwitch}
            className="git-act-mini-text opacity-0 transition-opacity group-hover:opacity-100"
            title={`Switch to ${name}`}
          >
            switch
          </button>
          <button
            onClick={onDelete}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-[var(--radius-1)] border border-[var(--line)] text-[var(--ink-3)] opacity-0 transition-opacity hover:border-[var(--err)] hover:bg-[var(--err-soft)] hover:text-[var(--err)] group-hover:opacity-100"
            title={`Delete ${name}`}
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  );
}

export default function BranchesView({
  isLoading,
  currentBranch,
  localBranches,
  remoteBranches,
  remoteStatus,
  isCreatingBranch,
  onSwitchBranch,
  onCreateBranch,
  onDeleteBranch,
  onRequestConfirmation,
}: BranchesViewProps) {
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);

  const aheadCount = remoteStatus?.ahead ?? 0;
  const behindCount = remoteStatus?.behind ?? 0;

  const requestSwitch = (branch: string) => {
    onRequestConfirmation({
      type: 'commit',
      message: `Switch to branch "${branch}"? Make sure you have no uncommitted changes.`,
      onConfirm: () => void onSwitchBranch(branch),
    });
  };

  const requestDelete = (branch: string) => {
    onRequestConfirmation({
      type: 'deleteBranch',
      message: `Delete branch "${branch}"? This cannot be undone.`,
      onConfirm: () => void onDeleteBranch(branch),
    });
  };

  if (isLoading && localBranches.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-[var(--ink-3)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {localBranches.length > 0 && (
          <>
            <div className="git-branches-head">
              <span className="git-eyebrow">Local · {localBranches.length}</span>
              <button
                onClick={() => setShowNewBranchModal(true)}
                className="git-act-mini-text"
                title="Create new branch"
              >
                + new branch
              </button>
            </div>
            <div className="git-branches">
              {localBranches.map((branch) => (
                <BranchRow
                  key={`local:${branch}`}
                  name={branch}
                  isCurrent={branch === currentBranch}
                  isRemote={false}
                  aheadCount={branch === currentBranch ? aheadCount : 0}
                  behindCount={branch === currentBranch ? behindCount : 0}
                  onSwitch={() => requestSwitch(branch)}
                  onDelete={() => requestDelete(branch)}
                />
              ))}
            </div>
          </>
        )}

        {remoteBranches.length > 0 && (
          <>
            <div className="git-branches-head" style={{ marginTop: 12 }}>
              <span className="git-eyebrow">Remote · {remoteBranches.length}</span>
            </div>
            <div className="git-branches">
              {remoteBranches.map((branch) => (
                <BranchRow
                  key={`remote:${branch}`}
                  name={branch}
                  isCurrent={false}
                  isRemote
                  aheadCount={0}
                  behindCount={0}
                  onSwitch={() => requestSwitch(branch)}
                  onDelete={() => requestDelete(branch)}
                />
              ))}
            </div>
          </>
        )}

        {localBranches.length === 0 && remoteBranches.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-[var(--ink-3)]">
            <GitBranch className="h-10 w-10 opacity-30" />
            <p className="text-sm">No branches found</p>
          </div>
        )}
      </div>

      <NewBranchModal
        isOpen={showNewBranchModal}
        currentBranch={currentBranch}
        isCreatingBranch={isCreatingBranch}
        onClose={() => setShowNewBranchModal(false)}
        onCreateBranch={onCreateBranch}
      />
    </div>
  );
}
