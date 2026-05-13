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

  return (
    <div>
      <div className="git-file">
        <span className={`git-mark git-mark-${status}`} title={statusLabel}>{status}</span>

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

        <span className="flex items-center gap-1">
          {(status === 'M' || status === 'D' || status === 'U') && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRequestFileAction(filePath, status);
              }}
              className="flex h-5 w-5 items-center justify-center rounded text-[var(--err)] hover:bg-[var(--err-soft)]"
              title={status === 'U' ? 'Delete untracked file' : 'Discard changes'}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpanded(filePath);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--ink-3)] hover:bg-[var(--paper-2)]"
            title={isExpanded ? 'Collapse diff' : 'Expand diff'}
          >
            <ChevronRight className={`h-3 w-3 transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </button>
        </span>

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelected(filePath)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-border bg-background text-primary checked:bg-primary focus:ring-primary/40"
          title={isSelected ? 'Unstage' : 'Stage'}
        />
      </div>

      <div
        className={`duration-400 overflow-hidden bg-[var(--paper-2)] transition-all ease-in-out ${isExpanded && diff ? 'max-h-[600px] translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 opacity-0'
          }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] p-2">
          <span className="flex items-center gap-2">
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold ${badgeClass}`}>
              {status}
            </span>
            <span className="text-sm font-medium text-foreground">{statusLabel}</span>
          </span>
          {isMobile && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleWrapText();
              }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
