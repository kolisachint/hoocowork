import { AlertCircle, Check, ChevronDown, Download, GitBranch, Plus, RefreshCw, RotateCcw, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ConfirmationRequest, GitRemoteStatus } from '../types/types';

import NewBranchModal from './modals/NewBranchModal';

type GitPanelHeaderProps = {
  isMobile: boolean;
  currentBranch: string;
  branches: string[];
  remoteStatus: GitRemoteStatus | null;
  isLoading: boolean;
  isCreatingBranch: boolean;
  isFetching: boolean;
  isPulling: boolean;
  isPushing: boolean;
  isPublishing: boolean;
  isRevertingLocalCommit: boolean;
  operationError: string | null;
  onRefresh: () => void;
  onRevertLocalCommit: () => Promise<void>;
  onSwitchBranch: (branchName: string) => Promise<boolean>;
  onCreateBranch: (branchName: string) => Promise<boolean>;
  onFetch: () => Promise<void>;
  onPull: () => Promise<void>;
  onPush: () => Promise<void>;
  onPublish: () => Promise<void>;
  onClearError: () => void;
  onRequestConfirmation: (request: ConfirmationRequest) => void;
};

export default function GitPanelHeader({
  isMobile,
  currentBranch,
  branches,
  remoteStatus,
  isLoading,
  isCreatingBranch,
  isFetching,
  isPulling,
  isPushing,
  isPublishing,
  isRevertingLocalCommit,
  operationError,
  onRefresh,
  onRevertLocalCommit,
  onSwitchBranch,
  onCreateBranch,
  onFetch,
  onPull,
  onPush,
  onPublish,
  onClearError,
  onRequestConfirmation,
}: GitPanelHeaderProps) {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aheadCount = remoteStatus?.ahead ?? 0;
  const behindCount = remoteStatus?.behind ?? 0;
  const remoteName = remoteStatus?.remoteName ?? 'remote';
  const anyPending = isFetching || isPulling || isPushing || isPublishing;

  const requestPullConfirmation = () => {
    onRequestConfirmation({
      type: 'pull',
      message: `Pull ${behindCount} commit${behindCount !== 1 ? 's' : ''} from ${remoteName}?`,
      onConfirm: onPull,
    });
  };

  const requestPushConfirmation = () => {
    onRequestConfirmation({
      type: 'push',
      message: `Push ${aheadCount} commit${aheadCount !== 1 ? 's' : ''} to ${remoteName}?`,
      onConfirm: onPush,
    });
  };

  const requestPublishConfirmation = () => {
    onRequestConfirmation({
      type: 'publish',
      message: `Publish branch "${currentBranch}" to ${remoteName}?`,
      onConfirm: onPublish,
    });
  };

  const requestRevertLocalCommitConfirmation = () => {
    onRequestConfirmation({
      type: 'revertLocalCommit',
      message: 'Revert the latest local commit? This removes the commit but keeps its changes staged.',
      onConfirm: onRevertLocalCommit,
    });
  };

  const handleSwitchBranch = async (branchName: string) => {
    try {
      const success = await onSwitchBranch(branchName);
      if (success) setShowBranchDropdown(false);
    } catch (error) {
      console.error('[GitPanelHeader] Failed to switch branch:', error);
    }
  };

  return (
    <>
      <div className={`git-header ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
        {/* Branch picker */}
        <div className="git-branch-wrap" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowBranchDropdown((prev) => !prev)}
            className="git-branch"
            title={`Branch: ${currentBranch}`}
          >
            <GitBranch className="h-3 w-3 text-[var(--ink-3)]" />
            <span className="git-branch-name">{currentBranch}</span>
            {remoteStatus?.hasRemote && (
              <span className="git-rs">
                {aheadCount > 0 && (
                  <span className="git-ahead" title={`${aheadCount} ahead`}>↑{aheadCount}</span>
                )}
                {behindCount > 0 && (
                  <span className="git-behind" title={`${behindCount} behind`}>↓{behindCount}</span>
                )}
                {remoteStatus.isUpToDate && aheadCount === 0 && behindCount === 0 && (
                  <span className="text-[var(--ink-3)]" title="Up to date">✓</span>
                )}
              </span>
            )}
            <ChevronDown
              className={`h-3 w-3 text-[var(--ink-3)] transition-transform ${
                showBranchDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showBranchDropdown && (
            <div className="git-branch-dd">
              <div className="git-dd-eyebrow">Local</div>
              <div className="max-h-64 overflow-y-auto">
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => void handleSwitchBranch(branch)}
                    className={`git-dd-row ${branch === currentBranch ? 'current' : ''}`}
                  >
                    {branch === currentBranch ? (
                      <Check className="h-3 w-3 shrink-0 text-[var(--brand-accent)]" />
                    ) : (
                      <span className="inline-block w-3 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">{branch}</span>
                  </button>
                ))}
              </div>
              <div className="git-dd-sep" />
              <button
                className="git-dd-row git-dd-action"
                onClick={() => {
                  setShowNewBranchModal(true);
                  setShowBranchDropdown(false);
                }}
              >
                <Plus className="h-3 w-3 shrink-0" />
                <span>Create new branch…</span>
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="git-actions">
          {remoteStatus?.hasRemote && (
            <>
              {!remoteStatus.hasUpstream ? (
                <button
                  onClick={requestPublishConfirmation}
                  disabled={anyPending}
                  className="git-act git-act-push"
                  title={`Publish "${currentBranch}" to ${remoteName}`}
                >
                  <Upload className={`h-3 w-3 ${isPublishing ? 'animate-pulse' : ''}`} />
                  {!isMobile && <span className="git-act-label">{isPublishing ? 'Publishing…' : 'Publish'}</span>}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => void onFetch()}
                    disabled={anyPending}
                    className="git-act git-act-default"
                    title={`Fetch from ${remoteName}`}
                  >
                    <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                    {!isMobile && <span className="git-act-label">{isFetching ? 'Fetching…' : 'Fetch'}</span>}
                  </button>

                  {behindCount > 0 && (
                    <button
                      onClick={requestPullConfirmation}
                      disabled={anyPending}
                      className="git-act git-act-pull"
                      title={`Pull ${behindCount} from ${remoteName}`}
                    >
                      <Download className={`h-3 w-3 ${isPulling ? 'animate-pulse' : ''}`} />
                      {!isMobile && (
                        <span className="git-act-label">{isPulling ? 'Pulling…' : `Pull ${behindCount}`}</span>
                      )}
                    </button>
                  )}

                  {aheadCount > 0 && (
                    <button
                      onClick={requestPushConfirmation}
                      disabled={anyPending}
                      className="git-act git-act-push"
                      title={`Push ${aheadCount} to ${remoteName}`}
                    >
                      <Upload className={`h-3 w-3 ${isPushing ? 'animate-pulse' : ''}`} />
                      {!isMobile && (
                        <span className="git-act-label">{isPushing ? 'Pushing…' : `Push ${aheadCount}`}</span>
                      )}
                    </button>
                  )}
                </>
              )}
            </>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="git-act-icon disabled:opacity-50"
            title="Refresh git status"
            aria-label="Refresh git status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={requestRevertLocalCommitConfirmation}
            disabled={isRevertingLocalCommit}
            className="git-act-icon disabled:opacity-50"
            title="Revert latest local commit"
            aria-label="Revert latest local commit"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRevertingLocalCommit ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {operationError && (
        <div className="flex items-start gap-2 border-b border-[var(--err-soft)] bg-[var(--err-soft)] px-4 py-2.5 text-sm text-[var(--err)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1 leading-snug">{operationError}</span>
          <button
            onClick={onClearError}
            className="shrink-0 rounded p-0.5 hover:bg-[var(--err-soft)]"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <NewBranchModal
        isOpen={showNewBranchModal}
        currentBranch={currentBranch}
        isCreatingBranch={isCreatingBranch}
        onClose={() => setShowNewBranchModal(false)}
        onCreateBranch={onCreateBranch}
      />
    </>
  );
}
