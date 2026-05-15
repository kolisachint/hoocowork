import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DarkModeToggle } from '../../../shared/view/ui';
import LanguageSelector from '../../../shared/view/ui/LanguageSelector';
import {
  INPUT_SETTING_TOGGLES,
  TOOL_DISPLAY_TOGGLES,
  VIEW_OPTION_TOGGLES,
} from '../constants';
import type {
  PreferenceToggleItem,
  PreferenceToggleKey,
  QuickSettingsPreferences,
} from '../types';

import QuickSettingsSection from './QuickSettingsSection';
import QuickSettingsToggleRow from './QuickSettingsToggleRow';

type QuickSettingsContentProps = {
  isDarkMode: boolean;
  preferences: QuickSettingsPreferences;
  onPreferenceChange: (key: PreferenceToggleKey, value: boolean) => void;
};

export default function QuickSettingsContent({
  isDarkMode,
  preferences,
  onPreferenceChange,
}: QuickSettingsContentProps) {
  const { t } = useTranslation('settings');

  const renderToggleRows = (items: PreferenceToggleItem[]) => (
    items.map(({ key, labelKey, icon }) => (
      <QuickSettingsToggleRow
        key={key}
        label={t(labelKey)}
        icon={icon}
        checked={preferences[key]}
        onCheckedChange={(value) => onPreferenceChange(key, value)}
      />
    ))
  );

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="qs-section">
        <h4 className="qs-section-title">{t('quickSettings.sections.appearance')}</h4>
        <div className="qs-section-body">
          <div className="qs-inline">
            <span className="qs-row-label">
              {isDarkMode ? (
                <Moon className="qs-icon" style={{ width: 16, height: 16 }} />
              ) : (
                <Sun className="qs-icon" style={{ width: 16, height: 16 }} />
              )}
              {t('quickSettings.darkMode')}
            </span>
            <DarkModeToggle />
          </div>
          <LanguageSelector compact />
        </div>
      </div>

      <div className="qs-section">
        <h4 className="qs-section-title">{t('quickSettings.sections.toolDisplay')}</h4>
        <div className="qs-section-body">
          {renderToggleRows(TOOL_DISPLAY_TOGGLES)}
        </div>
      </div>

      <div className="qs-section">
        <h4 className="qs-section-title">{t('quickSettings.sections.viewOptions')}</h4>
        <div className="qs-section-body">
          {renderToggleRows(VIEW_OPTION_TOGGLES)}
        </div>
      </div>

      <div className="qs-section">
        <h4 className="qs-section-title">{t('quickSettings.sections.inputSettings')}</h4>
        <div className="qs-section-body">
          {renderToggleRows(INPUT_SETTING_TOGGLES)}
          <p className="qs-hint">
            {t('quickSettings.sendByCtrlEnterDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}
