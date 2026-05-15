import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AgentProvider } from '../../../../../types/types';

const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
  { id: 'claude-opus-4-1', name: 'Claude Opus 4.1' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
];

const THINKING_BUDGETS = [
  { id: 'auto', name: 'Auto' },
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
];

type ModelsContentProps = {
  agent: AgentProvider;
};

export default function ModelsContent({ agent }: ModelsContentProps) {
  const { t } = useTranslation('settings');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-5');
  const [thinkingBudget, setThinkingBudget] = useState('auto');

  // Only show for Claude initially - other agents can be added later
  if (agent !== 'claude') {
    return (
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('models.title')}</div>
          <div className="settings-section-desc">{t('models.notAvailableForAgent', { agent })}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('models.title')}</div>
        </div>
        <div className="settings-section-body">
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label">{t('models.defaultModel')}</div>
            </div>
            <div className="settings-row-ctrl">
              <select
                className="composer-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {CLAUDE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-label">{t('models.thinkingBudget')}</div>
              <div className="settings-row-hint">{t('models.thinkingBudgetHint')}</div>
            </div>
            <div className="settings-row-ctrl">
              <select
                className="composer-model"
                value={thinkingBudget}
                onChange={(e) => setThinkingBudget(e.target.value)}
              >
                {THINKING_BUDGETS.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
