import { useTranslation } from 'react-i18next';

import type { AgentCategory } from '../../../../types/types';
import type { AgentCategoryTabsSectionProps } from '../types';

const AGENT_CATEGORIES: AgentCategory[] = ['account', 'permissions', 'tools', 'models'];
const ACCOUNT_ONLY_AGENT_CATEGORIES: AgentCategory[] = ['account'];
const NO_PERMISSION_AGENT_CATEGORIES: AgentCategory[] = ['account', 'tools', 'models'];

export default function AgentCategoryTabsSection({
  selectedCategory,
  onSelectCategory,
  selectedAgent,
}: AgentCategoryTabsSectionProps) {
  const { t } = useTranslation('settings');
  const categories = selectedAgent === 'hoocode'
    ? ACCOUNT_ONLY_AGENT_CATEGORIES
    : selectedAgent === 'opencode'
      ? NO_PERMISSION_AGENT_CATEGORIES
      : AGENT_CATEGORIES;

  return (
    <div role="tablist" className="settings-segment flex-wrap">
      {categories.map((category) => (
        <button
          key={category}
          role="tab"
          type="button"
          aria-selected={selectedCategory === category}
          onClick={() => onSelectCategory(category)}
          className={`segment-btn ${selectedCategory === category ? 'active' : ''}`}
        >
          {category === 'account' && t('tabs.account')}
          {category === 'permissions' && t('tabs.permissions')}
          {category === 'tools' && t('tabs.tools')}
          {category === 'models' && t('tabs.models')}
        </button>
      ))}
    </div>
  );
}
