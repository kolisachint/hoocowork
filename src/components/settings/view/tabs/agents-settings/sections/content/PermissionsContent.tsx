import { useState } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../../../../../../lib/utils';
import type { CodexPermissionMode, GeminiPermissionMode } from '../../../../../types/types';

const COMMON_CLAUDE_TOOLS = [
  'Bash(git log:*)',
  'Bash(git diff:*)',
  'Bash(git status:*)',
  'Write',
  'Read',
  'Edit',
  'Glob',
  'Grep',
  'MultiEdit',
  'Task',
  'TodoWrite',
  'TodoRead',
  'WebFetch',
  'WebSearch',
];

const COMMON_CURSOR_COMMANDS = [
  'Shell(ls)',
  'Shell(mkdir)',
  'Shell(cd)',
  'Shell(cat)',
  'Shell(echo)',
  'Shell(git status)',
  'Shell(git diff)',
  'Shell(git log)',
  'Shell(npm install)',
  'Shell(npm run)',
  'Shell(python)',
  'Shell(node)',
];

const addUnique = (items: string[], value: string): string[] => {
  const normalizedValue = value.trim();
  if (!normalizedValue || items.includes(normalizedValue)) {
    return items;
  }

  return [...items, normalizedValue];
};

const removeValue = (items: string[], value: string): string[] => (
  items.filter((item) => item !== value)
);

type SkipPermissionsRowProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
};

function SkipPermissionsRow({ checked, onChange, label, description }: SkipPermissionsRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-hint text-[var(--warn)]">{description}</div>
      </div>
      <div className="settings-row-ctrl">
        <label className="toggle">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
      </div>
    </div>
  );
}

type ListEditorProps = {
  title: string;
  description: string;
  placeholder: string;
  emptyLabel: string;
  tone: 'ok' | 'err';
  items: string[];
  onItemsChange: (next: string[]) => void;
  quickAdd?: { label: string; values: string[] };
};

function ListEditor({
  title,
  description,
  placeholder,
  emptyLabel,
  tone,
  items,
  onItemsChange,
  quickAdd,
}: ListEditorProps) {
  const { t } = useTranslation('settings');
  const [draft, setDraft] = useState('');

  const handleAdd = (value: string) => {
    const next = addUnique(items, value);
    if (next.length === items.length) {
      return;
    }
    onItemsChange(next);
    setDraft('');
  };

  const toneClasses = tone === 'ok'
    ? 'border-[var(--ok)]/30 bg-[var(--ok-soft)] text-[var(--ok)]'
    : 'border-[var(--err)]/30 bg-[var(--err-soft)] text-[var(--err)]';
  const toneInk = tone === 'ok' ? 'text-[var(--ok)]' : 'text-[var(--err)]';

  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        <div className="settings-section-desc">{description}</div>
      </div>
      <div className="settings-section-body">
        <div className="settings-row">
          <div className="settings-row-text w-full">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input flex-1"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAdd(draft);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => handleAdd(draft)}
                disabled={!draft.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('permissions.actions.add')}</span>
              </button>
            </div>
            {quickAdd && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="settings-row-hint">{quickAdd.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {quickAdd.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => handleAdd(value)}
                      disabled={items.includes(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-col gap-1.5">
              {items.length === 0 ? (
                <div className="settings-row-hint">{emptyLabel}</div>
              ) : (
                items.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-[var(--radius-1)] border px-3 py-2',
                      toneClasses,
                    )}
                  >
                    <span className={cn('font-mono text-[var(--fs-sm)]', toneInk)}>{item}</span>
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => onItemsChange(removeValue(items, item))}
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ExamplesProps = {
  title: string;
  items: { code: string; description: string }[];
};

function ExamplesPanel({ title, items }: ExamplesProps) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
      </div>
      <div className="settings-section-body">
        <div className="settings-row">
          <div className="settings-row-text w-full">
            <ul className="flex flex-col gap-1.5 text-[var(--fs-sm)] text-[var(--ink-3)]">
              {items.map((item) => (
                <li key={item.code} className="flex flex-wrap items-center gap-2">
                  <code className="rounded-[var(--radius-1)] bg-[var(--paper-3)] px-1.5 py-0.5 font-mono text-[var(--fs-xs)] text-[var(--ink)]">
                    {item.code}
                  </code>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

type RadioModeOption<TValue extends string> = {
  value: TValue;
  title: string;
  description: string;
  tone: 'neutral' | 'ok' | 'warn';
  warningIcon?: boolean;
};

type RadioModeSectionProps<TValue extends string> = {
  name: string;
  title: string;
  description: string;
  value: TValue;
  onChange: (next: TValue) => void;
  options: RadioModeOption<TValue>[];
};

function RadioModeSection<TValue extends string>({
  name,
  title,
  description,
  value,
  onChange,
  options,
}: RadioModeSectionProps<TValue>) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <div className="settings-section-title">{title}</div>
        <div className="settings-section-desc">{description}</div>
      </div>
      <div className="settings-section-body">
        <div style={{ padding: 'var(--s-3)' }}>
          <div className="permissions-grid" role="radiogroup" aria-label={title}>
            {options.map((option) => {
              const isActive = value === option.value;
              const dotTone = option.tone === 'ok'
                ? 'dot-ok'
                : option.tone === 'warn'
                  ? 'dot-warn'
                  : 'dot-off';
              const descTone = option.tone === 'ok'
                ? 'text-[var(--ok)]'
                : option.tone === 'warn'
                  ? 'text-[var(--warn)]'
                  : '';
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  name={name}
                  onClick={() => onChange(option.value)}
                  className={cn('permission-mode-card', isActive && 'active')}
                >
                  <div className="permission-mode-card-head">
                    <span className={cn('status-dot', dotTone)} />
                    <span className="permission-mode-card-name">{option.title}</span>
                    {option.warningIcon && <AlertTriangle className="h-3.5 w-3.5 text-[var(--warn)]" />}
                  </div>
                  <div className={cn('permission-mode-card-desc', descTone)}>{option.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simplified tool toggles for design-matched UI
const SIMPLIFIED_TOOLS = [
  { key: 'Bash', label: 'Bash', desc: 'Run shell commands in your project' },
  { key: 'Edit', label: 'Edit', desc: 'Modify files in your project' },
  { key: 'Write', label: 'Write', desc: 'Create new files' },
  { key: 'Read', label: 'Read', desc: 'Read file contents' },
  { key: 'WebFetch', label: 'WebFetch', desc: 'Fetch URLs and render HTML' },
  { key: 'WebSearch', label: 'WebSearch', desc: 'Search the public web' },
] as const;

type ToolToggleRowProps = {
  tool: typeof SIMPLIFIED_TOOLS[number];
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToolToggleRow({ tool, checked, onChange }: ToolToggleRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-label">{tool.label}</div>
        <div className="settings-row-hint">{tool.desc}</div>
      </div>
      <div className="settings-row-ctrl">
        <label className="toggle">
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
      </div>
    </div>
  );
}

type ClaudePermissionsProps = {
  agent: 'claude';
  skipPermissions: boolean;
  onSkipPermissionsChange: (value: boolean) => void;
  allowedTools: string[];
  onAllowedToolsChange: (value: string[]) => void;
  disallowedTools: string[];
  onDisallowedToolsChange: (value: string[]) => void;
};

function ClaudePermissions({
  skipPermissions,
  onSkipPermissionsChange,
  allowedTools,
  onAllowedToolsChange,
  disallowedTools,
  onDisallowedToolsChange,
}: Omit<ClaudePermissionsProps, 'agent'>) {
  const { t } = useTranslation('settings');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper to check if a simplified tool is allowed
  const isToolAllowed = (toolKey: string) => allowedTools.includes(toolKey);

  // Toggle a simplified tool in allowedTools
  const toggleTool = (toolKey: string, checked: boolean) => {
    if (checked) {
      onAllowedToolsChange(addUnique(allowedTools, toolKey));
    } else {
      onAllowedToolsChange(removeValue(allowedTools, toolKey));
    }
  };

  // Revoke all approvals
  const handleRevokeAll = () => {
    onAllowedToolsChange([]);
    onDisallowedToolsChange([]);
    onSkipPermissionsChange(false);
  };

  return (
    <>
      {/* Tool permissions section - design style */}
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('permissions.toolPermissions.title')}</div>
          <div className="settings-section-desc">{t('permissions.toolPermissions.desc')}</div>
        </div>
        <div className="settings-section-body">
          {SIMPLIFIED_TOOLS.map((tool) => (
            <ToolToggleRow
              key={tool.key}
              tool={tool}
              checked={isToolAllowed(tool.key)}
              onChange={(checked) => toggleTool(tool.key, checked)}
            />
          ))}
        </div>
        {/* Panic button - design style */}
        <div className="settings-panic">
          <button type="button" className="btn btn-sm btn-danger" onClick={handleRevokeAll}>
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t('permissions.revokeAll')}</span>
          </button>
        </div>
      </div>

      {/* Skip permissions toggle */}
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('permissions.title')}</div>
        </div>
        <div className="settings-section-body">
          <SkipPermissionsRow
            checked={skipPermissions}
            onChange={onSkipPermissionsChange}
            label={t('permissions.skipPermissions.label')}
            description={t('permissions.skipPermissions.claudeDescription')}
          />
        </div>
      </div>

      {/* Advanced section */}
      <details className="settings-section" open={showAdvanced}>
        <summary
          className="settings-section-head cursor-pointer"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <div className="settings-section-title">{t('permissions.advanced.title')}</div>
          <div className="settings-section-desc">{t('permissions.advanced.desc')}</div>
        </summary>
        <div className="settings-section-body">
          <ListEditor
            title={t('permissions.allowedTools.title')}
            description={t('permissions.allowedTools.description')}
            placeholder={t('permissions.allowedTools.placeholder')}
            emptyLabel={t('permissions.allowedTools.empty')}
            tone="ok"
            items={allowedTools}
            onItemsChange={onAllowedToolsChange}
            quickAdd={{ label: t('permissions.allowedTools.quickAdd'), values: COMMON_CLAUDE_TOOLS }}
          />

          <ListEditor
            title={t('permissions.blockedTools.title')}
            description={t('permissions.blockedTools.description')}
            placeholder={t('permissions.blockedTools.placeholder')}
            emptyLabel={t('permissions.blockedTools.empty')}
            tone="err"
            items={disallowedTools}
            onItemsChange={onDisallowedToolsChange}
          />

          <ExamplesPanel
            title={t('permissions.toolExamples.title')}
            items={[
              { code: '"Bash(git log:*)"', description: t('permissions.toolExamples.bashGitLog') },
              { code: '"Bash(git diff:*)"', description: t('permissions.toolExamples.bashGitDiff') },
              { code: '"Write"', description: t('permissions.toolExamples.write') },
              { code: '"Bash(rm:*)"', description: t('permissions.toolExamples.bashRm') },
            ]}
          />
        </div>
      </details>
    </>
  );
}

type CursorPermissionsProps = {
  agent: 'cursor';
  skipPermissions: boolean;
  onSkipPermissionsChange: (value: boolean) => void;
  allowedCommands: string[];
  onAllowedCommandsChange: (value: string[]) => void;
  disallowedCommands: string[];
  onDisallowedCommandsChange: (value: string[]) => void;
};

function CursorPermissions({
  skipPermissions,
  onSkipPermissionsChange,
  allowedCommands,
  onAllowedCommandsChange,
  disallowedCommands,
  onDisallowedCommandsChange,
}: Omit<CursorPermissionsProps, 'agent'>) {
  const { t } = useTranslation('settings');

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title">{t('permissions.title')}</div>
        </div>
        <div className="settings-section-body">
          <SkipPermissionsRow
            checked={skipPermissions}
            onChange={onSkipPermissionsChange}
            label={t('permissions.skipPermissions.label')}
            description={t('permissions.skipPermissions.cursorDescription')}
          />
        </div>
      </div>

      <ListEditor
        title={t('permissions.allowedCommands.title')}
        description={t('permissions.allowedCommands.description')}
        placeholder={t('permissions.allowedCommands.placeholder')}
        emptyLabel={t('permissions.allowedCommands.empty')}
        tone="ok"
        items={allowedCommands}
        onItemsChange={onAllowedCommandsChange}
        quickAdd={{ label: t('permissions.allowedCommands.quickAdd'), values: COMMON_CURSOR_COMMANDS }}
      />

      <ListEditor
        title={t('permissions.blockedCommands.title')}
        description={t('permissions.blockedCommands.description')}
        placeholder={t('permissions.blockedCommands.placeholder')}
        emptyLabel={t('permissions.blockedCommands.empty')}
        tone="err"
        items={disallowedCommands}
        onItemsChange={onDisallowedCommandsChange}
      />

      <ExamplesPanel
        title={t('permissions.shellExamples.title')}
        items={[
          { code: '"Shell(ls)"', description: t('permissions.shellExamples.ls') },
          { code: '"Shell(git status)"', description: t('permissions.shellExamples.gitStatus') },
          { code: '"Shell(npm install)"', description: t('permissions.shellExamples.npmInstall') },
          { code: '"Shell(rm -rf)"', description: t('permissions.shellExamples.rmRf') },
        ]}
      />
    </>
  );
}

type CodexPermissionsProps = {
  agent: 'codex';
  permissionMode: CodexPermissionMode;
  onPermissionModeChange: (value: CodexPermissionMode) => void;
};

function CodexPermissions({ permissionMode, onPermissionModeChange }: Omit<CodexPermissionsProps, 'agent'>) {
  const { t } = useTranslation('settings');

  return (
    <>
      <RadioModeSection<CodexPermissionMode>
        name="codexPermissionMode"
        title={t('permissions.codex.permissionMode')}
        description={t('permissions.codex.description')}
        value={permissionMode}
        onChange={onPermissionModeChange}
        options={[
          {
            value: 'default',
            title: t('permissions.codex.modes.default.title'),
            description: t('permissions.codex.modes.default.description'),
            tone: 'neutral',
          },
          {
            value: 'acceptEdits',
            title: t('permissions.codex.modes.acceptEdits.title'),
            description: t('permissions.codex.modes.acceptEdits.description'),
            tone: 'ok',
          },
          {
            value: 'bypassPermissions',
            title: t('permissions.codex.modes.bypassPermissions.title'),
            description: t('permissions.codex.modes.bypassPermissions.description'),
            tone: 'warn',
            warningIcon: true,
          },
        ]}
      />

      <details className="text-[var(--fs-sm)]">
        <summary className="cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]">
          {t('permissions.codex.technicalDetails')}
        </summary>
        <div className="mt-2 flex flex-col gap-2 rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper-2)] p-3 text-[var(--fs-xs)] text-[var(--ink-3)]">
          <p><strong>{t('permissions.codex.modes.default.title')}:</strong> {t('permissions.codex.technicalInfo.default')}</p>
          <p><strong>{t('permissions.codex.modes.acceptEdits.title')}:</strong> {t('permissions.codex.technicalInfo.acceptEdits')}</p>
          <p><strong>{t('permissions.codex.modes.bypassPermissions.title')}:</strong> {t('permissions.codex.technicalInfo.bypassPermissions')}</p>
          <p className="opacity-75">{t('permissions.codex.technicalInfo.overrideNote')}</p>
        </div>
      </details>
    </>
  );
}

type GeminiPermissionsProps = {
  agent: 'gemini';
  permissionMode: GeminiPermissionMode;
  onPermissionModeChange: (value: GeminiPermissionMode) => void;
};

function GeminiPermissions({ permissionMode, onPermissionModeChange }: Omit<GeminiPermissionsProps, 'agent'>) {
  const { t } = useTranslation(['settings', 'chat']);

  return (
    <RadioModeSection<GeminiPermissionMode>
      name="geminiPermissionMode"
      title={t('gemini.permissionMode')}
      description={t('gemini.description')}
      value={permissionMode}
      onChange={onPermissionModeChange}
      options={[
        {
          value: 'default',
          title: t('gemini.modes.default.title'),
          description: t('gemini.modes.default.description'),
          tone: 'neutral',
        },
        {
          value: 'auto_edit',
          title: t('gemini.modes.autoEdit.title'),
          description: t('gemini.modes.autoEdit.description'),
          tone: 'ok',
        },
        {
          value: 'yolo',
          title: t('gemini.modes.yolo.title'),
          description: t('gemini.modes.yolo.description'),
          tone: 'warn',
          warningIcon: true,
        },
      ]}
    />
  );
}

type PermissionsContentProps = ClaudePermissionsProps | CursorPermissionsProps | CodexPermissionsProps | GeminiPermissionsProps;

export default function PermissionsContent(props: PermissionsContentProps) {
  if (props.agent === 'claude') {
    return <ClaudePermissions {...props} />;
  }

  if (props.agent === 'cursor') {
    return <CursorPermissions {...props} />;
  }

  if (props.agent === 'gemini') {
    return <GeminiPermissions {...props} />;
  }

  return <CodexPermissions {...props} />;
}
