import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useGitSettings } from '../../../hooks/useGitSettings';

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

export default function GitSettingsTab() {
  const { t } = useTranslation('settings');
  const {
    gitName,
    setGitName,
    gitEmail,
    setGitEmail,
    isLoading,
    isSaving,
    saveStatus,
    saveGitConfig,
  } = useGitSettings();

  // Behavior settings (local state with localStorage persistence)
  const [autoFetch, setAutoFetch] = useState(() => {
    return localStorage.getItem('gitAutoFetch') !== 'false'; // default true
  });
  const [confirmBeforePush, setConfirmBeforePush] = useState(() => {
    return localStorage.getItem('gitConfirmBeforePush') !== 'false'; // default true
  });
  const [signCommits, setSignCommits] = useState(() => {
    return localStorage.getItem('gitSignCommits') === 'true'; // default false
  });

  // Persist behavior settings
  useEffect(() => {
    localStorage.setItem('gitAutoFetch', String(autoFetch));
  }, [autoFetch]);

  useEffect(() => {
    localStorage.setItem('gitConfirmBeforePush', String(confirmBeforePush));
  }, [confirmBeforePush]);

  useEffect(() => {
    localStorage.setItem('gitSignCommits', String(signCommits));
  }, [signCommits]);

  const handleSave = () => {
    void saveGitConfig();
  };

  return (
    <>
      <div className="settings-h1">{t('mainTabs.git')}</div>
      <div className="settings-sub">Identity used for commits made from HooCowork.</div>

      {/* Identity Section */}
      <SettingsSection title="Identity">
        <SettingsRow label="Name">
          <input
            className="input"
            type="text"
            value={gitName}
            onChange={(e) => setGitName(e.target.value)}
            placeholder="kolisachint"
            disabled={isLoading}
          />
        </SettingsRow>
        <SettingsRow label="Email">
          <input
            className="input"
            type="email"
            value={gitEmail}
            onChange={(e) => setGitEmail(e.target.value)}
            placeholder="me@kolisachint.com"
            disabled={isLoading}
          />
        </SettingsRow>
        <SettingsRow label="Save identity" hint={saveStatus === 'success' ? 'Saved' : saveStatus === 'error' ? 'Unable to save' : undefined}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </SettingsRow>
      </SettingsSection>

      {/* Behavior Section */}
      <SettingsSection title="Behavior">
        <SettingsRow label="Auto-fetch every 5 min" hint="Polls remote for new commits">
          <Toggle checked={autoFetch} onChange={setAutoFetch} />
        </SettingsRow>
        <SettingsRow label="Confirm before push">
          <Toggle checked={confirmBeforePush} onChange={setConfirmBeforePush} />
        </SettingsRow>
        <SettingsRow label="Sign commits (GPG)">
          <Toggle checked={signCommits} onChange={setSignCommits} />
        </SettingsRow>
      </SettingsSection>
    </>
  );
}
