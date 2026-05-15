import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  FileText,
  GitCommit,
  GitMerge,
  MessageSquare,
  MessageSquarePlus,
  RefreshCw,
  Settings,
  SunMoon,
  X,
} from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogTitle,
} from '../../shared/view/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { usePaletteOps } from '../../contexts/PaletteOpsContext';
import { SETTINGS_MAIN_TABS } from '../settings/constants/constants';
import type { AppTab, Project } from '../../types/app';

import { useSessionsSource } from './sources/useSessionsSource';
import { useFilesSource } from './sources/useFilesSource';
import { useCommitsSource } from './sources/useCommitsSource';
import { useSessionMessageSearch } from './sources/useSessionMessageSearch';
import { useBranchesSource } from './sources/useBranchesSource';
import { useGitActions } from './sources/useGitActions';

type Page = 'actions' | 'files' | 'sessions' | 'commits' | 'branches';

const PAGE_LABELS: Record<Page, string> = {
  actions: 'Actions',
  files: 'Files',
  sessions: 'Sessions',
  commits: 'Commits',
  branches: 'Branches',
};

type CommandPaletteProps = {
  selectedProject: Project | null;
  onStartNewChat: (project: Project) => void;
  onOpenSettings: (tab?: string) => void;
  onShowTab?: (tab: AppTab) => void;
};

const NAV_TABS: Array<{ id: AppTab; label: string; keywords: string }> = [
  { id: 'chat', label: 'Go to Chat', keywords: 'chat messages conversation' },
  { id: 'files', label: 'Go to Files', keywords: 'files file tree explorer' },
  { id: 'shell', label: 'Go to Shell', keywords: 'shell terminal console' },
  { id: 'git', label: 'Go to Git', keywords: 'git diff branches' },
  { id: 'tasks', label: 'Go to Tasks', keywords: 'tasks taskmaster' },
];

export default function CommandPalette({
  selectedProject,
  onStartNewChat,
  onOpenSettings,
  onShowTab,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [pages, setPages] = React.useState<Page[]>([]);
  const { toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const ops = usePaletteOps();

  const page = pages.at(-1);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k';
      if (!isCmdK) return;
      e.preventDefault();
      setOpen((prev) => !prev);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setSearch('');
      setPages([]);
    }
  }, [open]);

  const projectId = selectedProject?.projectId;

  const showActions = !page || page === 'actions';
  const showSessions = !page || page === 'sessions';
  const showFiles = !page || page === 'files';
  const showCommits = !page || page === 'commits';
  const showBranches = !page || page === 'branches' || page === 'actions';

  const sessions = useSessionsSource(projectId, open && showSessions);
  const messageMatches = useSessionMessageSearch(projectId, search, open && showSessions);
  const files = useFilesSource(projectId, open && showFiles);
  const commits = useCommitsSource(projectId, open && showCommits);
  const branches = useBranchesSource(projectId, open && showBranches);
  const git = useGitActions(projectId);

  const sessionRows = React.useMemo(() => {
    if (!showSessions) return [];
    type Row = { id: string; label: string; provider?: string; snippet?: string };
    const byId = new Map<string, Row>();
    for (const s of sessions) {
      byId.set(s.id, { id: s.id, label: s.label, provider: s.provider });
    }
    for (const m of messageMatches) {
      const existing = byId.get(m.sessionId);
      if (existing) {
        existing.snippet = m.snippet;
      } else {
        byId.set(m.sessionId, {
          id: m.sessionId,
          label: m.label,
          provider: m.provider,
          snippet: m.snippet,
        });
      }
    }
    return Array.from(byId.values());
  }, [sessions, messageMatches, showSessions]);

  const run = React.useCallback((fn: () => void) => {
    setOpen(false);
    fn();
  }, []);

  const pushPage = React.useCallback((next: Page) => {
    setSearch('');
    setPages((prev) => [...prev, next]);
  }, []);

  const popPage = React.useCallback(() => {
    setSearch('');
    setPages((prev) => prev.slice(0, -1));
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !search && pages.length > 0) {
      e.preventDefault();
      popPage();
    }
  }, [search, pages.length, popPage]);

  const startNewChatDisabled = !selectedProject;
  const browseLimit = 5;
  const filesShown = page === 'files' ? files : files.slice(0, browseLimit);
  const commitsShown = page === 'commits' ? commits : commits.slice(0, browseLimit);
  const sessionsShown = page === 'sessions' ? sessionRows : sessionRows.slice(0, browseLimit);
  const branchesShown = page === 'branches' ? branches : branches.slice(0, browseLimit);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="cp-panel">
        <DialogTitle>Command palette</DialogTitle>
        <Command label="Command palette" className="cp-results" onKeyDown={handleKeyDown}>
          {page && (
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-3 py-2">
              <span className="cp-page-badge">
                {PAGE_LABELS[page]}
                <button
                  type="button"
                  onClick={popPage}
                  aria-label="Back to all"
                  className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
              <span className="text-[var(--fs-sm)]" style={{ color: 'var(--ink-3)' }}>Backspace to go back</span>
            </div>
          )}
          <CommandInput
            className="cp-input"
            placeholder={page ? `Search ${PAGE_LABELS[page].toLowerCase()}…` : 'Type to search anything…'}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-[var(--fs-base)]" style={{ color: 'var(--ink-3)' }}>No results.</CommandEmpty>

            {showActions && (
              <CommandGroup className="cp-group" heading="Actions">
                <CommandItem
                  className="cp-item"
                  value="Start new chat"
                  disabled={startNewChatDisabled}
                  onSelect={() => {
                    if (!selectedProject) return;
                    run(() => onStartNewChat(selectedProject));
                  }}
                >
                  <MessageSquarePlus className="cp-item-glyph" aria-hidden />
                  <span className="cp-item-text">Start new chat</span>
                  {startNewChatDisabled && (
                    <span className="cp-item-sub">Select a project first</span>
                  )}
                </CommandItem>
                <CommandItem className="cp-item" value="Open settings" onSelect={() => run(() => onOpenSettings())}>
                  <Settings className="cp-item-glyph" aria-hidden />
                  <span className="cp-item-text">Open settings</span>
                </CommandItem>
                <CommandItem className="cp-item" value="Toggle theme dark light mode" onSelect={() => run(toggleDarkMode)}>
                  <SunMoon className="cp-item-glyph" aria-hidden />
                  <span className="cp-item-text">Toggle theme</span>
                </CommandItem>
              </CommandGroup>
            )}

            {showActions && (
              <CommandGroup className="cp-group" heading="Navigate">
                {NAV_TABS.map((tab) => (
                  <CommandItem
                    className="cp-item"
                    key={tab.id as string}
                    value={`${tab.label} ${tab.keywords}`}
                    onSelect={() => run(() => onShowTab?.(tab.id))}
                  >
                    <span className="cp-item-text">{tab.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showActions && projectId && (
              <CommandGroup className="cp-group" heading="Git">
                <CommandItem
                  className="cp-item"
                  value="Git Fetch remote"
                  onSelect={() => run(() => { void git.fetch(); onShowTab?.('git'); })}
                >
                  <RefreshCw className="cp-item-glyph" aria-hidden />
                  <span className="cp-item-text">Git: Fetch</span>
                </CommandItem>
                <CommandItem
                  className="cp-item"
                  value="Git Pull merge upstream"
                  onSelect={() => run(() => { void git.pull(); onShowTab?.('git'); })}
                >
                  <ArrowDownToLine className="cp-item-glyph" aria-hidden />
                  <span className="cp-item-text">Git: Pull</span>
                </CommandItem>
                <CommandItem
                  className="cp-item"
                  value="Git Push origin remote"
                  onSelect={() => run(() => { void git.push(); onShowTab?.('git'); })}
                >
                  <ArrowUpFromLine className="cp-item-glyph" aria-hidden />
                  <span className="cp-item-text">Git: Push</span>
                </CommandItem>
              </CommandGroup>
            )}

            {showActions && (
              <CommandGroup className="cp-group" heading="Settings">
                {SETTINGS_MAIN_TABS.map(({ id, label, keywords, icon: Icon }) => (
                  <CommandItem
                    className="cp-item"
                    key={id}
                    value={`Settings ${label} ${keywords}`}
                    onSelect={() => run(() => onOpenSettings(id))}
                  >
                    <Icon className="cp-item-glyph" aria-hidden />
                    <span className="cp-item-text">Settings: {label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showSessions && projectId && sessionsShown.length > 0 && (
              <CommandGroup className="cp-group" heading="Sessions">
                {sessionsShown.map((s) => (
                  <CommandItem
                    className="cp-item"
                    key={s.id}
                    value={`${s.label} ${s.snippet ?? ''} ${s.id}`.trim()}
                    onSelect={() => run(() => navigate(`/session/${s.id}`))}
                  >
                    <MessageSquare className="cp-item-glyph" aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="cp-item-text truncate">{s.label}</span>
                      {s.snippet && (
                        <span className="cp-item-sub truncate">{s.snippet}</span>
                      )}
                    </div>
                    {s.provider && (
                      <span className="cp-item-sub">{s.provider}</span>
                    )}
                  </CommandItem>
                ))}
                {!page && sessionRows.length > browseLimit && (
                  <BrowseAllItem label={`Browse all sessions (${sessionRows.length})`} onSelect={() => pushPage('sessions')} />
                )}
              </CommandGroup>
            )}

            {showFiles && projectId && filesShown.length > 0 && (
              <CommandGroup className="cp-group" heading="Files">
                {filesShown.map((f) => (
                  <CommandItem
                    className="cp-item"
                    key={f.path}
                    value={f.path}
                    onSelect={() => run(() => ops.openFile(f.path))}
                  >
                    <FileText className="cp-item-glyph" aria-hidden />
                    <span className="cp-item-text truncate">{f.name}</span>
                    <span className="cp-item-path">{f.path}</span>
                  </CommandItem>
                ))}
                {!page && files.length > browseLimit && (
                  <BrowseAllItem label={`Browse all files (${files.length})`} onSelect={() => pushPage('files')} />
                )}
              </CommandGroup>
            )}

            {showCommits && projectId && commitsShown.length > 0 && (
              <CommandGroup className="cp-group" heading="Commits">
                {commitsShown.map((c) => (
                  <CommandItem
                    className="cp-item"
                    key={c.hash}
                    value={`${c.message} ${c.author} ${c.shortHash}`}
                    onSelect={() => run(() => onShowTab?.('git'))}
                  >
                    <GitCommit className="cp-item-glyph" aria-hidden />
                    <span className="cp-item-mono">{c.shortHash}</span>
                    <span className="cp-item-text truncate">{c.message}</span>
                    <span className="cp-item-sub truncate">{c.author}</span>
                  </CommandItem>
                ))}
                {!page && commits.length > browseLimit && (
                  <BrowseAllItem label={`Browse all commits (${commits.length})`} onSelect={() => pushPage('commits')} />
                )}
              </CommandGroup>
            )}

            {showBranches && projectId && branchesShown.length > 0 && (
              <CommandGroup className="cp-group" heading="Branches">
                {branchesShown.map((b) => (
                  <CommandItem
                    className="cp-item"
                    key={`branch-${b.name}`}
                    value={b.name}
                    onSelect={() => run(() => { void git.checkout(b.name); onShowTab?.('git'); })}
                  >
                    <GitMerge className="cp-item-glyph" aria-hidden />
                    <span className="cp-item-text truncate">Switch to: {b.name}</span>
                  </CommandItem>
                ))}
                {!page && branches.length > browseLimit && (
                  <BrowseAllItem label={`Browse all branches (${branches.length})`} onSelect={() => pushPage('branches')} />
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function BrowseAllItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <CommandItem className="cp-item" value={label} onSelect={onSelect}>
      <ChevronRight className="cp-item-glyph" aria-hidden />
      <span className="cp-item-text cp-browse">{label}</span>
    </CommandItem>
  );
}
