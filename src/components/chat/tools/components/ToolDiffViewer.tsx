import React, { useMemo } from 'react';

type DiffLine = {
  type: string;
  content: string;
  lineNum: number;
};

interface ToolDiffViewerProps {
  oldContent: string;
  newContent: string;
  filePath: string;
  createDiff: (oldStr: string, newStr: string) => DiffLine[];
  onFileClick?: () => void;
  badge?: string;
  badgeColor?: 'gray' | 'green';
}

/**
 * Compact diff viewer — VS Code-style
 */
export const ToolDiffViewer: React.FC<ToolDiffViewerProps> = ({
  oldContent,
  newContent,
  filePath,
  createDiff,
  onFileClick,
  badge = 'Diff',
  badgeColor = 'gray'
}) => {
  const badgeClasses = badgeColor === 'green'
    ? 'bg-[var(--ok-soft)] text-[var(--ok)]'
    : 'bg-[var(--paper-3)] text-[var(--ink-3)]';

  const diffLines = useMemo(
    () => {
      if (oldContent === undefined || newContent === undefined) {
        return [];
      }
      return createDiff(oldContent, newContent)
    },
    [createDiff, oldContent, newContent]
  );

  return (
    <div className="overflow-hidden rounded-[var(--radius-1)] border border-[var(--line)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper-2)] px-2.5 py-1">
        {onFileClick ? (
          <button
            onClick={onFileClick}
            className="cursor-pointer truncate font-mono text-[11px] text-[var(--brand-accent)] transition-colors hover:opacity-80"
          >
            {filePath}
          </button>
        ) : (
          <span className="truncate font-mono text-[11px] text-[var(--ink-3)]">
            {filePath}
          </span>
        )}
        <span className={`rounded px-1.5 py-px text-[10px] font-medium ${badgeClasses} ml-2 flex-shrink-0`}>
          {badge}
        </span>
      </div>

      {/* Diff lines */}
      <div className="font-mono text-[11px] leading-[18px]">
        {diffLines.map((diffLine, i) => (
          <div key={i} className="flex">
            <span
              className={`w-6 flex-shrink-0 select-none text-center ${
                diffLine.type === 'removed'
                  ? 'bg-[var(--err-soft)] text-[var(--err)]'
                  : 'bg-[var(--ok-soft)] text-[var(--ok)]'
              }`}
            >
              {diffLine.type === 'removed' ? '-' : '+'}
            </span>
            <span
              className={`flex-1 whitespace-pre-wrap px-2 ${
                diffLine.type === 'removed'
                  ? 'bg-[var(--err-soft)]/50 text-[var(--ink)]'
                  : 'bg-[var(--ok-soft)]/50 text-[var(--ink)]'
              }`}
            >
              {diffLine.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
