import { useTranslation } from 'react-i18next';

import { cn } from '../../../../../../lib/utils';
import type { AgentCategory } from '../../../../types/types';
import type { AgentCategoryTabsSectionProps } from '../types';

const AGENT_CATEGORIES: AgentCategory[] = ['account', 'permissions', 'mcp'];

// Pi only exposes account info — MCP and per-tool permissions aren't supported
// by the backend (see pi-mcp.provider.ts). Hide the irrelevant tabs so the UI
// doesn't dead-end into a broken state.
const PI_AGENT_CATEGORIES: AgentCategory[] = ['account'];

export default function AgentCategoryTabsSection({
  selectedCategory,
  onSelectCategory,
  selectedAgent,
}: AgentCategoryTabsSectionProps) {
  const { t } = useTranslation('settings');
  const categories = selectedAgent === 'pi' ? PI_AGENT_CATEGORIES : AGENT_CATEGORIES;

  return (
    <div className="flex-shrink-0 border-b border-border">
      <div role="tablist" className="flex overflow-x-auto px-2 md:px-4">
        {categories.map((category) => (
          <button
            key={category}
            role="tab"
            aria-selected={selectedCategory === category}
            onClick={() => onSelectCategory(category)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium touch-manipulation transition-colors duration-150',
              selectedCategory === category
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {category === 'account' && t('tabs.account')}
            {category === 'permissions' && t('tabs.permissions')}
            {category === 'mcp' && t('tabs.mcpServers')}
          </button>
        ))}
      </div>
    </div>
  );
}
