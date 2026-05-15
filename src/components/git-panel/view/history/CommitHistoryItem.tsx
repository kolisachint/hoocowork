import { useMemo } from 'react';

import type { GitCommitSummary } from '../../types/types';
import { getStatusBadgeClass, parseCommitFiles } from '../../utils/gitPanelUtils';
import GitDiffViewer from '../shared/GitDiffViewer';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type CommitHistoryItemProps = {
  commit: GitCommitSummary;
  isExpanded: boolean;
  diff?: string;
  isMobile: boolean;
  wrapText: boolean;
  onToggle: () => void;
};

export default function CommitHistoryItem({
  commit,
  isExpanded,
  diff,
  isMobile,
  wrapText,
  onToggle,
}: CommitHistoryItemProps) {
  const fileSummary = useMemo(() => {
    if (!diff) return null;
    return parseCommitFiles(diff);
  }, [diff]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        className="git-log-row w-full cursor-pointer border-0 bg-transparent text-left"
        onClick={onToggle}
      >
        <span className="git-sha">{commit.hash.substring(0, 7)}</span>
        <div className="min-w-0">
          <div className="git-log-subject truncate text-sm">{commit.message}</div>
          <div className="git-log-meta">
            {commit.author}
            {' · '}
            {commit.date}
          </div>
        </div>
      </button>

      {isExpanded && diff && (
        <div className="bg-[var(--paper-2)]">
          <div className="max-h-[32rem] overflow-y-auto p-3">
            <p className="mb-2 select-all font-mono text-xs text-[var(--ink-3)]">{commit.hash}</p>

            <div className="mb-3 flex gap-4 text-xs text-[var(--ink-3)]">
              <span>
                <span className="text-[var(--ink-3)]">Author </span>
                {commit.author}
              </span>
              <span>
                <span className="text-[var(--ink-3)]">Date </span>
                {formatDate(commit.date)}
              </span>
            </div>

            {fileSummary && (
              <div className="mb-3 flex gap-4 rounded-[var(--radius-1)] bg-[var(--paper-3)] px-4 py-2 text-center text-xs">
                <div>
                  <div className="text-[var(--ink-3)]">Files</div>
                  <div className="font-semibold text-[var(--ink)]">{fileSummary.totalFiles}</div>
                </div>
                <div>
                  <div className="text-[var(--ink-3)]">Added</div>
                  <div className="font-semibold text-[var(--ok)]">+{fileSummary.totalInsertions}</div>
                </div>
                <div>
                  <div className="text-[var(--ink-3)]">Removed</div>
                  <div className="font-semibold text-[var(--err)]">-{fileSummary.totalDeletions}</div>
                </div>
              </div>
            )}

            {fileSummary && fileSummary.files.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-3)]">
                  Changed Files
                </p>
                <div className="rounded-[var(--radius-1)] border border-[var(--line)]">
                  {fileSummary.files.map((file, idx) => (
                    <div
                      key={file.path}
                      className={`flex items-center gap-2 px-2.5 py-1.5 text-xs ${
                        idx < fileSummary.files.length - 1 ? 'border-b border-[var(--line)]' : ''
                      }`}
                    >
                      <span
                        className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[var(--fs-xs)] font-bold ${getStatusBadgeClass(file.status)}`}
                      >
                        {file.status}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {file.directory && <span className="text-[var(--ink-3)]">{file.directory}</span>}
                        <span className="font-medium text-[var(--ink)]">{file.filename}</span>
                      </span>
                      <span className="git-lines flex-shrink-0 font-mono">
                        {file.insertions > 0 && <span className="text-[var(--ok)]">+{file.insertions}</span>}
                        {file.insertions > 0 && file.deletions > 0 && '/'}
                        {file.deletions > 0 && <span className="text-[var(--err)]">-{file.deletions}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <GitDiffViewer diff={diff} isMobile={isMobile} wrapText={wrapText} />
          </div>
        </div>
      )}
    </div>
  );
}
