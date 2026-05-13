import { type ReactNode, useEffect } from 'react';
import {
  ArrowUpCircle, Folder, MessageSquare, PanelLeftClose,
  Plus, RefreshCw, Search, Settings, X,
} from 'lucide-react';
import type { TFunction } from 'i18next';

import { cn } from '../../../../lib/utils';
import { IS_PLATFORM } from '../../../../constants/config';
import type { LoadingProgress, Project } from '../../../../types/app';
import type { ReleaseInfo } from '../../../../types/sharedTypes';
import type { ConversationSearchResults, SearchProgress } from '../../hooks/useSidebarController';
import type { SidebarProjectListProps } from '../../types/types';

import GitHubStarBadge from './GitHubStarBadge';
import SidebarProjectItem from './SidebarProjectItem';

/* ── Helpers ────────────────────────────────────────────────── */

const MOD_KEY =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

const GITHUB_REPO_URL = 'https://github.com/kolisachint/hoocowork';



function HighlightedSnippet({ snippet, highlights }: { snippet: string; highlights: { start: number; end: number }[] }) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const h of highlights) {
    if (h.start > cursor) parts.push(snippet.slice(cursor, h.start));
    parts.push(
      <mark key={h.start} style={{ background: 'var(--warn-soft)', color: 'var(--ink)', padding: '0 2px', borderRadius: 2 }}>
        {snippet.slice(h.start, h.end)}
      </mark>,
    );
    cursor = h.end;
  }
  if (cursor < snippet.length) parts.push(snippet.slice(cursor));
  return <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>{parts}</span>;
}

/* ── Types ──────────────────────────────────────────────────── */

type SearchMode = 'projects' | 'conversations';

type SidebarContentProps = {
  isPWA: boolean;
  isMobile: boolean;
  isLoading: boolean;
  projects: Project[];
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  onClearSearchFilter: () => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  conversationResults: ConversationSearchResults | null;
  isSearching: boolean;
  searchProgress: SearchProgress | null;
  onConversationResultClick: (projectId: string | null, sessionId: string, provider: string, messageTimestamp?: string | null, messageSnippet?: string | null) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCreateProject: () => void;
  onCollapseSidebar: () => void;
  updateAvailable: boolean;
  releaseInfo: ReleaseInfo | null;
  latestVersion: string | null;
  currentVersion: string;
  onShowVersionModal: () => void;
  onShowSettings: () => void;
  projectListProps: SidebarProjectListProps;
  t: TFunction;
};

/* ── Component ──────────────────────────────────────────────── */

export default function SidebarContent({
  isPWA,
  isMobile,
  isLoading,
  projects,
  searchFilter,
  onSearchFilterChange,
  onClearSearchFilter,
  searchMode,
  onSearchModeChange,
  conversationResults,
  isSearching,
  searchProgress,
  onConversationResultClick,
  onRefresh,
  isRefreshing,
  onCreateProject,
  onCollapseSidebar,
  updateAvailable,
  releaseInfo,
  latestVersion,
  currentVersion,
  onShowVersionModal,
  onShowSettings,
  projectListProps: pl,
  t,
}: SidebarContentProps) {
  const showConversationSearch = searchMode === 'conversations' && searchFilter.trim().length >= 2;
  const hasPartialResults = conversationResults && conversationResults.results.length > 0;
  const showProjects = !isLoading && projects.length > 0 && pl.filteredProjects.length > 0;

  // Set document title based on selected project
  useEffect(() => {
    let title = 'HooCowork';
    const name = pl.selectedProject?.displayName?.trim();
    if (name) title = `${name} - ${title}`;
    document.title = title;
  }, [pl.selectedProject]);

  return (
    <aside className="sidebar">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="sidebar-header" style={isPWA && isMobile ? { paddingTop: 'var(--s-4)' } : undefined}>
        <div className="brand">
          {IS_PLATFORM ? (
            <a href="https://hoocowork.app/dashboard" className="brand" style={{ textDecoration: 'none' }} title={t('tooltips.viewEnvironments')}>
              <span className="brand-mark" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
                  <rect x="2" y="2" width="60" height="60" rx="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M18 22L26 32L18 42" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                  <rect x="32" y="40" width="14" height="2.5" fill="currentColor" />
                </svg>
              </span>
              <span className="brand-name">{t('app.title')}</span>
            </a>
          ) : (
            <>
              <span className="brand-mark" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
                  <rect x="2" y="2" width="60" height="60" rx="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M18 22L26 32L18 42" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                  <rect x="32" y="40" width="14" height="2.5" fill="currentColor" />
                </svg>
              </span>
              <span className="brand-name">{t('app.title')}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="icon-btn" onClick={onRefresh} disabled={isRefreshing} title={t('tooltips.refresh')}>
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button className="icon-btn" onClick={onCreateProject} title={t('tooltips.createProject')}>
            <Plus size={14} />
          </button>
          <button className="icon-btn hidden md:inline-flex" onClick={onCollapseSidebar} title={t('tooltips.hideSidebar')}>
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      <GitHubStarBadge />

      {/* ── Search ────────────────────────────────────────── */}
      {projects.length > 0 && !isLoading && (
        <>
          {/* Search mode tabs */}
          <div style={{ display: 'flex', gap: 2, padding: '0 var(--s-4) var(--s-2)' }}>
            <button
              onClick={() => onSearchModeChange('projects')}
              aria-pressed={searchMode === 'projects'}
              className={cn(
                'btn btn-sm flex-1 justify-center gap-1',
                searchMode === 'projects' ? 'btn-outline' : 'btn-ghost',
              )}
              style={{ fontSize: 'var(--fs-xs)' }}
            >
              <Folder size={11} />
              {t('search.modeProjects')}
            </button>
            <button
              onClick={() => onSearchModeChange('conversations')}
              aria-pressed={searchMode === 'conversations'}
              className={cn(
                'btn btn-sm flex-1 justify-center gap-1',
                searchMode === 'conversations' ? 'btn-outline' : 'btn-ghost',
              )}
              style={{ fontSize: 'var(--fs-xs)' }}
            >
              <MessageSquare size={11} />
              {t('search.modeConversations')}
            </button>
          </div>

          {/* Search input */}
          <div className="sidebar-search">
            <span className="input-prefix"><Search size={13} /></span>
            <input
              className="input with-prefix"
              placeholder={searchMode === 'conversations' ? t('search.conversationsPlaceholder') : t('projects.searchPlaceholder')}
              value={searchFilter}
              onChange={(e) => onSearchFilterChange(e.target.value)}
            />
            {searchFilter ? (
              <button
                onClick={onClearSearchFilter}
                aria-label={t('tooltips.clearSearch')}
                className="icon-btn"
                style={{ position: 'absolute', right: 22, width: 20, height: 20 }}
              >
                <X size={11} />
              </button>
            ) : (
              <span className="kbd kbd-inline">{MOD_KEY}K</span>
            )}
          </div>
        </>
      )}

      {/* ── Projects / search results ────────────────────── */}
      <div className="sidebar-projects">
        {showConversationSearch ? (
          /* Conversation search results */
          isSearching && !hasPartialResults ? (
            <div style={{ padding: 'var(--s-6) var(--s-4)', textAlign: 'center' }}>
              <div style={{ width: 24, height: 24, margin: '0 auto var(--s-3)', border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)' }}>{t('search.searching')}</p>
              {searchProgress && (
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-4)', marginTop: 4 }}>
                  {t('search.projectsScanned', { count: searchProgress.scannedProjects })}/{searchProgress.totalProjects}
                </p>
              )}
            </div>
          ) : !isSearching && conversationResults && conversationResults.results.length === 0 ? (
            <div style={{ padding: 'var(--s-6) var(--s-4)', textAlign: 'center' }}>
              <Search size={24} style={{ margin: '0 auto var(--s-3)', color: 'var(--ink-4)' }} />
              <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--ink)' }}>{t('search.noResults')}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>{t('search.tryDifferentQuery')}</p>
            </div>
          ) : hasPartialResults ? (
            <div style={{ padding: '0 var(--s-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--s-1)', marginBottom: 'var(--s-2)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>
                  {t('search.matches', { count: conversationResults.totalMatches })}
                </span>
                {isSearching && searchProgress && (
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-4)' }}>
                    {searchProgress.scannedProjects}/{searchProgress.totalProjects}
                  </span>
                )}
              </div>
              {conversationResults.results.map((pr) => (
                <div key={pr.projectName} style={{ marginBottom: 'var(--s-2)' }}>
                  <div className="sidebar-eyebrow" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 8px' }}>
                    <Folder size={11} /> {pr.projectDisplayName}
                  </div>
                  {pr.sessions.map((session) => (
                    <button
                      key={`${pr.projectId ?? pr.projectName}-${session.sessionId}`}
                      className="session-row"
                      style={{ flexDirection: 'column', alignItems: 'stretch', gap: 2, padding: '6px 8px' }}
                      onClick={() => onConversationResultClick(
                        pr.projectId,
                        session.sessionId,
                        session.provider || session.matches[0]?.provider || 'claude',
                        session.matches[0]?.timestamp,
                        session.matches[0]?.snippet,
                      )}
                    >
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <MessageSquare size={11} style={{ color: 'var(--accent)' }} />
                        <span className="session-title" style={{ fontWeight: 500 }}>{session.sessionSummary}</span>
                        {session.provider && session.provider !== 'claude' && (
                          <span className="badge badge-default" style={{ fontSize: 9 }}>{session.provider}</span>
                        )}
                      </div>
                      <div style={{ paddingLeft: 17 }}>
                        {session.matches.map((m, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'start' }}>
                            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', marginTop: 2 }}>
                              {m.role === 'user' ? 'U' : 'A'}
                            </span>
                            <HighlightedSnippet snippet={m.snippet} highlights={m.highlights} />
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : null
        ) : (
          /* Project list */
          <>
            {/* Loading state */}
            {isLoading && (
              <div style={{ padding: 'var(--s-6) var(--s-4)', textAlign: 'center' }}>
                <div style={{ width: 24, height: 24, margin: '0 auto var(--s-3)', border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
                <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--ink)' }}>{t('projects.loadingProjects')}</p>
                {pl.loadingProgress && (pl.loadingProgress as LoadingProgress).total > 0 && (
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)', marginTop: 4 }}>
                    {(pl.loadingProgress as LoadingProgress).current}/{(pl.loadingProgress as LoadingProgress).total} {t('projects.projects')}
                  </p>
                )}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && projects.length === 0 && (
              <div style={{ padding: 'var(--s-6) var(--s-4)', textAlign: 'center' }}>
                <Folder size={24} style={{ margin: '0 auto var(--s-3)', color: 'var(--ink-4)' }} />
                <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--ink)' }}>{t('projects.noProjects')}</p>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>{t('projects.runClaudeCli')}</p>
              </div>
            )}

            {/* No filter matches */}
            {!isLoading && projects.length > 0 && pl.filteredProjects.length === 0 && (
              <div style={{ padding: 'var(--s-6) var(--s-4)', textAlign: 'center' }}>
                <Search size={24} style={{ margin: '0 auto var(--s-3)', color: 'var(--ink-4)' }} />
                <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--ink)' }}>{t('projects.noMatchingProjects')}</p>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>{t('projects.tryDifferentSearch')}</p>
              </div>
            )}

            {/* Project rows */}
            {showProjects && (
              <>
                <div className="sidebar-eyebrow">{t('list.projects', { defaultValue: 'Projects' })}</div>
                {pl.filteredProjects.map((project) => (
                  <SidebarProjectItem
                    key={project.projectId}
                    project={project}
                    selectedProject={pl.selectedProject}
                    selectedSession={pl.selectedSession}
                    isExpanded={pl.expandedProjects.has(project.projectId)}
                    isDeleting={pl.deletingProjects.has(project.projectId)}
                    isStarred={pl.isProjectStarred(project.projectId)}
                    editingProject={pl.editingProject}
                    editingName={pl.editingName}
                    sessions={pl.getProjectSessions(project)}
                    initialSessionsLoaded={pl.initialSessionsLoaded.has(project.projectId)}
                    isLoadingMoreSessions={pl.loadingMoreProjects.has(project.projectId)}
                    currentTime={pl.currentTime}
                    editingSession={pl.editingSession}
                    editingSessionName={pl.editingSessionName}
                    tasksEnabled={pl.tasksEnabled}
                    mcpServerStatus={pl.mcpServerStatus}
                    onEditingNameChange={pl.onEditingNameChange}
                    onToggleProject={pl.onToggleProject}
                    onProjectSelect={pl.onProjectSelect}
                    onToggleStarProject={pl.onToggleStarProject}
                    onStartEditingProject={pl.onStartEditingProject}
                    onCancelEditingProject={pl.onCancelEditingProject}
                    onSaveProjectName={pl.onSaveProjectName}
                    onDeleteProject={pl.onDeleteProject}
                    onSessionSelect={pl.onSessionSelect}
                    onDeleteSession={pl.onDeleteSession}
                    onLoadMoreSessions={pl.onLoadMoreSessions}
                    onNewSession={pl.onNewSession}
                    onEditingSessionNameChange={pl.onEditingSessionNameChange}
                    onStartEditingSession={pl.onStartEditingSession}
                    onCancelEditingSession={pl.onCancelEditingSession}
                    onSaveEditingSession={pl.onSaveEditingSession}
                    t={pl.t}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="sidebar-foot" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
        {/* Update banner */}
        {updateAvailable && (
          <button
            className="foot-row"
            onClick={onShowVersionModal}
            style={{ cursor: 'pointer', gap: 8, padding: '4px 0', color: 'var(--accent)' }}
          >
            <ArrowUpCircle size={13} />
            <span style={{ fontWeight: 500, flex: 1, textAlign: 'left' }}>
              {releaseInfo?.title || `v${latestVersion}`}
            </span>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-4)' }}>{t('version.updateAvailable')}</span>
          </button>
        )}

        <button className="foot-row" onClick={onShowSettings} style={{ cursor: 'pointer' }}>
          <Settings size={14} /> <span>{t('actions.settings')}</span>
        </button>
        {!IS_PLATFORM && (
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="foot-row foot-meta"
            style={{ textDecoration: 'none' }}
          >
            HooCowork v{currentVersion} – {t('branding.openSource')}
          </a>
        )}
      </div>
    </aside>
  );
}
