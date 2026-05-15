import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProviderLoginModal from '../../provider-auth/view/ProviderLoginModal';
import { Button } from '../../../shared/view/ui';
import SettingsErrorBoundary from '../../main-content/view/ErrorBoundary';
import SettingsSidebar from '../view/SettingsSidebar';
import AgentsSettingsTab from '../view/tabs/agents-settings/AgentsSettingsTab';
import AppearanceSettingsTab from '../view/tabs/AppearanceSettingsTab';
import CredentialsSettingsTab from '../view/tabs/api-settings/CredentialsSettingsTab';
import GitSettingsTab from '../view/tabs/git-settings/GitSettingsTab';
import NotificationsSettingsTab from '../view/tabs/NotificationsSettingsTab';
import TasksSettingsTab from '../view/tabs/tasks-settings/TasksSettingsTab';
import PluginSettingsTab from '../../plugins/view/PluginSettingsTab';
import McpSettingsTab from '../view/tabs/McpSettingsTab';
import AboutTab from '../view/tabs/AboutTab';
import { useSettingsController } from '../hooks/useSettingsController';
import { useWebPush } from '../../../hooks/useWebPush';
import type { SettingsProps } from '../types/types';

function Settings({ isOpen, onClose, projects = [], initialTab = 'agents', variant = 'modal' }: SettingsProps) {
  const { t } = useTranslation('settings');
  const {
    activeTab,
    setActiveTab,
    saveStatus,
    projectSortOrder,
    setProjectSortOrder,
    codeEditorSettings,
    updateCodeEditorSetting,
    claudePermissions,
    setClaudePermissions,
    notificationPreferences,
    setNotificationPreferences,
    cursorPermissions,
    setCursorPermissions,
    codexPermissionMode,
    setCodexPermissionMode,
    providerAuthStatus,
    geminiPermissionMode,
    setGeminiPermissionMode,
    openLoginForProvider,
    showLoginModal,
    setShowLoginModal,
    loginProvider,
    handleLoginComplete,
  } = useSettingsController({
    isOpen,
    initialTab
  });

  const {
    permission: pushPermission,
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe,
  } = useWebPush();

  const handleEnablePush = async () => {
    await pushSubscribe();
    setNotificationPreferences({
      ...notificationPreferences,
      channels: { ...notificationPreferences.channels, webPush: true },
    });
  };

  const handleDisablePush = async () => {
    await pushUnsubscribe();
    setNotificationPreferences({
      ...notificationPreferences,
      channels: { ...notificationPreferences.channels, webPush: false },
    });
  };

  if (!isOpen) {
    return null;
  }

  const isAuthenticated = Boolean(loginProvider && providerAuthStatus[loginProvider].authenticated);

  const body = (
    <div className="settings min-h-0 flex-1">
      <SettingsSidebar activeTab={activeTab} onChange={setActiveTab} />

      <main className="settings-pane">
        <SettingsErrorBoundary showDetails resetKeys={[activeTab]}>
          <div key={activeTab} className="settings-content settings-content-enter pb-safe-area-inset-bottom">
            {activeTab === 'appearance' && (
              <AppearanceSettingsTab
                projectSortOrder={projectSortOrder}
                onProjectSortOrderChange={setProjectSortOrder}
              />
            )}

            {activeTab === 'git' && <GitSettingsTab />}

            {activeTab === 'agents' && (
              <AgentsSettingsTab
                providerAuthStatus={providerAuthStatus}
                onProviderLogin={openLoginForProvider}
                claudePermissions={claudePermissions}
                onClaudePermissionsChange={setClaudePermissions}
                cursorPermissions={cursorPermissions}
                onCursorPermissionsChange={setCursorPermissions}
                codexPermissionMode={codexPermissionMode}
                onCodexPermissionModeChange={setCodexPermissionMode}
                geminiPermissionMode={geminiPermissionMode}
                onGeminiPermissionModeChange={setGeminiPermissionMode}
                projects={projects}
                onOpenMcpSettings={() => setActiveTab('mcp')}
              />
            )}

            {activeTab === 'tasks' && <TasksSettingsTab />}

            {activeTab === 'notifications' && (
              <NotificationsSettingsTab
                notificationPreferences={notificationPreferences}
                onNotificationPreferencesChange={setNotificationPreferences}
                pushPermission={pushPermission}
                isPushSubscribed={isPushSubscribed}
                isPushLoading={isPushLoading}
                onEnablePush={handleEnablePush}
                onDisablePush={handleDisablePush}
              />
            )}

            {activeTab === 'api' && <CredentialsSettingsTab />}

            {activeTab === 'mcp' && <McpSettingsTab projects={projects} />}

            {activeTab === 'plugins' && <PluginSettingsTab />}

            {activeTab === 'about' && <AboutTab />}
          </div>
        </SettingsErrorBoundary>
      </main>
    </div>
  );

  const loginModal = (
    <ProviderLoginModal
      key={loginProvider || 'claude'}
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      provider={loginProvider || 'claude'}
      onComplete={handleLoginComplete}
      isAuthenticated={isAuthenticated}
    />
  );

  if (variant === 'inline') {
    return (
      <div className="relative flex h-full w-full flex-col">
        {saveStatus === 'success' && (
          <div className="absolute right-4 top-2 z-10 md:right-5">
            <span className="animate-in fade-in rounded-md bg-[var(--ok)]/10 px-3 py-1.5 text-xs text-[var(--ok)]">{t('saveStatus.success')}</span>
          </div>
        )}
        {body}
        {loginModal}
      </div>
    );
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm md:p-4">
      <div className="relative flex h-full w-full flex-col overflow-hidden border border-border bg-card shadow-2xl md:h-[90vh] md:max-w-4xl md:rounded-[var(--radius-2)]">
        {saveStatus === 'success' && (
          <div className="absolute right-14 top-3 z-10 md:right-16">
            <span className="animate-in fade-in rounded-md bg-[var(--ok)]/10 px-3 py-1.5 text-xs text-[var(--ok)]">{t('saveStatus.success')}</span>
          </div>
        )}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 touch-manipulation p-0 text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {body}
      </div>

      {loginModal}
    </div>
  );
}

export default Settings;
