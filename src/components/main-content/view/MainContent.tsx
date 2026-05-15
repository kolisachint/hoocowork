import React, { useEffect } from 'react';

import ChatInterface from '../../chat/view/ChatInterface';
import FileTree from '../../file-tree/view/FileTree';
import StandaloneShell from '../../standalone-shell/view/StandaloneShell';
import GitPanel from '../../git-panel/view/GitPanel';
import PluginTabContent from '../../plugins/view/PluginTabContent';
import CliSelection from '../../cli-selection/CliSelection';
import Settings from '../../settings/view/Settings';
import { normalizeProjectForSettings } from '../../sidebar/utils/utils';
import type { MainContentProps } from '../types/types';
import { useTaskMaster } from '../../../contexts/TaskMasterContext';
import { usePaletteOpsRegister } from '../../../contexts/PaletteOpsContext';
import { useTasksSettings } from '../../../contexts/TasksSettingsContext';
import { useUiPreferences } from '../../../hooks/useUiPreferences';
import { useEditorSidebar } from '../../code-editor/hooks/useEditorSidebar';
import EditorSidebar from '../../code-editor/view/EditorSidebar';
import type { Project } from '../../../types/app';
import { TaskMasterPanel } from '../../task-master';

import MainContentHeader from './subcomponents/MainContentHeader';
import MainContentStateView from './subcomponents/MainContentStateView';
import ErrorBoundary from './ErrorBoundary';

type TaskMasterContextValue = {
  currentProject?: Project | null;
  setCurrentProject?: ((project: Project) => void) | null;
};

type TasksSettingsContextValue = {
  tasksEnabled: boolean;
  isTaskMasterInstalled: boolean | null;
  isTaskMasterReady: boolean | null;
};

function MainContent({
  selectedProject,
  selectedSession,
  projects,
  activeTab,
  setActiveTab,
  ws,
  sendMessage,
  latestMessage,
  isMobile,
  onMenuClick,
  isLoading,
  onInputFocusChange,
  onSessionActive,
  onSessionInactive,
  onSessionProcessing,
  onSessionNotProcessing,
  processingSessions,
  onReplaceTemporarySession,
  onNavigateToSession,
  onShowSettings,
  externalMessageUpdate,
  newSessionTrigger,
  onStartNewChat,
  onRefreshProjects,
}: MainContentProps) {
  const { preferences } = useUiPreferences();
  const { autoExpandTools, showRawParameters, showThinking, autoScrollToBottom, sendByCtrlEnter } = preferences;

  const { currentProject, setCurrentProject } = useTaskMaster() as TaskMasterContextValue;
  const { tasksEnabled, isTaskMasterInstalled } = useTasksSettings() as TasksSettingsContextValue;

  const shouldShowTasksTab = Boolean(tasksEnabled && isTaskMasterInstalled);

  const {
    editingFile,
    editorWidth,
    editorExpanded,
    resizeHandleRef,
    handleFileOpen,
    handleCloseEditor,
    handleToggleEditorExpand,
    handleResizeStart,
  } = useEditorSidebar({
    selectedProject,
    isMobile,
  });

  useEffect(() => {
    // Identify projects by DB `projectId`; the TaskMaster context uses the
    // same identifier to key its internal maps.
    const selectedProjectId = selectedProject?.projectId;
    const currentProjectId = currentProject?.projectId;

    if (selectedProject && selectedProjectId !== currentProjectId) {
      setCurrentProject?.(selectedProject);
    }
  }, [selectedProject, currentProject?.projectId, setCurrentProject]);

  useEffect(() => {
    if (!shouldShowTasksTab && activeTab === 'tasks') {
      setActiveTab('chat');
    }
  }, [shouldShowTasksTab, activeTab, setActiveTab]);

  usePaletteOpsRegister({
    openFile: (filePath: string) => {
      setActiveTab('files');
      handleFileOpen(filePath);
    },
  });

  if (isLoading) {
    return <MainContentStateView mode="loading" isMobile={isMobile} onMenuClick={onMenuClick} />;
  }

  if (!selectedProject) {
    return <MainContentStateView mode="empty" isMobile={isMobile} onMenuClick={onMenuClick} />;
  }

  return (
    <div className="flex h-full flex-col">
      <MainContentHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        shouldShowTasksTab={shouldShowTasksTab}
        isMobile={isMobile}
        onMenuClick={onMenuClick}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className={`flex min-h-0 min-w-[200px] flex-1 flex-col overflow-hidden ${editorExpanded ? 'hidden' : ''}`}>
          <div className={`h-full flex flex-col min-h-0 overflow-hidden ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
            <ErrorBoundary showDetails>
              <ChatInterface
                selectedProject={selectedProject}
                selectedSession={selectedSession}
                ws={ws}
                sendMessage={sendMessage}
                latestMessage={latestMessage}
                onFileOpen={handleFileOpen}
                onInputFocusChange={onInputFocusChange}
                onSessionActive={onSessionActive}
                onSessionInactive={onSessionInactive}
                onSessionProcessing={onSessionProcessing}
                onSessionNotProcessing={onSessionNotProcessing}
                processingSessions={processingSessions}
                onReplaceTemporarySession={onReplaceTemporarySession}
                onNavigateToSession={onNavigateToSession}
                onShowSettings={onShowSettings}
                autoExpandTools={autoExpandTools}
                showRawParameters={showRawParameters}
                showThinking={showThinking}
                autoScrollToBottom={autoScrollToBottom}
                sendByCtrlEnter={sendByCtrlEnter}
                externalMessageUpdate={externalMessageUpdate}
                newSessionTrigger={newSessionTrigger}
                onShowAllTasks={tasksEnabled ? () => setActiveTab('tasks') : null}
                onRefreshProjects={onRefreshProjects}
              />
            </ErrorBoundary>
          </div>

          {activeTab === 'files' && (
            <div className="files">
              <FileTree
                selectedProject={selectedProject}
                onFileOpen={handleFileOpen}
                isEditorOpen={!!editingFile}
                editingFilePath={editingFile?.path ?? null}
              />
            </div>
          )}

          {activeTab === 'shell' && (
            <div className="terminal">
              <ErrorBoundary showDetails>
                <StandaloneShell
                  project={selectedProject}
                  session={selectedSession}
                  showHeader={false}
                  isActive={activeTab === 'shell'}
                />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'git' && (
            <div className="h-full overflow-hidden">
              <GitPanel selectedProject={selectedProject} isMobile={isMobile} onFileOpen={handleFileOpen} />
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="h-full overflow-y-auto">
              <CliSelection
                onPick={(provider) => {
                  try {
                    localStorage.setItem('selected-provider', provider);
                    // Also set the default model so the chat UI is ready immediately,
                    // but only when no per-provider preference is already stored.
                    const setIfMissing = (key: string, value: string) => {
                      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
                    };
                    switch (provider) {
                      case 'claude':
                        break;
                      case 'cursor':
                        setIfMissing('cursor-model', 'gpt-5.3-codex');
                        break;
                      case 'codex':
                        setIfMissing('codex-model', 'gpt-5.4');
                        break;
                      case 'gemini':
                        setIfMissing('gemini-model', 'gemini-3.1-pro-preview');
                        break;
                      case 'hoocode':
                        setIfMissing('hoocode-model', 'auto');
                        break;
                      case 'opencode':
                        setIfMissing('opencode-model', 'auto');
                        break;
                      default:
                        break;
                    }
                  } catch {
                    // Silently ignore — localStorage may be unavailable
                  }

                  // Notify ChatInterface's provider state to pick up the new selection.
                  // The native `storage` event doesn't fire in the same window, so
                  // we emit a CustomEvent that `useChatProviderState` listens for.
                  try {
                    window.dispatchEvent(
                      new CustomEvent('provider-changed', { detail: { provider } }),
                    );
                  } catch {
                    // CustomEvent constructor unavailable (very old runtimes)
                  }

                  // If the user is still viewing a session bound to a different
                  // provider, start a fresh chat so the session-based provider
                  // sync doesn't clobber the new pick.
                  if (selectedSession?.__provider && selectedSession.__provider !== provider) {
                    onStartNewChat?.();
                  }

                  setActiveTab('chat');
                }}
                onSkip={() => setActiveTab('chat')}
              />
            </div>
          )}

          {shouldShowTasksTab && <TaskMasterPanel isVisible={activeTab === 'tasks'} />}

          {activeTab === 'settings' && (
            <div className="h-full min-h-0 overflow-hidden">
              <Settings
                isOpen
                onClose={() => setActiveTab('chat')}
                projects={(projects || (selectedProject ? [selectedProject] : [])).map(normalizeProjectForSettings)}
                variant="inline"
              />
            </div>
          )}

          <div className={`h-full overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden'}`} />

          {activeTab.startsWith('plugin:') && (
            <div className="h-full overflow-hidden">
              <PluginTabContent
                pluginName={activeTab.replace('plugin:', '')}
                selectedProject={selectedProject}
                selectedSession={selectedSession}
              />
            </div>
          )}
        </div>

        <EditorSidebar
          editingFile={editingFile}
          isMobile={isMobile}
          editorExpanded={editorExpanded}
          editorWidth={editorWidth}
          resizeHandleRef={resizeHandleRef}
          onResizeStart={handleResizeStart}
          onCloseEditor={handleCloseEditor}
          onToggleEditorExpand={handleToggleEditorExpand}
          projectPath={selectedProject.path}
        />
      </div>
    </div>
  );
}

export default React.memo(MainContent);
