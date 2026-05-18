import { ExternalLink, FileText, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type TaskHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreatePrd: () => void;
};

type HelpStep = {
  index: number;
  title: string;
  description: string;
  accent: string;
};

export default function TaskHelpModal({ isOpen, onClose, onCreatePrd }: TaskHelpModalProps) {
  const { t } = useTranslation('tasks');

  if (!isOpen) {
    return null;
  }

  const steps: HelpStep[] = [
    {
      index: 1,
      title: t('gettingStarted.steps.createPRD.title'),
      description: t('gettingStarted.steps.createPRD.description'),
      accent: 'border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/5/40',
    },
    {
      index: 2,
      title: t('gettingStarted.steps.generateTasks.title'),
      description: t('gettingStarted.steps.generateTasks.description'),
      accent: 'border-[var(--ok)]/20 dark:border-[var(--ok)]/80 bg-[var(--ok)]/5 dark:bg-[var(--ok)]/10/40',
    },
    {
      index: 3,
      title: t('gettingStarted.steps.analyzeTasks.title'),
      description: t('gettingStarted.steps.analyzeTasks.description'),
      accent: 'border-[var(--warn)]/20 dark:border-[var(--warn)]/80 bg-[var(--warn)]/5 dark:bg-[var(--warn)]/10',
    },
    {
      index: 4,
      title: t('gettingStarted.steps.startBuilding.title'),
      description: t('gettingStarted.steps.startBuilding.description'),
      accent: 'border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/5/40',
    },
  ];

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-shell max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--paper)] shadow-xl">
        <div className="modal-head">
          <div className="modal-head-title">
            <div className="modal-head-icon">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3>{t('helpGuide.title')}</h3>
              <p className="text-sm text-[var(--ink-3)]">{t('helpGuide.subtitle')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="icon-btn"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body">
          {steps.map((step) => (
            <div key={step.index} className={`rounded-lg border p-4 ${step.accent}`}>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] text-sm font-semibold text-white">
                  {step.index}
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-[var(--ink)]">{step.title}</h4>
                  <p className="text-sm text-[var(--ink-3)]">{step.description}</p>

                  {step.index === 1 && (
                    <button
                      onClick={() => {
                        onCreatePrd();
                        onClose();
                      }}
                      className="bg-[var(--brand-accent)]/10 hover:bg-[var(--brand-accent)]/20 mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[var(--brand-accent)]"
                    >
                      <FileText className="h-4 w-4" />
                      {t('buttons.addPRD')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-[var(--line)] bg-[var(--paper-2)]/50 p-4">
            <h4 className="mb-2 font-medium text-[var(--ink)]">{t('helpGuide.proTips.title')}</h4>
            <ul className="space-y-2 text-sm text-[var(--ink-3)]">
              <li>{t('helpGuide.proTips.search')}</li>
              <li>{t('helpGuide.proTips.views')}</li>
              <li>{t('helpGuide.proTips.filters')}</li>
              <li>{t('helpGuide.proTips.details')}</li>
            </ul>
          </div>

          <div className="border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/5 rounded-lg border p-4">
            <h4 className="mb-2 font-medium text-[var(--ink)]">{t('helpGuide.learnMore.title')}</h4>
            <p className="mb-3 text-sm text-[var(--ink-3)]">{t('helpGuide.learnMore.description')}</p>
            <a
              href="https://github.com/eyaltoledano/claude-task-master"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-[var(--brand-accent)]/90 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-accent)] px-3 py-2 text-sm font-medium text-white"
            >
              {t('helpGuide.learnMore.githubButton')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
