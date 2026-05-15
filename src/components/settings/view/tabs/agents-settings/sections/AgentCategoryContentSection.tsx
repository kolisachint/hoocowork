import type { AgentCategoryContentSectionProps } from '../types';
import type { McpProject } from '../../../../../mcp/types';

import AccountContent from './content/AccountContent';
import PermissionsContent from './content/PermissionsContent';
import ModelsContent from './content/ModelsContent';
import ToolsContent from './content/ToolsContent';

export default function AgentCategoryContentSection({
  selectedAgent,
  selectedCategory,
  agentContextById,
  claudePermissions,
  onClaudePermissionsChange,
  cursorPermissions,
  onCursorPermissionsChange,
  codexPermissionMode,
  onCodexPermissionModeChange,
  geminiPermissionMode,
  onGeminiPermissionModeChange,
  projects,
  onOpenMcpSettings,
}: AgentCategoryContentSectionProps & { onOpenMcpSettings: () => void }) {
  if (selectedCategory === 'tools') {
    return (
      <ToolsContent
        agent={selectedAgent}
        projects={projects.map<McpProject>((project) => ({
          projectId: project.name,
          displayName: project.displayName,
          fullPath: project.fullPath,
          path: project.path,
        }))}
        onOpenMcpSettings={onOpenMcpSettings}
      />
    );
  }

  if (selectedCategory === 'account') {
    return (
      <AccountContent
        agent={selectedAgent}
        authStatus={agentContextById[selectedAgent].authStatus}
        onLogin={agentContextById[selectedAgent].onLogin}
      />
    );
  }

  if (selectedCategory === 'permissions' && selectedAgent === 'claude') {
    return (
      <PermissionsContent
        agent="claude"
        skipPermissions={claudePermissions.skipPermissions}
        onSkipPermissionsChange={(value) => {
          onClaudePermissionsChange({ ...claudePermissions, skipPermissions: value });
        }}
        allowedTools={claudePermissions.allowedTools}
        onAllowedToolsChange={(value) => {
          onClaudePermissionsChange({ ...claudePermissions, allowedTools: value });
        }}
        disallowedTools={claudePermissions.disallowedTools}
        onDisallowedToolsChange={(value) => {
          onClaudePermissionsChange({ ...claudePermissions, disallowedTools: value });
        }}
      />
    );
  }

  if (selectedCategory === 'permissions' && selectedAgent === 'cursor') {
    return (
      <PermissionsContent
        agent="cursor"
        skipPermissions={cursorPermissions.skipPermissions}
        onSkipPermissionsChange={(value) => {
          onCursorPermissionsChange({ ...cursorPermissions, skipPermissions: value });
        }}
        allowedCommands={cursorPermissions.allowedCommands}
        onAllowedCommandsChange={(value) => {
          onCursorPermissionsChange({ ...cursorPermissions, allowedCommands: value });
        }}
        disallowedCommands={cursorPermissions.disallowedCommands}
        onDisallowedCommandsChange={(value) => {
          onCursorPermissionsChange({ ...cursorPermissions, disallowedCommands: value });
        }}
      />
    );
  }

  if (selectedCategory === 'permissions' && selectedAgent === 'codex') {
    return (
      <PermissionsContent
        agent="codex"
        permissionMode={codexPermissionMode}
        onPermissionModeChange={onCodexPermissionModeChange}
      />
    );
  }

  if (selectedCategory === 'permissions' && selectedAgent === 'gemini') {
    return (
      <PermissionsContent
        agent="gemini"
        permissionMode={geminiPermissionMode}
        onPermissionModeChange={onGeminiPermissionModeChange}
      />
    );
  }

  if (selectedCategory === 'models') {
    return <ModelsContent agent={selectedAgent} />;
  }

  return null;
}
