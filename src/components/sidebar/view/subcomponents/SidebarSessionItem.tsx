import { Check, Edit2, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';

import { cn } from '../../../../lib/utils';
import type { Project, ProjectSession, LLMProvider } from '../../../../types/app';
import type { SessionWithProvider } from '../../types/types';
import { createSessionViewModel } from '../../utils/utils';
import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';

type SidebarSessionItemProps = {
  project: Project;
  session: SessionWithProvider;
  selectedSession: ProjectSession | null;
  currentTime: Date;
  editingSession: string | null;
  editingSessionName: string;
  isLast?: boolean;
  onEditingSessionNameChange: (value: string) => void;
  onStartEditingSession: (sessionId: string, initialName: string) => void;
  onCancelEditingSession: () => void;
  onSaveEditingSession: (projectName: string, sessionId: string, summary: string, provider: LLMProvider) => void;
  onProjectSelect: (project: Project) => void;
  onSessionSelect: (session: SessionWithProvider, projectName: string) => void;
  onDeleteSession: (
    projectName: string,
    sessionId: string,
    sessionTitle: string,
    provider: LLMProvider,
  ) => void;
  t: TFunction;
};

/**
 * Compact relative time for sidebar rows:
 * <1m, Xm, Xhr, Xd.
 */
const formatCompactSessionAge = (dateString: string, currentTime: Date): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffInMinutes = Math.floor(Math.max(0, currentTime.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return '<1m';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}hr`;
  return `${Math.floor(diffInHours / 24)}d`;
};

export default function SidebarSessionItem({
  project,
  session,
  selectedSession,
  currentTime,
  editingSession,
  editingSessionName,
  isLast = false,
  onEditingSessionNameChange,
  onStartEditingSession,
  onCancelEditingSession,
  onSaveEditingSession,
  onProjectSelect,
  onSessionSelect,
  onDeleteSession,
  t,
}: SidebarSessionItemProps) {
  const sessionView = createSessionViewModel(session, currentTime, t);
  const isSelected = selectedSession?.id === session.id;
  const compactAge = formatCompactSessionAge(sessionView.sessionTime, currentTime);
  const isEditing = editingSession === session.id;

  const handleSelect = () => {
    onProjectSelect(project);
    onSessionSelect(session, project.projectId);
  };

  const saveEdit = () => {
    onSaveEditingSession(project.projectId, session.id, editingSessionName, session.__provider);
  };

  const requestDelete = () => {
    onDeleteSession(project.projectId, session.id, sessionView.sessionName, session.__provider);
  };

  // Determine status dot tone
  const dotTone = sessionView.isActive ? 'busy' : 'off';

  return (
    <div className="group/session relative">
      <button
        className={cn(
          'session-row',
          isSelected && 'active',
        )}
        onClick={handleSelect}
      >
        <span className="tree-glyph">{isLast ? '└─' : '├─'}</span>
        <SessionProviderLogo provider={session.__provider} className="h-3 w-3 flex-shrink-0" />
        <span className="session-title">{sessionView.sessionName}</span>
        <span className={cn('session-meta', 'group-hover/session:hidden', isEditing && 'opacity-0')}>
          <span className={cn('status-dot', dotTone === 'busy' ? 'dot-busy' : 'dot-off')} />
          {compactAge}
        </span>
      </button>

      {/* Hover actions (desktop) */}
      <div className={cn(
        "absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-0.5 group-hover/session:flex",
        isEditing && "flex rounded-md bg-[var(--paper)] px-1 shadow-sm"
      )}>
        {isEditing ? (
          <>
            <input
              type="text"
              value={editingSessionName}
              onChange={(e) => onEditingSessionNameChange(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') saveEdit();
                else if (e.key === 'Escape') onCancelEditingSession();
              }}
              onClick={(e) => e.stopPropagation()}
              className="input w-28"
              style={{ fontSize: 'var(--fs-xs)', padding: '2px 6px' }}
              autoFocus
            />
            <button
              className="icon-btn"
              style={{ width: 22, height: 22 }}
              onClick={(e) => { e.stopPropagation(); saveEdit(); }}
              title={t('tooltips.save')}
            >
              <Check className="h-3 w-3" style={{ color: 'var(--ok)' }} />
            </button>
            <button
              className="icon-btn"
              style={{ width: 22, height: 22 }}
              onClick={(e) => { e.stopPropagation(); onCancelEditingSession(); }}
              title={t('tooltips.cancel')}
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <>
            <button
              className="icon-btn"
              style={{ width: 22, height: 22 }}
              onClick={(e) => {
                e.stopPropagation();
                onStartEditingSession(session.id, sessionView.sessionName);
              }}
              title={t('tooltips.editSessionName')}
            >
              <Edit2 className="h-3 w-3" />
            </button>
            {!sessionView.isCursorSession && (
              <button
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={(e) => { e.stopPropagation(); requestDelete(); }}
                title={t('tooltips.deleteSession')}
              >
                <Trash2 className="h-3 w-3" style={{ color: 'var(--err)' }} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
