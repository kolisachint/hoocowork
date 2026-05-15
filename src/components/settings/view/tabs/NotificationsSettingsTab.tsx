import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { NotificationPreferencesState } from '../../types/types';

type NotificationsSettingsTabProps = {
  notificationPreferences: NotificationPreferencesState;
  onNotificationPreferencesChange: (value: NotificationPreferencesState) => void;
  pushPermission: NotificationPermission | 'unsupported';
  isPushSubscribed: boolean;
  isPushLoading: boolean;
  onEnablePush: () => void;
  onDisablePush: () => void;
};

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

export default function NotificationsSettingsTab({
  notificationPreferences,
  onNotificationPreferencesChange,
  pushPermission,
  isPushSubscribed,
  isPushLoading,
  onEnablePush,
  onDisablePush,
}: NotificationsSettingsTabProps) {
  const { t } = useTranslation('settings');

  const pushSupported = pushPermission !== 'unsupported';
  const pushDenied = pushPermission === 'denied';
  const [onlyWhenHidden, setOnlyWhenHidden] = useState(() => (
    localStorage.getItem('notificationsOnlyWhenHidden') !== 'false'
  ));
  const [gitFetchNotifications, setGitFetchNotifications] = useState(() => (
    localStorage.getItem('notificationsGitFetch') === 'true'
  ));

  useEffect(() => {
    localStorage.setItem('notificationsOnlyWhenHidden', String(onlyWhenHidden));
  }, [onlyWhenHidden]);

  useEffect(() => {
    localStorage.setItem('notificationsGitFetch', String(gitFetchNotifications));
  }, [gitFetchNotifications]);

  const handlePushToggle = (checked: boolean) => {
    if (checked) {
      onEnablePush();
    } else {
      onDisablePush();
    }
  };

  return (
    <>
      <div className="settings-h1">{t('mainTabs.notifications')}</div>
      <div className="settings-sub">Web Push to your browser when the agent finishes off-screen.</div>

      {/* Push Notifications Section */}
      <SettingsSection title="Push">
        {!pushSupported ? (
          <div className="settings-row" style={{ color: 'var(--ink-3)' }}>
            {t('notifications.webPush.unsupported')}
          </div>
        ) : pushDenied ? (
          <div className="settings-row" style={{ color: 'var(--warn)' }}>
            {t('notifications.webPush.denied')}
          </div>
        ) : (
          <>
            <SettingsRow label="Enable push" hint="Requires browser permission">
              <Toggle checked={isPushSubscribed} onChange={handlePushToggle} />
            </SettingsRow>
            <SettingsRow label="Only when tab is hidden" hint="Skip notifications if HooCowork is in focus">
              <Toggle checked={onlyWhenHidden} onChange={setOnlyWhenHidden} />
            </SettingsRow>
            {isPushLoading && (
              <div className="settings-row" style={{ color: 'var(--ink-3)' }}>
                {t('notifications.webPush.loading')}
              </div>
            )}
          </>
        )}
      </SettingsSection>

      {/* Events Section */}
      <SettingsSection title="What to notify on">
        <SettingsRow label="Agent finished response">
          <Toggle
            checked={notificationPreferences.events.stop}
            onChange={(checked) =>
              onNotificationPreferencesChange({
                ...notificationPreferences,
                events: { ...notificationPreferences.events, stop: checked },
              })
            }
          />
        </SettingsRow>
        <SettingsRow label="Tool needs approval">
          <Toggle
            checked={notificationPreferences.events.actionRequired}
            onChange={(checked) =>
              onNotificationPreferencesChange({
                ...notificationPreferences,
                events: { ...notificationPreferences.events, actionRequired: checked },
              })
            }
          />
        </SettingsRow>
        <SettingsRow label="Error in session">
          <Toggle
            checked={notificationPreferences.events.error}
            onChange={(checked) =>
              onNotificationPreferencesChange({
                ...notificationPreferences,
                events: { ...notificationPreferences.events, error: checked },
              })
            }
          />
        </SettingsRow>
        <SettingsRow label="Git fetch found new commits">
          <Toggle checked={gitFetchNotifications} onChange={setGitFetchNotifications} />
        </SettingsRow>
      </SettingsSection>

      {/* Quiet Hours Section - preserved from repo */}
      <SettingsSection title="Quiet hours">
        <SettingsRow label="Enable quiet hours" hint="Mute notifications during focus time">
          <Toggle
            checked={notificationPreferences.quietHours?.enabled ?? false}
            onChange={(checked) =>
              onNotificationPreferencesChange({
                ...notificationPreferences,
                quietHours: {
                  enabled: checked,
                  start: notificationPreferences.quietHours?.start ?? '22:00',
                  end: notificationPreferences.quietHours?.end ?? '08:00',
                },
              })
            }
          />
        </SettingsRow>
        {(notificationPreferences.quietHours?.enabled ?? false) && (
          <>
            <SettingsRow label="From">
              <input
                type="time"
                className="input"
                value={notificationPreferences.quietHours?.start ?? '22:00'}
                onChange={(e) =>
                  onNotificationPreferencesChange({
                    ...notificationPreferences,
                    quietHours: {
                      enabled: notificationPreferences.quietHours?.enabled ?? true,
                      start: e.target.value,
                      end: notificationPreferences.quietHours?.end ?? '08:00',
                    },
                  })
                }
              />
            </SettingsRow>
            <SettingsRow label="To">
              <input
                type="time"
                className="input"
                value={notificationPreferences.quietHours?.end ?? '08:00'}
                onChange={(e) =>
                  onNotificationPreferencesChange({
                    ...notificationPreferences,
                    quietHours: {
                      enabled: notificationPreferences.quietHours?.enabled ?? true,
                      start: notificationPreferences.quietHours?.start ?? '22:00',
                      end: e.target.value,
                    },
                  })
                }
              />
            </SettingsRow>
          </>
        )}
      </SettingsSection>
    </>
  );
}
