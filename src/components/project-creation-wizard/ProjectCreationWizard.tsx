import { useCallback, useMemo, useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ErrorBanner from './components/ErrorBanner';
import StepConfiguration from './components/StepConfiguration';
import StepReview from './components/StepReview';
import WizardFooter from './components/WizardFooter';
import WizardProgress from './components/WizardProgress';
import { useGithubTokens } from './hooks/useGithubTokens';
import { cloneWorkspaceWithProgress, createProjectRequest } from './data/workspaceApi';
import { isCloneWorkflow, shouldShowGithubAuthentication } from './utils/pathUtils';
import type { TokenMode, WizardFormState, WizardStep } from './types';

type ProjectCreationWizardProps = {
  onClose: () => void;
  onProjectCreated?: (project?: Record<string, unknown>) => void;
};

const initialFormState: WizardFormState = {
  workspacePath: '',
  githubUrl: '',
  tokenMode: 'stored',
  selectedGithubToken: '',
  newGithubToken: '',
};

export default function ProjectCreationWizard({
  onClose,
  onProjectCreated,
}: ProjectCreationWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [formState, setFormState] = useState<WizardFormState>(initialFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloneProgress, setCloneProgress] = useState('');

  const shouldLoadTokens =
    step === 1 && shouldShowGithubAuthentication(formState.githubUrl);

  const autoSelectToken = useCallback((tokenId: string) => {
    setFormState((previous) => ({ ...previous, selectedGithubToken: tokenId }));
  }, []);

  const {
    tokens: availableTokens,
    loading: loadingTokens,
    loadError: tokenLoadError,
    selectedTokenName,
  } = useGithubTokens({
    shouldLoad: shouldLoadTokens,
    selectedTokenId: formState.selectedGithubToken,
    onAutoSelectToken: autoSelectToken,
  });

  // Keep cross-step values in this component; local UI state lives in child components.
  const updateField = useCallback(<K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }, []);

  const updateTokenMode = useCallback(
    (tokenMode: TokenMode) => updateField('tokenMode', tokenMode),
    [updateField],
  );

  const handleNext = useCallback(() => {
    setError(null);

    if (step === 1) {
      if (!formState.workspacePath.trim()) {
        setError(t('projectWizard.errors.providePath'));
        return;
      }
      setStep(2);
    }
  }, [formState.workspacePath, step, t]);

  const handleBack = useCallback(() => {
    setError(null);
    setStep((previousStep) => (previousStep > 1 ? ((previousStep - 1) as WizardStep) : previousStep));
  }, []);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    setCloneProgress('');

    try {
      const shouldCloneRepository = isCloneWorkflow(formState.githubUrl);

      if (shouldCloneRepository) {
        const project = await cloneWorkspaceWithProgress(
          {
            workspacePath: formState.workspacePath,
            githubUrl: formState.githubUrl,
            tokenMode: formState.tokenMode,
            selectedGithubToken: formState.selectedGithubToken,
            newGithubToken: formState.newGithubToken,
          },
          {
            onProgress: setCloneProgress,
          },
        );

        onProjectCreated?.(project);
        onClose();
        return;
      }

      const project = await createProjectRequest({
        path: formState.workspacePath.trim(),
      });

      onProjectCreated?.(project);
      onClose();
    } catch (createError) {
      const errorMessage =
        createError instanceof Error
          ? createError.message
          : t('projectWizard.errors.failedToCreate');
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [formState, onClose, onProjectCreated, t]);

  const shouldCloneRepository = useMemo(
    () => isCloneWorkflow(formState.githubUrl),
    [formState.githubUrl],
  );

  return (
    <div className="modal-overlay" style={{ zIndex: 60 }}>
      <div className="modal-shell h-full w-full sm:h-auto sm:max-w-2xl">
        <div className="modal-head">
          <div className="modal-head-title">
            <div className="modal-head-icon">
              <FolderPlus className="h-4 w-4" />
            </div>
            <h3>{t('projectWizard.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-1)] p-2 text-[var(--ink-3)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
            disabled={isCreating}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <WizardProgress step={step} />

        <div className="modal-body min-h-[300px]">
          {error && <ErrorBanner message={error} />}

          {step === 1 && (
            <StepConfiguration
              workspacePath={formState.workspacePath}
              githubUrl={formState.githubUrl}
              tokenMode={formState.tokenMode}
              selectedGithubToken={formState.selectedGithubToken}
              newGithubToken={formState.newGithubToken}
              availableTokens={availableTokens}
              loadingTokens={loadingTokens}
              tokenLoadError={tokenLoadError}
              isCreating={isCreating}
              onWorkspacePathChange={(workspacePath) => updateField('workspacePath', workspacePath)}
              onGithubUrlChange={(githubUrl) => updateField('githubUrl', githubUrl)}
              onTokenModeChange={updateTokenMode}
              onSelectedGithubTokenChange={(selectedGithubToken) =>
                updateField('selectedGithubToken', selectedGithubToken)
              }
              onNewGithubTokenChange={(newGithubToken) =>
                updateField('newGithubToken', newGithubToken)
              }
              onAdvanceToConfirm={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepReview
              formState={formState}
              selectedTokenName={selectedTokenName}
              isCreating={isCreating}
              cloneProgress={cloneProgress}
            />
          )}
        </div>

        <WizardFooter
          step={step}
          isCreating={isCreating}
          isCloneWorkflow={shouldCloneRepository}
          onClose={onClose}
          onBack={handleBack}
          onNext={handleNext}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
