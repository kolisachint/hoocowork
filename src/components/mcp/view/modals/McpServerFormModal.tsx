import { FolderOpen, Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../../../lib/utils';
import {
  MCP_PROVIDER_NAMES,
  MCP_SUPPORTED_SCOPES,
  MCP_SUPPORTED_TRANSPORTS,
  MCP_SUPPORTS_WORKING_DIRECTORY,
} from '../../constants';
import { useMcpServerForm } from '../../hooks/useMcpServerForm';
import type {
  McpFormMode,
  McpFormState,
  McpProject,
  McpProvider,
  McpScope,
  McpTransport,
  ProviderMcpServer,
} from '../../types';

type McpServerFormModalProps = {
  provider: McpProvider;
  mode?: McpFormMode;
  isOpen: boolean;
  editingServer: ProviderMcpServer | null;
  currentProjects: McpProject[];
  title?: string;
  description?: string;
  submitLabel?: string;
  supportedScopes?: McpScope[];
  supportedTransports?: McpTransport[];
  onClose: () => void;
  onSubmit: (formData: McpFormState, editingServer: ProviderMcpServer | null) => Promise<void>;
};

const getScopeLabel = (scope: McpScope, mode: McpFormMode): string => {
  if (scope === 'user') {
    return mode === 'global' ? 'User (All Providers)' : 'User (Global)';
  }

  if (scope === 'local') {
    return 'Claude Local';
  }

  return mode === 'global' ? 'Project (All Providers)' : 'Project';
};

const getScopeDescription = (scope: McpScope, mode: McpFormMode): string => {
  if (scope === 'user') {
    return mode === 'global'
      ? 'Writes to each provider user config and is available across projects on this machine'
      : 'Available across all projects on your machine';
  }

  if (scope === 'local') {
    return 'Stored in Claude user settings for the selected project';
  }

  return mode === 'global'
    ? 'Writes to the selected project workspace for every provider'
    : 'Stored in the selected project workspace';
};

export default function McpServerFormModal({
  provider,
  mode = 'provider',
  isOpen,
  editingServer,
  currentProjects,
  title,
  description,
  submitLabel,
  supportedScopes,
  supportedTransports,
  onClose,
  onSubmit,
}: McpServerFormModalProps) {
  const { t } = useTranslation('settings');
  const isGlobalMode = mode === 'global';
  const availableScopes = supportedScopes ?? MCP_SUPPORTED_SCOPES[provider];
  const availableTransports = supportedTransports ?? MCP_SUPPORTED_TRANSPORTS[provider];
  const {
    formData,
    multilineText,
    projectOptions,
    isEditing,
    isSubmitting,
    jsonValidationError,
    canSubmit,
    updateForm,
    updateScope,
    updateTransport,
    updateJsonInput,
    updateMultilineText,
    handleSubmit,
  } = useMcpServerForm({
    provider,
    isOpen,
    editingServer,
    currentProjects,
    supportedScopes: availableScopes,
    supportedTransports: availableTransports,
    unsupportedTransportMessage: isGlobalMode
      ? (transport) => `Add MCP Server supports only stdio and http across all providers, not ${transport}.`
      : undefined,
    onSubmit,
  });

  if (!isOpen) {
    return null;
  }

  const providerName = MCP_PROVIDER_NAMES[provider];
  const modalTitle = title ?? (isEditing ? t('mcpForm.title.edit') : t('mcpForm.title.add'));
  const addButtonLabel = submitLabel ?? `${t('mcpForm.actions.addServer')} to ${providerName}`;
  const showProjectSelector = formData.scope !== 'user';
  const supportsHttpHeaders = formData.transport === 'http' || formData.transport === 'sse';
  const supportsWorkingDirectory = !isGlobalMode && MCP_SUPPORTS_WORKING_DIRECTORY[provider];
  const showCodexOnlyFields = provider === 'codex' && !isGlobalMode;

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-shell w-full max-w-2xl">
        <div className="modal-head">
          <div className="modal-head-title">
            <h3>{modalTitle}</h3>
          </div>
          <button type="button" className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body mcp-form">
          {description && (
            <div className="rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper-2)] px-[var(--s-3)] py-[var(--s-2)] text-[var(--fs-sm)] text-[var(--ink-3)]">
              {description}
            </div>
          )}

          {!isEditing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateForm('importMode', 'form')}
                className={`btn btn-sm ${formData.importMode === 'form' ? 'btn-solid' : 'btn-outline'}`}
              >
                {t('mcpForm.importMode.form')}
              </button>
              <button
                type="button"
                onClick={() => updateForm('importMode', 'json')}
                className={`btn btn-sm ${formData.importMode === 'json' ? 'btn-solid' : 'btn-outline'}`}
              >
                {t('mcpForm.importMode.json')}
              </button>
            </div>
          )}

          {isEditing && (
            <div className="field rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper-2)] p-[var(--s-3)]">
              <span className="field-label">{t('mcpForm.scope.label')}</span>
              <div className="flex items-center gap-2 text-[var(--fs-sm)] text-[var(--ink)]">
                {formData.scope === 'user' ? <Globe className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
                <span>{getScopeLabel(formData.scope, mode)}</span>
                {formData.workspacePath && (
                  <span className="truncate text-[var(--fs-xs)] text-[var(--ink-3)]">— {formData.workspacePath}</span>
                )}
              </div>
              <p className="field-hint">{t('mcpForm.scope.cannotChange')}</p>
            </div>
          )}

          {!isEditing && (
            <div className="flex flex-col gap-[var(--s-4)]">
              <div className="field">
                <span className="field-label">{t('mcpForm.scope.label')} *</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {availableScopes.map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => updateScope(scope)}
                      className={`btn btn-sm justify-center ${formData.scope === scope ? 'btn-solid' : 'btn-outline'}`}
                    >
                      {scope === 'user' ? <Globe className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
                      <span>{getScopeLabel(scope, mode)}</span>
                    </button>
                  ))}
                </div>
                <p className="field-hint">{getScopeDescription(formData.scope, mode)}</p>
              </div>

              {showProjectSelector && (
                <div className="field">
                  <span className="field-label">{t('mcpForm.fields.selectProject')} *</span>
                  <select
                    value={formData.workspacePath}
                    onChange={(event) => updateForm('workspacePath', event.target.value)}
                    className="select"
                    required
                  >
                    <option value="">{t('mcpForm.fields.selectProject')}</option>
                    {projectOptions.map((project) => (
                      <option key={project.value} value={project.value}>
                        {project.label}
                      </option>
                    ))}
                  </select>
                  {formData.workspacePath && (
                    <p className="field-hint truncate">
                      {t('mcpForm.projectPath', { path: formData.workspacePath })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-[var(--s-3)] md:grid-cols-2">
            <div className={cn('field', formData.importMode === 'json' && 'md:col-span-2')}>
              <span className="field-label">{t('mcpForm.fields.serverName')} *</span>
              <input
                className="input"
                value={formData.name}
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder={t('mcpForm.placeholders.serverName')}
                required
              />
            </div>

            {formData.importMode === 'form' && (
              <div className="field">
                <span className="field-label">{t('mcpForm.fields.transportType')} *</span>
                <select
                  value={formData.transport}
                  onChange={(event) => updateTransport(event.target.value as McpFormState['transport'])}
                  className="select"
                >
                  {availableTransports.map((transport) => (
                    <option key={transport} value={transport}>
                      {transport === 'sse' ? 'SSE' : transport.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {formData.importMode === 'json' && (
            <div className="field">
              <span className="field-label">{t('mcpForm.fields.jsonConfig')} *</span>
              <textarea
                value={formData.jsonInput}
                onChange={(event) => updateJsonInput(event.target.value)}
                className={cn('textarea', jsonValidationError && 'border-[var(--err)]')}
                rows={8}
                placeholder={'{\n  "type": "stdio",\n  "command": "npx",\n  "args": ["@upstash/context7-mcp"]\n}'}
                required
              />
              {jsonValidationError && (
                <p className="text-[var(--fs-xs)] text-[var(--err)]">{jsonValidationError}</p>
              )}
              <p className="field-hint">
                {t('mcpForm.validation.jsonHelp')}
                <br />
                - stdio: {`{"type":"stdio","command":"npx","args":["@upstash/context7-mcp"]}`}
                <br />
                - http/sse: {`{"type":"http","url":"https://api.example.com/mcp"}`}
              </p>
            </div>
          )}

          {formData.importMode === 'form' && formData.transport === 'stdio' && (
            <div className="flex flex-col gap-[var(--s-4)]">
              <div className="field">
                <span className="field-label">{t('mcpForm.fields.command')} *</span>
                <input
                  className="input"
                  value={formData.command}
                  onChange={(event) => updateForm('command', event.target.value)}
                  placeholder="npx @my-org/mcp-server"
                  required
                />
              </div>

              <div className="field">
                <span className="field-label">{t('mcpForm.fields.arguments')}</span>
                <textarea
                  value={multilineText.args}
                  onChange={(event) => updateMultilineText('args', event.target.value)}
                  className="textarea"
                  rows={3}
                  placeholder="--port&#10;3000"
                />
              </div>

              {supportsWorkingDirectory && (
                <div className="field">
                  <span className="field-label">Working Directory</span>
                  <input
                    className="input"
                    value={formData.cwd}
                    onChange={(event) => updateForm('cwd', event.target.value)}
                    placeholder="."
                  />
                </div>
              )}
            </div>
          )}

          {formData.importMode === 'form' && formData.transport !== 'stdio' && (
            <div className="field">
              <span className="field-label">{t('mcpForm.fields.url')} *</span>
              <input
                className="input"
                value={formData.url}
                onChange={(event) => updateForm('url', event.target.value)}
                placeholder="https://api.example.com/mcp"
                type="url"
                required
              />
            </div>
          )}

          {formData.importMode === 'form' && (
            <div className="field">
              <span className="field-label">{t('mcpForm.fields.envVars')}</span>
              <textarea
                value={multilineText.env}
                onChange={(event) => updateMultilineText('env', event.target.value)}
                className="textarea"
                rows={3}
                placeholder="API_KEY=your-key&#10;DEBUG=true"
              />
            </div>
          )}

          {formData.importMode === 'form' && supportsHttpHeaders && (
            <div className="field">
              <span className="field-label">{t('mcpForm.fields.headers')}</span>
              <textarea
                value={multilineText.headers}
                onChange={(event) => updateMultilineText('headers', event.target.value)}
                className="textarea"
                rows={3}
                placeholder="Authorization=Bearer token&#10;X-API-Key=your-key"
              />
            </div>
          )}

          {showCodexOnlyFields && formData.importMode === 'form' && formData.transport === 'stdio' && (
            <div className="field">
              <span className="field-label">Environment Variable Names</span>
              <textarea
                value={multilineText.envVars}
                onChange={(event) => updateMultilineText('envVars', event.target.value)}
                className="textarea"
                rows={3}
                placeholder="GITHUB_TOKEN&#10;API_KEY"
              />
            </div>
          )}

          {showCodexOnlyFields && formData.importMode === 'form' && formData.transport === 'http' && (
            <div className="field">
              <span className="field-label">Bearer Token Environment Variable</span>
              <input
                className="input"
                value={formData.bearerTokenEnvVar}
                onChange={(event) => updateForm('bearerTokenEnvVar', event.target.value)}
                placeholder="MCP_TOKEN"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-[var(--s-3)]">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              {t('mcpForm.actions.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting
                ? t('mcpForm.actions.saving')
                : isEditing
                ? t('mcpForm.actions.updateServer')
                : addButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
