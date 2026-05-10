import { FileText, Settings, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import type { PrdFile } from '../types';

type TaskEmptyStateProps = {
  className?: string;
  hasTaskMasterDirectory: boolean;
  existingPrds: PrdFile[];
  onOpenSetupModal: () => void;
  onCreatePrd: () => void;
  onOpenPrd: (prd: PrdFile) => void;
};

export default function TaskEmptyState({
  className = '',
  hasTaskMasterDirectory,
  existingPrds,
  onOpenSetupModal,
  onCreatePrd,
  onOpenPrd,
}: TaskEmptyStateProps) {
  const { t } = useTranslation('tasks');

  if (!hasTaskMasterDirectory) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-[var(--brand-accent)]">
            <Settings className="mx-auto mb-4 h-12 w-12" />
          </div>

          <h3 className="mb-2 text-lg font-semibold text-[var(--ink)]">{t('notConfigured.title')}</h3>
          <p className="mb-6 text-sm text-[var(--ink-3)]">{t('notConfigured.description')}</p>

          <div className="mb-6 rounded-[var(--radius-2)] bg-[var(--brand-accent-soft)] p-4 text-left">
            <h4 className="mb-3 text-sm font-medium text-[var(--ink)]">{t('notConfigured.whatIsTitle')}</h4>
            <div className="space-y-1 text-xs text-[var(--brand-accent)]">
              <p>- {t('notConfigured.features.aiPowered')}</p>
              <p>- {t('notConfigured.features.prdTemplates')}</p>
              <p>- {t('notConfigured.features.dependencyTracking')}</p>
              <p>- {t('notConfigured.features.progressVisualization')}</p>
              <p>- {t('notConfigured.features.cliIntegration')}</p>
            </div>
          </div>

          <button
            onClick={onOpenSetupModal}
            className="mx-auto flex items-center gap-2 rounded-lg bg-[var(--brand-accent)] px-4 py-2 font-medium text-[var(--brand-accent-ink)] transition-colors hover:opacity-90"
          >
            <Terminal className="h-4 w-4" />
            {t('notConfigured.initializeButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-xl border border-[var(--brand-accent)]/30 bg-[var(--brand-accent-soft)] p-6 text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)]">
              <FileText className="h-5 w-5 text-[var(--brand-accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink)]">{t('gettingStarted.title')}</h2>
              <p className="text-sm text-[var(--ink-3)]">{t('gettingStarted.subtitle')}</p>
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
              <h4 className="mb-1 font-medium text-[var(--ink)]">1. {t('gettingStarted.steps.createPRD.title')}</h4>
              <p className="mb-3 text-sm text-[var(--ink-3)]">{t('gettingStarted.steps.createPRD.description')}</p>

              <button
                onClick={onCreatePrd}
                className="inline-flex items-center gap-2 rounded bg-[var(--brand-accent)]/10 px-2 py-1 text-xs text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/20 dark:bg-[var(--brand-accent)]/10 dark:text-[var(--brand-accent)] dark:hover:bg-[var(--brand-accent)]/20"
              >
                <FileText className="h-3 w-3" />
                {t('gettingStarted.steps.createPRD.addButton')}
              </button>

              {existingPrds.length > 0 && (
                <div className="mt-3 border-t border-[var(--line)] pt-3">
                  <p className="mb-2 text-xs text-[var(--ink-3)]">{t('gettingStarted.steps.createPRD.existingPRDs')}</p>
                  <div className="flex flex-wrap gap-2">
                    {existingPrds.map((prd) => (
                      <button
                        key={prd.name}
                        onClick={() => onOpenPrd(prd)}
                        className="inline-flex items-center gap-1 rounded bg-[var(--paper-2)] px-2 py-1 text-xs text-[var(--ink-2)] hover:bg-[var(--paper-3)]"
                      >
                        <FileText className="h-3 w-3" />
                        {prd.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
              <h4 className="mb-1 font-medium text-[var(--ink)]">2. {t('gettingStarted.steps.generateTasks.title')}</h4>
              <p className="text-sm text-[var(--ink-3)]">{t('gettingStarted.steps.generateTasks.description')}</p>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
              <h4 className="mb-1 font-medium text-[var(--ink)]">3. {t('gettingStarted.steps.analyzeTasks.title')}</h4>
              <p className="text-sm text-[var(--ink-3)]">{t('gettingStarted.steps.analyzeTasks.description')}</p>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
              <h4 className="mb-1 font-medium text-[var(--ink)]">4. {t('gettingStarted.steps.startBuilding.title')}</h4>
              <p className="text-sm text-[var(--ink-3)]">{t('gettingStarted.steps.startBuilding.description')}</p>
            </div>
          </div>

          <button
            onClick={onCreatePrd}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-accent)] px-4 py-2 font-medium text-white hover:bg-[var(--brand-accent)]/90"
          >
            <FileText className="h-4 w-4" />
            {t('buttons.addPRD')}
          </button>
        </div>

        <p className="text-sm text-[var(--ink-3)]">{t('gettingStarted.tip')}</p>
      </div>
    </div>
  );
}
