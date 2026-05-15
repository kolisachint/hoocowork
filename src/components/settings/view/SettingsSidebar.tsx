import { Bell, Bot, GitBranch, Info, Key, ListChecks, Palette, Puzzle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SettingsMainTab } from '../types/types';

type SettingsSidebarProps = {
  activeTab: SettingsMainTab;
  onChange: (tab: SettingsMainTab) => void;
};

type NavItem = {
  id: SettingsMainTab;
  labelKey: string;
  icon: typeof Bot;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'agents', labelKey: 'mainTabs.agents', icon: Bot },
  { id: 'appearance', labelKey: 'mainTabs.appearance', icon: Palette },
  { id: 'git', labelKey: 'mainTabs.git', icon: GitBranch },
  { id: 'api', labelKey: 'mainTabs.apiTokens', icon: Key },
  { id: 'tasks', labelKey: 'mainTabs.tasks', icon: ListChecks },
  { id: 'mcp', labelKey: 'mainTabs.mcp', icon: Sparkles },
  { id: 'plugins', labelKey: 'mainTabs.plugins', icon: Puzzle },
  { id: 'notifications', labelKey: 'mainTabs.notifications', icon: Bell },
  { id: 'about', labelKey: 'mainTabs.about', icon: Info },
];

export default function SettingsSidebar({ activeTab, onChange }: SettingsSidebarProps) {
  const { t } = useTranslation('settings');

  return (
    <>
      <aside className="settings-rail">
        <div className="cli-eyebrow" style={{ padding: '0 var(--s-3) var(--s-3)' }}>
          {t('title')}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`settings-nav ${isActive ? 'active' : ''}`}
              onClick={() => onChange(item.id)}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </aside>

      <div className="settings-mobile-tabs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`settings-pill ${isActive ? 'active' : ''}`}
              onClick={() => onChange(item.id)}
            >
              <Icon className="h-3 w-3 flex-shrink-0" />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
