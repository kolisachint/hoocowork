import { ChevronRight, Trash2 } from 'lucide-react';

import type { FileStatusCode } from '../../types/types';
import { getStatusBadgeClass, getStatusLabel } from '../../utils/gitPanelUtils';
import GitDiffViewer from '../shared/GitDiffViewer';

type FileChangeItemProps = {
  filePath: string;
  status: FileStatusCode;
  isMobile: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  diff?: string;
  wrapText: boolean;
  onToggleSelected: (filePath: string) => void;
  onToggleExpanded: (filePath: string) => void;
  onOpenFile: (filePath: string) => void;
  onToggleWrapText: () => void;
  onRequestFileAction: (filePath: string, status: FileStatusCode) => void;
};

export default function FileChangeItem({
  filePath,
  status,
  isMobile,
  isExpanded,
  isSelected,
  diff,
  wrapText,
  onToggleSelected,
  onToggleExpanded,
  onOpenFile,
  onToggleWrapText,
  onRequestFileAction,
}: FileChangeItemProps) {
  const statusLabel = getStatusLabel(status);
  const badgeClass = getStatusBadgeClass(status);
  const canDiscard = status === 'M' || status === 'D' || status === 'U';
  const stageLabel = isSelected ? 'Unstage' : 'Stage';
  const stageGlyph = isSelected ? '−' : '+';

  return (
    <div className="group">
      <div className="git-file">
        <span className={`git-mark git-mark-${status}`} title={statusLabel}>
          {status}
        </span>

        <span
          className="git-path cursor-pointer hover:text-[var(--brand-accent)]"
          onClick={(event) => {
            event.stopPropagation();
            onOpenFile(filePath);
          }}
          title="Click to open file"
        >
          {filePath}
        </span>

        <span className="git-lines flex items-center gap-1">
          {canDiscard && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRequestFileAction(filePath, status);
              }}
              className="flex h-[18px] w-[18px] items-center justify-center rounded text-[var(--err)] opacity-0 transition-opacity hover:bg-[var(--err-soft)] group-hover:opacity-100"
              title={status === 'U' ? 'Delete untracked file' : 'Discard changes'}
              aria-label={status === 'U' ? 'Delete untracked file' : 'Discard changes'}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpanded(filePath);
            }}
            className="flex h-[18px] w-[18px] items-center justify-center rounded text-[var(--ink-3)] opacity-0 transition-opacity hover:bg-[var(--paper-2)] group-hover:opacity-100"
            title={isExpanded ? 'Collapse diff' : 'Expand diff'}
            aria-label={isExpanded ? 'Collapse diff' : 'Expand diff'}
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform duration-200 ease-in-out ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
            />
          </button>
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelected(filePath);
          }}
          className="git-act-mini"
          title={stageLabel}
          aria-label={stageLabel}
        >
          {stageGlyph}
        </button>
      </div>

      <div
        className={`duration-400 overflow-hidden bg-[var(--paper-2)] transition-all ease-in-out ${
          isExpanded && diff ? 'max-h-[600px] translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] p-2">
          <span className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[var(--fs-xs)] font-bold ${badgeClass}`}
            >
              {status}
            </span>
            <span className="text-sm font-medium text-[var(--ink)]">{statusLabel}</span>
          </span>
          {isMobile && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleWrapText();
              }}
              className="text-sm text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
              title={wrapText ? 'Switch to horizontal scroll' : 'Switch to text wrap'}
            >
              {wrapText ? 'Scroll' : 'Wrap'}
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {diff && <GitDiffViewer diff={diff} isMobile={isMobile} wrapText={wrapText} />}
        </div>
      </div>
    </div>
  );
}
