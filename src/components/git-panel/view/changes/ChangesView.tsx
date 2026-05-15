import { GitBranch, GitCommit, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ConfirmationRequest, FileStatusCode, GitDiffMap, GitStatusResponse } from '../../types/types';
import { getAllChangedFiles, hasChangedFiles } from '../../utils/gitPanelUtils';

import CommitComposer from './CommitComposer';
import FileChangeList from './FileChangeList';

type ChangesViewProps = {
  isMobile: boolean;
  projectPath: string;
  currentBranch: string;
  gitStatus: GitStatusResponse | null;
  gitDiff: GitDiffMap;
  isLoading: boolean;
  wrapText: boolean;
  isCreatingInitialCommit: boolean;
  onWrapTextChange: (wrapText: boolean) => void;
  onCreateInitialCommit: () => Promise<boolean>;
  onOpenFile: (filePath: string) => Promise<void>;
  onDiscardFile: (filePath: string) => Promise<void>;
  onDeleteFile: (filePath: string) => Promise<void>;
  onCommitChanges: (message: string, files: string[]) => Promise<boolean>;
  onGenerateCommitMessage: (files: string[]) => Promise<string | null>;
  onRequestConfirmation: (request: ConfirmationRequest) => void;
  onExpandedFilesChange: (hasExpandedFiles: boolean) => void;
};

export default function ChangesView({
  isMobile,
  projectPath,
  currentBranch,
  gitStatus,
  gitDiff,
  isLoading,
  wrapText,
  isCreatingInitialCommit,
  onWrapTextChange,
  onCreateInitialCommit,
  onOpenFile,
  onDiscardFile,
  onDeleteFile,
  onCommitChanges,
  onGenerateCommitMessage,
  onRequestConfirmation,
  onExpandedFilesChange,
}: ChangesViewProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const changedFiles = useMemo(() => getAllChangedFiles(gitStatus), [gitStatus]);
  const hasExpandedFiles = expandedFiles.size > 0;

  useEffect(() => {
    if (!gitStatus || gitStatus.error) {
      setSelectedFiles(new Set());
      return;
    }

    setSelectedFiles((prev) => {
      const allFiles = new Set(getAllChangedFiles(gitStatus));
      const next = new Set([...prev].filter((f) => allFiles.has(f)));
      return next;
    });
  }, [gitStatus]);

  useEffect(() => {
    onExpandedFilesChange(hasExpandedFiles);
  }, [hasExpandedFiles, onExpandedFilesChange]);

  useEffect(() => {
    return () => {
      onExpandedFilesChange(false);
    };
  }, [onExpandedFilesChange]);

  const toggleFileExpanded = useCallback((filePath: string) => {
    setExpandedFiles((previous) => {
      const next = new Set(previous);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  const toggleFileSelected = useCallback((filePath: string) => {
    setSelectedFiles((previous) => {
      const next = new Set(previous);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  const requestFileAction = useCallback(
    (filePath: string, status: FileStatusCode) => {
      if (status === 'U') {
        onRequestConfirmation({
          type: 'delete',
          message: `Delete untracked file "${filePath}"? This action cannot be undone.`,
          onConfirm: async () => {
            await onDeleteFile(filePath);
          },
        });
        return;
      }

      onRequestConfirmation({
        type: 'discard',
        message: `Discard all changes to "${filePath}"? This action cannot be undone.`,
        onConfirm: async () => {
          await onDiscardFile(filePath);
        },
      });
    },
    [onDeleteFile, onDiscardFile, onRequestConfirmation],
  );

  const commitSelectedFiles = useCallback(
    (message: string) => {
      return onCommitChanges(message, Array.from(selectedFiles));
    },
    [onCommitChanges, selectedFiles],
  );

  const generateMessageForSelection = useCallback(() => {
    return onGenerateCommitMessage(Array.from(selectedFiles));
  }, [onGenerateCommitMessage, selectedFiles]);

  const unstagedFiles = useMemo(
    () => new Set(changedFiles.filter((f) => !selectedFiles.has(f))),
    [changedFiles, selectedFiles],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-[var(--ink-3)]" />
          </div>
        ) : gitStatus?.hasCommits === false ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-2)] bg-[var(--paper-2)]">
              <GitBranch className="h-7 w-7 text-[var(--ink-3)]" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-[var(--ink)]">No commits yet</h3>
            <p className="mb-6 max-w-md text-sm text-[var(--ink-3)]">
              This repository doesn&apos;t have any commits yet. Create your first commit to start tracking changes.
            </p>
            <button
              onClick={() => void onCreateInitialCommit()}
              disabled={isCreatingInitialCommit}
              className="flex items-center gap-2 rounded-[var(--radius-1)] bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingInitialCommit ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Initial Commit...</span>
                </>
              ) : (
                <>
                  <GitCommit className="h-4 w-4" />
                  <span>Create Initial Commit</span>
                </>
              )}
            </button>
          </div>
        ) : !gitStatus || !hasChangedFiles(gitStatus) ? (
          <div className="flex h-32 flex-col items-center justify-center text-[var(--ink-3)]">
            <GitCommit className="mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">No changes detected</p>
          </div>
        ) : (
          <div className={isMobile ? 'pb-4' : ''}>
            {/* STAGED section */}
            <div className="git-eyebrow-row mt-2 px-3 py-1">
              <span className="git-eyebrow">Staged</span>
              <span className="flex items-center gap-2">
                <span className="git-count">{selectedFiles.size}</span>
                {selectedFiles.size > 0 && (
                  <button
                    onClick={() => setSelectedFiles(new Set())}
                    className="git-act-mini-text"
                    title="Unstage all"
                  >
                    unstage all
                  </button>
                )}
              </span>
            </div>
            <div className="git-list px-2">
              {selectedFiles.size === 0 ? (
                <div className="git-empty">no staged files</div>
              ) : (
                <FileChangeList
                  gitStatus={gitStatus}
                  gitDiff={gitDiff}
                  expandedFiles={expandedFiles}
                  selectedFiles={selectedFiles}
                  isMobile={isMobile}
                  wrapText={wrapText}
                  filePaths={selectedFiles}
                  onToggleSelected={toggleFileSelected}
                  onToggleExpanded={toggleFileExpanded}
                  onOpenFile={(filePath) => {
                    void onOpenFile(filePath);
                  }}
                  onToggleWrapText={() => onWrapTextChange(!wrapText)}
                  onRequestFileAction={requestFileAction}
                />
              )}
            </div>

            {/* CHANGES section */}
            <div className="git-eyebrow-row mt-3 px-3 py-1">
              <span className="git-eyebrow">Changes</span>
              <span className="flex items-center gap-2">
                <span className="git-count">{unstagedFiles.size}</span>
                {unstagedFiles.size > 0 && (
                  <button
                    onClick={() => setSelectedFiles(new Set(changedFiles))}
                    className="git-act-mini-text"
                    title="Stage all"
                  >
                    stage all
                  </button>
                )}
              </span>
            </div>
            <div className="git-list px-2">
              {unstagedFiles.size === 0 ? (
                <div className="git-empty">all changes staged</div>
              ) : (
                <FileChangeList
                  gitStatus={gitStatus}
                  gitDiff={gitDiff}
                  expandedFiles={expandedFiles}
                  selectedFiles={selectedFiles}
                  isMobile={isMobile}
                  wrapText={wrapText}
                  filePaths={unstagedFiles}
                  onToggleSelected={toggleFileSelected}
                  onToggleExpanded={toggleFileExpanded}
                  onOpenFile={(filePath) => {
                    void onOpenFile(filePath);
                  }}
                  onToggleWrapText={() => onWrapTextChange(!wrapText)}
                  onRequestFileAction={requestFileAction}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <CommitComposer
        isMobile={isMobile}
        projectPath={projectPath}
        selectedFileCount={selectedFiles.size}
        currentBranch={currentBranch}
        isHidden={hasExpandedFiles}
        onCommit={commitSelectedFiles}
        onGenerateMessage={generateMessageForSelection}
        onRequestConfirmation={onRequestConfirmation}
      />
    </div>
  );
}
