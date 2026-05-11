import { useState } from 'react';
import { Plus, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../../../lib/utils';
import Shell from '../../../shell/view/Shell';
import type { TaskMasterProject } from '../../types';

type TaskMasterSetupModalProps = {
  isOpen: boolean;
  project: TaskMasterProject | null;
  onClose: () => void;
  onAfterClose?: (() => void) | null;
};

export default function TaskMasterSetupModal({ isOpen, project, onClose, onAfterClose = null }: TaskMasterSetupModalProps) {
  const { t } = useTranslation('tasks');
  const [isTaskMasterComplete, setIsTaskMasterComplete] = useState(false);

  if (!isOpen || !project) {
    return null;
  }

  const closeModal = () => {
    onClose();
    setIsTaskMasterComplete(false);

    // Delay refresh slightly so the CLI has time to flush writes to disk.
    window.setTimeout(() => {
      onAfterClose?.();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16 backdrop-blur-sm">
      <div className="flex h-[600px] w-full max-w-4xl flex-col rounded-lg border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--brand-accent)]/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Terminal className="h-4 w-4 text-[var(--brand-accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('setupModal.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('setupModal.subtitle', { projectName: project.displayName })}</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Close"
          >
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>

        <div className="flex-1 p-4">
          <div className="h-full overflow-hidden rounded-lg bg-black">
            <Shell
              selectedProject={project}
              selectedSession={null}
              initialCommand="npx task-master init"
              isPlainShell
              isActive
              onProcessComplete={(exitCode) => {
                if (exitCode === 0) {
                  setIsTaskMasterComplete(true);
                }
              }}
            />
          </div>
        </div>

        <div className="border-t border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isTaskMasterComplete ? (
                <span className="flex items-center gap-2 text-[var(--ok)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
                  {t('setupModal.completed')}
                </span>
              ) : (
                t('setupModal.willStart')
              )}
            </div>

            <button
              onClick={closeModal}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                isTaskMasterComplete
                  ? 'bg-[var(--ok)] hover:bg-[var(--ok)]/90 text-white'
                  : 'text-muted-foreground bg-background border border-border hover:bg-muted',
              )}
            >
              {isTaskMasterComplete ? t('setupModal.closeContinueButton') : t('setupModal.closeButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
