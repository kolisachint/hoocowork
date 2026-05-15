import { ChevronDown, Eye, FileText, FolderPlus, List, RefreshCw, Search, TableProperties, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Input } from '../../../shared/view/ui';
import { cn } from '../../../lib/utils';
import type { FileTreeViewMode } from '../types/types';

type FileTreeHeaderProps = {
  viewMode: FileTreeViewMode;
  onViewModeChange: (mode: FileTreeViewMode) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  // Toolbar actions
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onRefresh?: () => void;
  onCollapseAll?: () => void;
  // Loading state
  loading?: boolean;
  operationLoading?: boolean;
  // Project name shown in the eyebrow ("Explorer · projectName") to match the design.
  projectName?: string;
};

export default function FileTreeHeader({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  onNewFile,
  onNewFolder,
  onRefresh,
  onCollapseAll,
  loading,
  operationLoading,
  projectName,
}: FileTreeHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-[var(--line)] px-[8px] pt-[12px] pb-[8px] space-y-[8px]">
      {/* Eyebrow title + toolbar */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-caps)] text-[var(--ink-3)] font-medium truncate">
          {projectName ? (
            <>
              {t('fileTree.explorer', 'Explorer')}
              <span className="mx-[6px] text-[var(--ink-4)]">·</span>
              <span className="text-[var(--ink-2)]">{projectName}</span>
            </>
          ) : (
            t('fileTree.files')
          )}
        </span>
        <div className="flex items-center gap-0.5">
          {/* Action buttons */}
          {onNewFile && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
              onClick={onNewFile}
              title={t('fileTree.newFile', 'New File (Cmd+N)')}
              aria-label={t('fileTree.newFile', 'New File (Cmd+N)')}
              disabled={operationLoading}
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          )}
          {onNewFolder && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
              onClick={onNewFolder}
              title={t('fileTree.newFolder', 'New Folder (Cmd+Shift+N)')}
              aria-label={t('fileTree.newFolder', 'New Folder (Cmd+Shift+N)')}
              disabled={operationLoading}
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
              onClick={onRefresh}
              title={t('fileTree.refresh', 'Refresh')}
              aria-label={t('fileTree.refresh', 'Refresh')}
              disabled={operationLoading}
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            </Button>
          )}
          {onCollapseAll && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
              onClick={onCollapseAll}
              title={t('fileTree.collapseAll', 'Collapse All')}
              aria-label={t('fileTree.collapseAll', 'Collapse All')}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          )}
          <div className="mx-0.5 h-4 w-px bg-[var(--line)]" />
          {/* View mode buttons */}
          <Button
            variant={viewMode === 'simple' ? 'default' : 'ghost'}
            size="sm"
            className={cn('h-7 w-7 p-0', viewMode !== 'simple' && 'text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]')}
            onClick={() => onViewModeChange('simple')}
            title={t('fileTree.simpleView')}
            aria-label={t('fileTree.simpleView')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            size="sm"
            className={cn('h-7 w-7 p-0', viewMode !== 'compact' && 'text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]')}
            onClick={() => onViewModeChange('compact')}
            title={t('fileTree.compactView')}
            aria-label={t('fileTree.compactView')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'ghost'}
            size="sm"
            className={cn('h-7 w-7 p-0', viewMode !== 'detailed' && 'text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]')}
            onClick={() => onViewModeChange('detailed')}
            title={t('fileTree.detailedView')}
            aria-label={t('fileTree.detailedView')}
          >
            <TableProperties className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-[6px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[var(--ink-3)]" />
        <Input
          type="text"
          placeholder={t('fileTree.searchPlaceholder')}
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="h-[26px] pl-[20px] pr-[20px] text-[var(--fs-sm)]"
        />
        {searchQuery && (
          <button
            className="absolute right-[2px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer p-0 rounded-[var(--radius-1)]"
            onClick={() => onSearchQueryChange('')}
            title={t('fileTree.clearSearch')}
            aria-label={t('fileTree.clearSearch')}
          >
            <X className="h-[12px] w-[12px]" />
          </button>
        )}
      </div>
    </div>
  );
}
