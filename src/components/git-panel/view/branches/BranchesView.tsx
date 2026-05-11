import { Check, GitBranch, Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Branch row
// ---------------------------------------------------------------------------

type BranchRowProps = {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  aheadCount: number;
  behindCount: number;
  isMobile: boolean;
  onSwitch: () => void;
  onDelete: () => void;
};

function BranchRow({ name, isCurrent, isRemote, aheadCount, behindCount, isMobile, onSwitch, onDelete }: BranchRowProps) {
  return (
    <div
      className={`group flex items-center gap-3 border-b border-[var(--line)] px-4 transition-colors hover:bg-[var(--paper-2)] ${
        isMobile ? 'py-2.5' : 'py-3'
      } ${isCurrent ? 'bg-[var(--brand-accent-soft)]' : ''}`}
    >
      {/* Branch icon */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-1)] border ${
        isCurrent
          ? 'border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
          : 'border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink-3)]'
      }`}>
        {isRemote ? <Globe className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
      </div>

      {/* Name + pills */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={`truncate text-sm font-medium ${isCurrent ? 'text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>
            {name}
          </span>
          {isCurrent && (
            <span className="shrink-0 rounded-full bg-[var(--brand-accent-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--brand-accent)]">
              current
            </span>
          )}
          {isRemote && !isCurrent && (
            <span className="shrink-0 rounded-full bg-[var(--paper-3)] px-1.5 py-0.5 text-xs text-[var(--ink-3)]">
              remote
            </span>
          )}
        </div>
        {/* Ahead/behind — only meaningful for the current branch */}
        {isCurrent && (aheadCount > 0 || behindCount > 0) && (
          <div className="flex items-center gap-2 text-xs">
            {aheadCount > 0 && (
              <span className="text-[var(--ok)]">↑{aheadCount} ahead</span>
            )}
            {behindCount > 0 && (
              <span className="text-[var(--brand-accent)]">↓{behindCount} behind</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`flex shrink-0 items-center gap-1 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {isCurrent ? (
          <Check className="h-4 w-4 text-[var(--brand-accent)]" />
        ) : !isRemote ? (
          <>
            <button
              onClick={onSwitch}
              className="rounded-[var(--radius-1)] px-2 py-1 text-xs font-medium text-[var(--ink-3)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
              title={`Switch to ${name}`}
            >
              Switch
            </button>
            <button
              onClick={onDelete}
              className="rounded-[var(--radius-1)] p-1 text-[var(--ink-3)] transition-colors hover:bg-[var(--err-soft)] hover:text-[var(--err)]"
              title={`Delete ${name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-[var(--paper)]/95 sticky top-0 z-10 flex items-center justify-between px-4 py-2">
      <span className="git-eyebrow">{label}</span>
      <span className="git-count rounded-full bg-[var(--paper-3)] px-1.5 py-0.5">{count}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BranchesView
// ---------------------------------------------------------------------------

export default function BranchesView({
  isMobile,
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
      type: 'commit', // reuse neutral type for switch
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
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Create branch button */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <span className="text-sm text-[var(--ink-3)]">
          {localBranches.length} local{remoteBranches.length > 0 ? `, ${remoteBranches.length} remote` : ''}
        </span>
        <button
          onClick={() => setShowNewBranchModal(true)}
          className="git-act flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          New branch
        </button>
      </div>

      {/* Branch list */}
      <div className="flex-1 overflow-y-auto">
        {localBranches.length > 0 && (
          <>
            <SectionHeader label="Local" count={localBranches.length} />
            {localBranches.map((branch) => (
              <BranchRow
                key={`local:${branch}`}
                name={branch}
                isCurrent={branch === currentBranch}
                isRemote={false}
                aheadCount={branch === currentBranch ? aheadCount : 0}
                behindCount={branch === currentBranch ? behindCount : 0}
                isMobile={isMobile}
                onSwitch={() => requestSwitch(branch)}
                onDelete={() => requestDelete(branch)}
              />
            ))}
          </>
        )}

        {remoteBranches.length > 0 && (
          <>
            <SectionHeader label="Remote" count={remoteBranches.length} />
            {remoteBranches.map((branch) => (
              <BranchRow
                key={`remote:${branch}`}
                name={branch}
                isCurrent={false}
                isRemote={true}
                aheadCount={0}
                behindCount={0}
                isMobile={isMobile}
                onSwitch={() => requestSwitch(branch)}
                onDelete={() => requestDelete(branch)}
              />
            ))}
          </>
        )}

        {localBranches.length === 0 && remoteBranches.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
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
