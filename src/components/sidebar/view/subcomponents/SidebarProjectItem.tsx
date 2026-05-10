import { Check, ChevronDown, ChevronRight, Edit3, Plus, Star, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';

import { cn } from '../../../../lib/utils';
import type { Project, ProjectSession, LLMProvider } from '../../../../types/app';
import type { MCPServerStatus, SessionWithProvider } from '../../types/types';
import { getTaskIndicatorStatus } from '../../utils/utils';

import TaskIndicator from './TaskIndicator';
import SidebarSessionItem from './SidebarSessionItem';

type SidebarProjectItemProps = {
  project: Project;
  selectedProject: Project | null;
  selectedSession: ProjectSession | null;
  isExpanded: boolean;
  isDeleting: boolean;
  isStarred: boolean;
  editingProject: string | null;
  editingName: string;
  sessions: SessionWithProvider[];
  initialSessionsLoaded: boolean;
  isLoadingMoreSessions: boolean;
  currentTime: Date;
  editingSession: string | null;
  editingSessionName: string;
  tasksEnabled: boolean;
  mcpServerStatus: MCPServerStatus;
  onEditingNameChange: (name: string) => void;
  onToggleProject: (projectName: string) => void;
  onProjectSelect: (project: Project) => void;
  onToggleStarProject: (projectName: string) => void;
  onStartEditingProject: (project: Project) => void;
  onCancelEditingProject: () => void;
  onSaveProjectName: (projectName: string) => void;
  onDeleteProject: (project: Project) => void;
  onSessionSelect: (session: SessionWithProvider, projectName: string) => void;
  onDeleteSession: (
    projectName: string,
    sessionId: string,
    sessionTitle: string,
    provider: LLMProvider,
  ) => void;
  onLoadMoreSessions: (projectId: string) => void;
  onNewSession: (project: Project) => void;
  onEditingSessionNameChange: (value: string) => void;
  onStartEditingSession: (sessionId: string, initialName: string) => void;
  onCancelEditingSession: () => void;
  onSaveEditingSession: (projectName: string, sessionId: string, summary: string, provider: LLMProvider) => void;
  t: TFunction;
};

const getSessionCountDisplay = (project: Project, sessions: SessionWithProvider[]): string => {
  return String(Number(project.sessionMeta?.total ?? sessions.length));
};

export default function SidebarProjectItem({
  project,
  selectedProject,
  selectedSession,
  isExpanded,
  isDeleting,
  isStarred,
  editingProject,
  editingName,
  sessions,
  initialSessionsLoaded,
  isLoadingMoreSessions,
  currentTime,
  editingSession,
  editingSessionName,
  tasksEnabled,
  mcpServerStatus,
  onEditingNameChange,
  onToggleProject,
  onProjectSelect,
  onToggleStarProject,
  onStartEditingProject,
  onCancelEditingProject,
  onSaveProjectName,
  onDeleteProject,
  onSessionSelect,
  onDeleteSession,
  onLoadMoreSessions,
  onNewSession,
  onEditingSessionNameChange,
  onStartEditingSession,
  onCancelEditingSession,
  onSaveEditingSession,
  t,
}: SidebarProjectItemProps) {
  const isSelected = selectedProject?.projectId === project.projectId;
  const isEditing = editingProject === project.projectId;
  const sessionCountDisplay = getSessionCountDisplay(project, sessions);
  const hasMore = Boolean(project.sessionMeta?.hasMore);
  const taskStatus = getTaskIndicatorStatus(project, mcpServerStatus);

  const selectAndToggle = () => {
    if (!isSelected) onProjectSelect(project);
    onToggleProject(project.projectId);
  };

  const saveProjectName = () => onSaveProjectName(project.projectId);

  return (
    <div className={cn('project-block', isDeleting && 'opacity-50 pointer-events-none')}>
      {/* ── Project row ── */}
      <div className="group/project relative">
        <button
          className={cn('project-row', isSelected && 'active')}
          onClick={selectAndToggle}
        >
          <span className="project-chev">
            {isExpanded
              ? <ChevronDown size={12} />
              : <ChevronRight size={12} />}
          </span>

          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              className="input flex-1"
              style={{ fontSize: 'var(--fs-sm)', padding: '2px 6px' }}
              placeholder={t('projects.projectNamePlaceholder')}
              autoFocus
              autoComplete="off"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveProjectName();
                if (e.key === 'Escape') onCancelEditingProject();
              }}
            />
          ) : (
            <span className="project-name">{project.displayName}</span>
          )}

          {!isEditing && (
            <span className="project-branch">{sessionCountDisplay}</span>
          )}

          {tasksEnabled && !isEditing && (
            <TaskIndicator status={taskStatus} size="xs" className="flex-shrink-0" />
          )}

          {isStarred && !isEditing && (
            <Star size={10} className="flex-shrink-0" style={{ color: 'var(--warn)', fill: 'var(--warn)' }} />
          )}
        </button>

        {/* Hover actions */}
        <div className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-0.5 group-hover/project:flex">
          {isEditing ? (
            <>
              <button
                className="icon-btn" style={{ width: 22, height: 22 }}
                onClick={(e) => { e.stopPropagation(); saveProjectName(); }}
              >
                <Check size={12} style={{ color: 'var(--ok)' }} />
              </button>
              <button
                className="icon-btn" style={{ width: 22, height: 22 }}
                onClick={(e) => { e.stopPropagation(); onCancelEditingProject(); }}
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <button
                className="icon-btn" style={{ width: 22, height: 22 }}
                onClick={(e) => { e.stopPropagation(); onToggleStarProject(project.projectId); }}
                title={isStarred ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
              >
                <Star size={11} className={isStarred ? 'fill-current' : ''} style={isStarred ? { color: 'var(--warn)' } : undefined} />
              </button>
              <button
                className="icon-btn" style={{ width: 22, height: 22 }}
                onClick={(e) => { e.stopPropagation(); onStartEditingProject(project); }}
                title={t('tooltips.renameProject')}
              >
                <Edit3 size={11} />
              </button>
              <button
                className="icon-btn" style={{ width: 22, height: 22 }}
                onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }}
                title={t('tooltips.deleteProject')}
              >
                <Trash2 size={11} style={{ color: 'var(--err)' }} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Session list ── */}
      {isExpanded && (
        <div className="session-list">
          {/* New session button */}
          <button
            className="session-row"
            style={{ color: 'var(--accent)' }}
            onClick={() => onNewSession(project)}
          >
            <span className="tree-glyph" style={{ color: 'var(--accent)' }}>+</span>
            <Plus size={11} />
            <span className="session-title" style={{ fontWeight: 500 }}>{t('sessions.newSession')}</span>
          </button>

          {!initialSessionsLoaded ? (
            /* Loading skeleton */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="session-row" style={{ pointerEvents: 'none' }}>
                <span className="tree-glyph">{i === 2 ? '└─' : '├─'}</span>
                <span className="session-title" style={{ background: 'var(--paper-2)', borderRadius: 2, height: 12, width: `${60 + i * 15}%` }}>&nbsp;</span>
              </div>
            ))
          ) : sessions.length === 0 ? (
            <div className="session-empty">{t('sessions.noSessions')}</div>
          ) : (
            <>
              {sessions.map((session, i) => (
                <SidebarSessionItem
                  key={session.id}
                  project={project}
                  session={session}
                  selectedSession={selectedSession}
                  currentTime={currentTime}
                  editingSession={editingSession}
                  editingSessionName={editingSessionName}
                  isLast={i === sessions.length - 1 && !hasMore}
                  onEditingSessionNameChange={onEditingSessionNameChange}
                  onStartEditingSession={onStartEditingSession}
                  onCancelEditingSession={onCancelEditingSession}
                  onSaveEditingSession={onSaveEditingSession}
                  onProjectSelect={onProjectSelect}
                  onSessionSelect={onSessionSelect}
                  onDeleteSession={onDeleteSession}
                  t={t}
                />
              ))}
              {hasMore && (
                <button
                  className="session-row"
                  style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}
                  onClick={() => onLoadMoreSessions(project.projectId)}
                  disabled={isLoadingMoreSessions}
                >
                  <span className="tree-glyph">└─</span>
                  <span className="session-title">
                    {isLoadingMoreSessions ? t('sessions.loadingSessions') : 'Load more…'}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
