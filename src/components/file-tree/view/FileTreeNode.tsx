import type { ReactNode, RefObject } from 'react';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';

import { cn } from '../../../lib/utils';
import type { FileTreeNode as FileTreeNodeType, FileTreeViewMode } from '../types/types';
import { Input } from '../../../shared/view/ui';

import FileContextMenu from './FileContextMenu';

type FileTreeNodeProps = {
  item: FileTreeNodeType;
  level: number;
  viewMode: FileTreeViewMode;
  expandedDirs: Set<string>;
  onItemClick: (item: FileTreeNodeType) => void;
  renderFileIcon: (filename: string) => ReactNode;
  formatFileSize: (bytes?: number) => string;
  formatRelativeTime: (date?: string) => string;
  onRename?: (item: FileTreeNodeType) => void;
  onDelete?: (item: FileTreeNodeType) => void;
  onNewFile?: (path: string) => void;
  onNewFolder?: (path: string) => void;
  onCopyPath?: (item: FileTreeNodeType) => void;
  onDownload?: (item: FileTreeNodeType) => void;
  onRefresh?: () => void;
  // Rename state for inline editing
  renamingItem?: FileTreeNodeType | null;
  renameValue?: string;
  setRenameValue?: (value: string) => void;
  handleConfirmRename?: () => void;
  handleCancelRename?: () => void;
  renameInputRef?: RefObject<HTMLInputElement>;
  operationLoading?: boolean;
  // Path of the file currently open in the editor (for active row highlighting)
  editingFilePath?: string | null;
  // True when this item is the last child of its parent (drives └─ vs ├─ glyph)
  isLast?: boolean;
};

type TreeItemIconProps = {
  item: FileTreeNodeType;
  isOpen: boolean;
  renderFileIcon: (filename: string) => ReactNode;
  isLast?: boolean;
  showGlyph?: boolean;
};

function TreeItemIcon({ item, isOpen, renderFileIcon, isLast, showGlyph }: TreeItemIconProps) {
  if (item.type === 'directory') {
    return (
      <span className="tree-icon flex flex-shrink-0 items-center gap-0.5">
        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-150',
            isOpen && 'rotate-90',
          )}
        />
        {isOpen ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0" />
        )}
      </span>
    );
  }

  if (showGlyph) {
    return (
      <span className="flex flex-shrink-0 items-center gap-1">
        <span className="font-mono text-[var(--fs-xs)] leading-none text-[var(--ink-4)] select-none">
          {isLast ? '└─' : '├─'}
        </span>
        <span className="tree-icon flex flex-shrink-0 items-center">{renderFileIcon(item.name)}</span>
      </span>
    );
  }

  return <span className="tree-icon ml-[18px] flex flex-shrink-0 items-center">{renderFileIcon(item.name)}</span>;
}

export default function FileTreeNode({
  item,
  level,
  viewMode,
  expandedDirs,
  onItemClick,
  renderFileIcon,
  formatFileSize,
  formatRelativeTime,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
  onCopyPath,
  onDownload,
  onRefresh,
  renamingItem,
  renameValue,
  setRenameValue,
  handleConfirmRename,
  handleCancelRename,
  renameInputRef,
  operationLoading,
  editingFilePath,
  isLast,
}: FileTreeNodeProps) {
  const isDirectory = item.type === 'directory';
  const isOpen = isDirectory && expandedDirs.has(item.path);
  const hasChildren = Boolean(isDirectory && item.children && item.children.length > 0);
  const isRenaming = renamingItem?.path === item.path;
  const isActiveFile = !isDirectory && editingFilePath != null && editingFilePath === item.path;
  const showGlyph = viewMode === 'simple';

  const nameClassName = cn(
    'text-[13px] leading-tight truncate',
    isDirectory ? 'font-medium text-[var(--ink)]' : 'text-[var(--ink-2)]',
    isActiveFile && 'text-[var(--ink)]',
  );

  // View mode only changes the row layout; selection, expansion, and recursion stay shared.
  const rowClassName = cn(
    'flex items-center gap-1.5 px-[6px] py-[3px] rounded-[var(--radius-1)] text-[var(--fs-sm)] text-[var(--ink-2)] cursor-pointer w-full text-left hover:bg-[var(--paper-2)] hover:text-[var(--ink)]',
    viewMode === 'detailed' && 'grid grid-cols-12 gap-2',
    viewMode === 'compact' && 'justify-between',
    isDirectory && isOpen && 'border-l-2 border-[var(--accent)]/30',
    (!isDirectory || !isOpen) && 'border-l-2 border-transparent',
    isActiveFile && 'bg-[var(--accent-soft)] text-[var(--ink)]',
  );

  // Render rename input if this item is being renamed
  if (isRenaming && setRenameValue && handleConfirmRename && handleCancelRename) {
    return (
      <div
        className={cn(rowClassName, 'bg-[var(--accent-soft)]')}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <TreeItemIcon item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} isLast={isLast} showGlyph={showGlyph} />
        <Input
          ref={renameInputRef}
          type="text"
          value={renameValue || ''}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') handleConfirmRename();
            if (e.key === 'Escape') handleCancelRename();
          }}
          onBlur={() => {
            setTimeout(() => {
              handleConfirmRename();
            }, 100);
          }}
          className="h-6 flex-1 text-sm"
          disabled={operationLoading}
        />
      </div>
    );
  }

  const rowContent = (
    <div
      className={rowClassName}
      style={{ paddingLeft: `${level * 16 + 4}px` }}
      onClick={() => onItemClick(item)}
    >
      {viewMode === 'detailed' ? (
        <>
          <div className="col-span-5 flex min-w-0 items-center gap-1.5">
            <TreeItemIcon item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} isLast={isLast} showGlyph={showGlyph} />
            <span className={nameClassName}>{item.name}</span>
          </div>
          <div className="col-span-2 text-sm tabular-nums text-[var(--ink-3)]">
            {item.type === 'file' ? formatFileSize(item.size) : ''}
          </div>
          <div className="col-span-3 text-sm text-[var(--ink-3)]">{formatRelativeTime(item.modified)}</div>
          <div className="col-span-2 font-mono text-sm text-[var(--ink-3)]">{item.permissionsRwx || ''}</div>
        </>
      ) : viewMode === 'compact' ? (
        <>
          <div className="flex min-w-0 items-center gap-1.5">
            <TreeItemIcon item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} isLast={isLast} showGlyph={showGlyph} />
            <span className={nameClassName}>{item.name}</span>
          </div>
          <div className="ml-2 flex flex-shrink-0 items-center gap-3 text-sm text-[var(--ink-3)]">
            {item.type === 'file' && (
              <>
                <span className="tabular-nums">{formatFileSize(item.size)}</span>
                <span className="font-mono">{item.permissionsRwx}</span>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <TreeItemIcon item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} isLast={isLast} showGlyph={showGlyph} />
          <span className={nameClassName}>{item.name}</span>
        </>
      )}
    </div>
  );

  // Check if context menu callbacks are provided
  const hasContextMenu = onRename || onDelete || onNewFile || onNewFolder || onCopyPath || onDownload || onRefresh;

  return (
    <div className="select-none">
      {hasContextMenu ? (
        <FileContextMenu
          item={item}
          onRename={onRename}
          onDelete={onDelete}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
          onCopyPath={onCopyPath}
          onDownload={onDownload}
          onRefresh={onRefresh}
        >
          {rowContent}
        </FileContextMenu>
      ) : (
        rowContent
      )}

      {isDirectory && isOpen && hasChildren && (
        <div className="relative">
          <span
            className="absolute bottom-0 top-0 border-l border-[var(--line)]"
            style={{ left: `${level * 16 + 14}px` }}
            aria-hidden="true"
          />
          {item.children?.map((child, index, arr) => (
            <FileTreeNode
              key={child.path}
              item={child}
              level={level + 1}
              viewMode={viewMode}
              expandedDirs={expandedDirs}
              onItemClick={onItemClick}
              renderFileIcon={renderFileIcon}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              onRename={onRename}
              onDelete={onDelete}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              onCopyPath={onCopyPath}
              onDownload={onDownload}
              onRefresh={onRefresh}
              renamingItem={renamingItem}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              handleConfirmRename={handleConfirmRename}
              handleCancelRename={handleCancelRename}
              renameInputRef={renameInputRef}
              operationLoading={operationLoading}
              editingFilePath={editingFilePath}
              isLast={index === arr.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
