import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
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

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-[var(--brand-accent)]" />
          <h3 className="text-lg font-medium">{t('notifications.title')}</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{t('notifications.description')}</p>
      </div>

      <div className="space-y-4 rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <h4 className="font-medium">{t('notifications.webPush.title')}</h4>
        {!pushSupported ? (
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{t('notifications.webPush.unsupported')}</p>
        ) : pushDenied ? (
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{t('notifications.webPush.denied')}</p>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isPushLoading}
              onClick={() => {
                if (isPushSubscribed) {
                  onDisablePush();
                } else {
                  onEnablePush();
                }
              }}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isPushSubscribed
                  ? 'bg-[var(--err)]/10 hover:bg-[var(--err)]/20 dark:bg-[var(--err)]/10 dark:hover:bg-[var(--err)]/20 text-[var(--err)] dark:text-[var(--err)]'
                  : 'hover:bg-[var(--brand-accent)]/90 dark:hover:bg-[var(--brand-accent)]/90 bg-[var(--brand-accent)] text-white dark:bg-[var(--brand-accent)]'
              }`}
            >
              {isPushLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPushSubscribed ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
              {isPushLoading
                ? t('notifications.webPush.loading')
                : isPushSubscribed
                  ? t('notifications.webPush.disable')
                  : t('notifications.webPush.enable')}
            </button>
            {isPushSubscribed && (
              <span               className="badge badge-ok text-sm">
                {t('notifications.webPush.enabled')}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <h4 className="font-medium">{t('notifications.events.title')}</h4>
        <div className="space-y-3">
          <label           className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notificationPreferences.events.actionRequired}
              onChange={(event) =>
                onNotificationPreferencesChange({
                  ...notificationPreferences,
                  events: {
                    ...notificationPreferences.events,
                    actionRequired: event.target.checked,
                  },
                })
              }
              className="h-4 w-4"
            />
            {t('notifications.events.actionRequired')}
          </label>

          <label           className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notificationPreferences.events.stop}
              onChange={(event) =>
                onNotificationPreferencesChange({
                  ...notificationPreferences,
                  events: {
                    ...notificationPreferences.events,
                    stop: event.target.checked,
                  },
                })
              }
              className="h-4 w-4"
            />
            {t('notifications.events.stop')}
          </label>

          <label           className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notificationPreferences.events.error}
              onChange={(event) =>
                onNotificationPreferencesChange({
                  ...notificationPreferences,
                  events: {
                    ...notificationPreferences.events,
                    error: event.target.checked,
                  },
                })
              }
              className="h-4 w-4"
            />
            {t('notifications.events.error')}
          </label>
        </div>
      </div>
    </div>
  );
}
