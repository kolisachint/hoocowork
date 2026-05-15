import { ChevronDown, GitCommit, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { ConfirmationRequest } from '../../types/types';

// Persists commit messages across unmount/remount, keyed by project path
const commitMessageCache = new Map<string, string>();

type CommitComposerProps = {
  isMobile: boolean;
  projectPath: string;
  selectedFileCount: number;
  currentBranch: string;
  isHidden: boolean;
  onCommit: (message: string) => Promise<boolean>;
  onGenerateMessage: () => Promise<string | null>;
  onRequestConfirmation: (request: ConfirmationRequest) => void;
};

export default function CommitComposer({
  isMobile,
  projectPath,
  selectedFileCount,
  currentBranch,
  isHidden,
  onCommit,
  onGenerateMessage,
  onRequestConfirmation,
}: CommitComposerProps) {
  const [commitMessage, setCommitMessageRaw] = useState(() => commitMessageCache.get(projectPath) ?? '');

  const setCommitMessage = (msg: string) => {
    setCommitMessageRaw(msg);
    if (msg) {
      commitMessageCache.set(projectPath, msg);
    } else {
      commitMessageCache.delete(projectPath);
    }
  };

  const [isCommitting, setIsCommitting] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const handleCommit = async (message = commitMessage) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || selectedFileCount === 0 || isCommitting) {
      return false;
    }

    setIsCommitting(true);
    try {
      const success = await onCommit(trimmedMessage);
      if (success) {
        setCommitMessage('');
      }
      return success;
    } finally {
      setIsCommitting(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (selectedFileCount === 0 || isGeneratingMessage) {
      return;
    }

    setIsGeneratingMessage(true);
    try {
      const generatedMessage = await onGenerateMessage();
      if (generatedMessage) {
        setCommitMessage(generatedMessage);
      }
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const requestCommitConfirmation = () => {
    const trimmedMessage = commitMessage.trim();
    if (!trimmedMessage || selectedFileCount === 0 || isCommitting) {
      return;
    }

    onRequestConfirmation({
      type: 'commit',
      message: `Commit ${selectedFileCount} file${selectedFileCount !== 1 ? 's' : ''} with message: "${trimmedMessage}"?`,
      onConfirm: async () => {
        await handleCommit(trimmedMessage);
      },
    });
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isHidden ? 'max-h-0 -translate-y-2 overflow-hidden opacity-0' : 'max-h-96 translate-y-0 opacity-100'
      }`}
    >
      {isMobile && isCollapsed ? (
        <div className="border-t border-[var(--line)] px-4 py-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-1)] bg-[var(--ink)] px-3 py-2 text-sm text-[var(--paper)] transition-colors hover:opacity-90"
          >
            <GitCommit className="h-4 w-4" />
            <span>
              Commit {selectedFileCount} file{selectedFileCount !== 1 ? 's' : ''}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="git-commit px-4 pb-3">
          {isMobile && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--ink)]">Commit Changes</span>
              <button onClick={() => setIsCollapsed(true)} className="git-act-icon">
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              value={commitMessage}
              onChange={(event) => setCommitMessage(event.target.value)}
              placeholder="commit message…"
              className="composer-input w-full pr-9"
              rows={2}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  void handleCommit();
                }
              }}
            />
            <button
              onClick={() => void handleGenerateMessage()}
              disabled={selectedFileCount === 0 || isGeneratingMessage}
              className="absolute right-2 top-2 p-1 text-[var(--ink-3)] transition-colors hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
              title="Generate commit message"
              aria-label="Generate commit message"
            >
              {isGeneratingMessage ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="git-commit-foot">
            <span className="composer-hint">
              {selectedFileCount} staged · {currentBranch}
            </span>
            <button
              onClick={requestCommitConfirmation}
              disabled={!commitMessage.trim() || selectedFileCount === 0 || isCommitting}
              className="btn btn-accent text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCommitting ? 'Committing…' : 'Commit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
