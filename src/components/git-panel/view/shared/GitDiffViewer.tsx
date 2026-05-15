import { useMemo } from 'react';

type GitDiffViewerProps = {
  diff: string | null;
  isMobile: boolean;
  wrapText: boolean;
};

const PREVIEW_CHARACTER_LIMIT = 200_000;
const PREVIEW_LINE_LIMIT = 1_500;

type DiffPreview = {
  lines: string[];
  isCharacterTruncated: boolean;
  isLineTruncated: boolean;
};

function buildDiffPreview(diff: string): DiffPreview {
  const isCharacterTruncated = diff.length > PREVIEW_CHARACTER_LIMIT;
  const previewText = isCharacterTruncated ? diff.slice(0, PREVIEW_CHARACTER_LIMIT) : diff;
  const previewLines = previewText.split('\n');
  const isLineTruncated = previewLines.length > PREVIEW_LINE_LIMIT;

  return {
    lines: isLineTruncated ? previewLines.slice(0, PREVIEW_LINE_LIMIT) : previewLines,
    isCharacterTruncated,
    isLineTruncated,
  };
}

export default function GitDiffViewer({ diff, isMobile, wrapText }: GitDiffViewerProps) {
  // Render a bounded preview to keep huge commit diffs from freezing the UI thread.
  const preview = useMemo(() => buildDiffPreview(diff || ''), [diff]);
  const isPreviewTruncated = preview.isCharacterTruncated || preview.isLineTruncated;

  if (!diff) {
    return (
      <div className="p-4 text-center text-sm text-[var(--ink-3)]">
        No diff available
      </div>
    );
  }

  const renderDiffLine = (line: string, index: number) => {
    const isAddition = line.startsWith('+') && !line.startsWith('+++');
    const isDeletion = line.startsWith('-') && !line.startsWith('---');
    const isHeader = line.startsWith('@@');

    return (
      <div
        key={index}
        className={`px-3 py-0.5 font-mono text-xs ${isMobile && wrapText ? 'whitespace-pre-wrap break-all' : 'overflow-x-auto whitespace-pre'
          } ${isAddition ? 'bg-[var(--ok-soft)] text-[var(--ok)]' :
            isDeletion ? 'bg-[var(--err-soft)] text-[var(--err)]' :
              isHeader ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' :
                'text-[var(--ink-3)]'
          }`}
      >
        {line}
      </div>
    );
  };

  return (
    <div className="diff-viewer">
      {isPreviewTruncated && (
        <div className="mb-2 rounded-[var(--radius-1)] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink-3)]">
          Large diff preview: rendering is limited to keep the tab responsive.
        </div>
      )}
      {preview.lines.map((line, index) => renderDiffLine(line, index))}
    </div>
  );
}
