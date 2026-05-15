import { Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuickSettingsPanelHeader() {
  const { t } = useTranslation('settings');

  return (
    <div className="qs-head">
      <div className="qs-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings2 style={{ width: 20, height: 20, color: 'var(--ink-3)' }} />
        {t('quickSettings.title')}
      </div>
    </div>
  );
}
