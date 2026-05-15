import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProjectSortOrder } from '../../types/types';
import LanguageSelector from '../../../../shared/view/ui/LanguageSelector';

// Theme options matching the zipped design
const THEMES = [
  { id: 'paper', label: 'Paper', desc: 'Off-white' },
  { id: 'ink', label: 'Ink', desc: 'Deep black' },
  { id: 'auto', label: 'Auto', desc: 'Follow system' },
] as const;

type ThemeId = typeof THEMES[number]['id'];

// Simple Toggle component matching the design
function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
    </label>
  );
}

// Settings section component matching the design pattern
function SettingsSection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        {desc && <div className="settings-section-desc">{desc}</div>}
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}

// Settings row component matching the design pattern
function SettingsRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{label}</div>
        {hint && <div className="settings-row-hint">{hint}</div>}
      </div>
      <div className="settings-row-ctrl">{children}</div>
    </div>
  );
}

type AppearanceSettingsTabProps = {
  projectSortOrder: ProjectSortOrder;
  onProjectSortOrderChange: (value: ProjectSortOrder) => void;
};

export default function AppearanceSettingsTab({
  projectSortOrder,
  onProjectSortOrderChange,
}: AppearanceSettingsTabProps) {
  const { t } = useTranslation('settings');

  // Theme state - mapped from localStorage theme
  const [theme, setTheme] = useState<ThemeId>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return 'ink';
    if (savedTheme === 'light') return 'paper';
    return 'auto';
  });

  // Density settings
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true';
  });
  const [animations, setAnimations] = useState(() => {
    const saved = localStorage.getItem('animations');
    return saved !== 'false'; // default true
  });

  // Apply theme changes
  useEffect(() => {
    const isDarkMode = theme === 'ink' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Update iOS status bar
    const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (statusBarMeta) {
      statusBarMeta.setAttribute('content', isDarkMode ? 'black-translucent' : 'default');
    }
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDarkMode ? '#0c1117' : '#ffffff');
    }
  }, [theme]);

  // Apply compact mode
  useEffect(() => {
    if (compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
    localStorage.setItem('compactMode', String(compactMode));
  }, [compactMode]);

  // Apply animations preference
  useEffect(() => {
    if (!animations) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    localStorage.setItem('animations', String(animations));
  }, [animations]);

  return (
    <>
      <div className="settings-h1">{t('mainTabs.appearance')}</div>
      <div className="settings-sub">Theme, language, and density.</div>

      {/* Theme Section */}
      <SettingsSection title="Theme">
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-tile ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <div className={`theme-preview theme-${t.id}`} />
              <div className="theme-label">{t.label}</div>
              <div className="theme-desc">{t.desc}</div>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Language Section */}
      <SettingsSection title="Language">
        <SettingsRow label="Display language">
          <LanguageSelector />
        </SettingsRow>
      </SettingsSection>

      {/* Density Section */}
      <SettingsSection title="Density">
        <SettingsRow label="Compact mode" hint="Tighter spacing across the app">
          <Toggle checked={compactMode} onChange={setCompactMode} />
        </SettingsRow>
        <SettingsRow label="Animations" hint="Disable for prefers-reduced-motion">
          <Toggle checked={animations} onChange={setAnimations} />
        </SettingsRow>
      </SettingsSection>

      {/* Project Sorting - Preserved from repo */}
      <SettingsSection title={t('appearanceSettings.projectSorting.label')}>
        <SettingsRow
          label={t('appearanceSettings.projectSorting.label')}
          hint={t('appearanceSettings.projectSorting.description')}
        >
          <select
            value={projectSortOrder}
            onChange={(e) => onProjectSortOrderChange(e.target.value as ProjectSortOrder)}
            className="composer-model"
            style={{ minWidth: 160 }}
          >
            <option value="name">{t('appearanceSettings.projectSorting.alphabetical')}</option>
            <option value="date">{t('appearanceSettings.projectSorting.recentActivity')}</option>
          </select>
        </SettingsRow>
      </SettingsSection>
    </>
  );
}
