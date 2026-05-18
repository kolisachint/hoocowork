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
    <div className="pwiz-progress">
      {steps.map((currentStep) => {
        const state = currentStep < step ? 'done' : currentStep === step ? 'active' : '';
        return (
          <Fragment key={currentStep}>
            <div className={`pwiz-step ${state}`}>
              <span className="num">
                {currentStep < step ? <Check className="h-3 w-3" /> : currentStep}
              </span>
              <span className="hidden sm:inline">
                {currentStep === 1
                  ? t('projectWizard.steps.configure')
                  : t('projectWizard.steps.confirm')}
              </span>
            </div>

            {currentStep < 2 && <span className="sep" />}
          </Fragment>
        );
      })}
    </div>
  );
}
