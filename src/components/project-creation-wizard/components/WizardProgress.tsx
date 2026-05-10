import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WizardStep } from '../types';

type WizardProgressProps = {
  step: WizardStep;
};

export default function WizardProgress({ step }: WizardProgressProps) {
  const { t } = useTranslation();
  const steps: WizardStep[] = [1, 2];

  return (
    <div className="px-6 pb-2 pt-4">
      <div className="flex items-center justify-between">
        {steps.map((currentStep) => (
          <Fragment key={currentStep}>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep < step
                    ? 'bg-[var(--ok)] text-[var(--paper)]'
                    : currentStep === step
                      ? 'bg-[var(--ink)] text-[var(--paper)]'
                      : 'bg-[var(--paper-3)] text-[var(--ink-3)]'
                }`}
              >
                {currentStep < step ? <Check className="h-4 w-4" /> : currentStep}
              </div>
              <span className="hidden text-sm font-medium text-[var(--ink-2)] sm:inline">
                {currentStep === 1
                  ? t('projectWizard.steps.configure')
                  : t('projectWizard.steps.confirm')}
              </span>
            </div>

            {currentStep < 2 && (
              <div
                className={`mx-2 h-1 flex-1 rounded ${
                  currentStep < step ? 'bg-[var(--ok)]' : 'bg-[var(--paper-3)]'
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
