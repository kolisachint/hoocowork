import { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, EyeOff, Trash2 } from 'lucide-react';
import type { TFunction } from 'i18next';

import { Button } from '../../../../shared/view/ui';
import Settings from '../../../settings/view/Settings';
import VersionUpgradeModal from '../../../version-upgrade/view';
import type { Project } from '../../../../types/app';
import type { ReleaseInfo } from '../../../../types/sharedTypes';
import type { InstallMode } from '../../../../hooks/useVersionCheck';
import { normalizeProjectForSettings } from '../../utils/utils';
import type { DeleteProjectConfirmation, SessionDeleteConfirmation, SettingsProject } from '../../types/types';
import ProjectCreationWizard from '../../../project-creation-wizard';

type SidebarModalsProps = {
  projects: Project[];
  showSettings: boolean;
  settingsInitialTab: string;
  onCloseSettings: () => void;
  showNewProject: boolean;
  onCloseNewProject: () => void;
  onProjectCreated: () => void;
  deleteConfirmation: DeleteProjectConfirmation | null;
  onCancelDeleteProject: () => void;
  onConfirmDeleteProject: (deleteData?: boolean) => void;
  sessionDeleteConfirmation: SessionDeleteConfirmation | null;
  onCancelDeleteSession: () => void;
  onConfirmDeleteSession: () => void;
  showVersionModal: boolean;
  onCloseVersionModal: () => void;
  releaseInfo: ReleaseInfo | null;
  currentVersion: string;
  latestVersion: string | null;
  installMode: InstallMode;
  t: TFunction;
};

type TypedSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: SettingsProject[];
  initialTab: string;
};

const SettingsComponent = Settings as (props: TypedSettingsProps) => JSX.Element;

function TypedSettings(props: TypedSettingsProps) {
  return <SettingsComponent {...props} />;
}

export default function SidebarModals({
  projects,
  showSettings,
  settingsInitialTab,
  onCloseSettings,
  showNewProject,
  onCloseNewProject,
  onProjectCreated,
  deleteConfirmation,
  onCancelDeleteProject,
  onConfirmDeleteProject,
  sessionDeleteConfirmation,
  onCancelDeleteSession,
  onConfirmDeleteSession,
  showVersionModal,
  onCloseVersionModal,
  releaseInfo,
  currentVersion,
  latestVersion,
  installMode,
  t,
}: SidebarModalsProps) {
  // Settings expects project identity/path fields to be present for dropdown labels and local-scope MCP config.
  const settingsProjects = useMemo(
    () => projects.map(normalizeProjectForSettings),
    [projects],
  );

  return (
    <>
      {showNewProject &&
        ReactDOM.createPortal(
          <ProjectCreationWizard
            onClose={onCloseNewProject}
            onProjectCreated={onProjectCreated}
          />,
          document.body,
        )}

      {showSettings &&
        ReactDOM.createPortal(
          <TypedSettings
            isOpen={showSettings}
            onClose={onCloseSettings}
            projects={settingsProjects}
            initialTab={settingsInitialTab}
          />,
          document.body,
        )}

      {deleteConfirmation &&
        ReactDOM.createPortal(
          <div
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) onCancelDeleteProject();
            }}
          >
            <div className="modal-shell w-full max-w-md overflow-hidden rounded-xl border shadow-2xl" style={{ background: 'var(--paper)' }}>
              <div className="modal-head">
                <div className="modal-head-title">
                  <div className="modal-head-icon bg-[var(--warn-soft)] text-[var(--warn)]">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h3>{t('deleteConfirmation.deleteProject')}</h3>
                </div>
              </div>
              <div className="modal-body">
                <p className="text-[var(--fs-base)]" style={{ color: 'var(--ink-3)' }}>
                  {t('deleteConfirmation.confirmDelete')}{' '}
                  <span className="font-medium">
                    {deleteConfirmation.project.displayName || deleteConfirmation.project.projectId}
                  </span>
                  ?
                </p>
                {deleteConfirmation.sessionCount > 0 && (
                  <p className="text-[var(--fs-base)]" style={{ color: 'var(--ink-3)' }}>
                    {t('deleteConfirmation.sessionCount', { count: deleteConfirmation.sessionCount })}
                  </p>
                )}
              </div>
              <div className="modal-foot flex-col gap-2" style={{ background: 'var(--paper-2)' }}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onConfirmDeleteProject(false)}
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  {t('deleteConfirmation.removeFromSidebar')}
                </Button>
                <Button
                  variant="destructive"
                  className="hover:bg-[var(--err)]/90 w-full justify-start bg-[var(--err)] text-white"
                  onClick={() => onConfirmDeleteProject(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('deleteConfirmation.deleteAllData')}
                </Button>
                <Button variant="ghost" className="w-full" onClick={onCancelDeleteProject}>
                  {t('actions.cancel')}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {sessionDeleteConfirmation &&
        ReactDOM.createPortal(
          <div
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) onCancelDeleteSession();
            }}
          >
            <div className="modal-shell w-full max-w-md overflow-hidden rounded-xl border shadow-2xl" style={{ background: 'var(--paper)' }}>
              <div className="modal-head">
                <div className="modal-head-title">
                  <div className="modal-head-icon bg-[var(--err-soft)] text-[var(--err)]">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h3>{t('deleteConfirmation.deleteSession')}</h3>
                </div>
              </div>
              <div className="modal-body">
                <p className="text-[var(--fs-base)]" style={{ color: 'var(--ink-3)' }}>
                  {t('deleteConfirmation.confirmDelete')}{' '}
                  <span className="font-medium">
                    {sessionDeleteConfirmation.sessionTitle || t('sessions.unnamed')}
                  </span>
                  ?
                </p>
                <p className="text-[var(--fs-sm)]" style={{ color: 'var(--ink-3)' }}>
                  {t('deleteConfirmation.cannotUndo')}
                </p>
              </div>
              <div className="modal-foot" style={{ background: 'var(--paper-2)' }}>
                <Button variant="outline" className="flex-1" onClick={onCancelDeleteSession}>
                  {t('actions.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  className="hover:bg-[var(--err)]/90 flex-1 bg-[var(--err)] text-white"
                  onClick={onConfirmDeleteSession}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('actions.delete')}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <VersionUpgradeModal
        isOpen={showVersionModal}
        onClose={onCloseVersionModal}
        releaseInfo={releaseInfo}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
        installMode={installMode}
      />
    </>
  );
}
