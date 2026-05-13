import { useTranslation } from 'react-i18next';
import type {
  ChangeEvent,
  ClipboardEvent,
  Dispatch,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  SetStateAction,
  TouchEvent,
} from 'react';
import { PaperclipIcon, XIcon, ArrowDownIcon } from 'lucide-react';

import type { PendingPermissionRequest, PermissionMode, Provider } from '../../types/types';
import {
  PromptInput,
  PromptInputHeader,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from '../../../../shared/view/ui';

import CommandMenu from './CommandMenu';
import ClaudeStatus from './ClaudeStatus';
import ImageAttachment from './ImageAttachment';
import PermissionRequestsBanner from './PermissionRequestsBanner';
import ThinkingModeSelector from './ThinkingModeSelector';
import TokenUsagePie from './TokenUsagePie';

interface MentionableFile {
  name: string;
  path: string;
}

interface SlashCommand {
  name: string;
  description?: string;
  namespace?: string;
  path?: string;
  type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ChatComposerProps {
  pendingPermissionRequests: PendingPermissionRequest[];
  handlePermissionDecision: (
    requestIds: string | string[],
    decision: { allow?: boolean; message?: string; rememberEntry?: string | null; updatedInput?: unknown },
  ) => void;
  handleGrantToolPermission: (suggestion: { entry: string; toolName: string }) => { success: boolean };
  claudeStatus: { text: string; tokens: number; can_interrupt: boolean } | null;
  isLoading: boolean;
  onAbortSession: () => void;
  provider: Provider | string;
  permissionMode: PermissionMode | string;
  onModeSwitch: () => void;
  thinkingMode: string;
  setThinkingMode: Dispatch<SetStateAction<string>>;
  tokenBudget: { used?: number; total?: number } | null;
  slashCommandsCount: number;
  onToggleCommandMenu: () => void;
  hasInput: boolean;
  onClearInput: () => void;
  isUserScrolledUp: boolean;
  hasMessages: boolean;
  onScrollToBottom: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => void;
  isDragActive: boolean;
  attachedImages: File[];
  onRemoveImage: (index: number) => void;
  uploadingImages: Map<string, number>;
  imageErrors: Map<string, string>;
  showFileDropdown: boolean;
  filteredFiles: MentionableFile[];
  selectedFileIndex: number;
  onSelectFile: (file: MentionableFile) => void;
  filteredCommands: SlashCommand[];
  selectedCommandIndex: number;
  onCommandSelect: (command: SlashCommand, index: number, isHover: boolean) => void;
  onCloseCommandMenu: () => void;
  isCommandMenuOpen: boolean;
  frequentCommands: SlashCommand[];
  getRootProps: (...args: unknown[]) => Record<string, unknown>;
  getInputProps: (...args: unknown[]) => Record<string, unknown>;
  openImagePicker: () => void;
  inputHighlightRef: RefObject<HTMLDivElement>;
  renderInputWithMentions: (text: string) => ReactNode;
  textareaRef: RefObject<HTMLTextAreaElement>;
  input: string;
  onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onTextareaClick: (event: MouseEvent<HTMLTextAreaElement>) => void;
  onTextareaKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextareaPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onTextareaScrollSync: (target: HTMLTextAreaElement) => void;
  onTextareaInput: (event: FormEvent<HTMLTextAreaElement>) => void;
  onInputFocusChange?: (focused: boolean) => void;
  placeholder: string;
  isTextareaExpanded: boolean;
  sendByCtrlEnter?: boolean;
  activeModel: string;
  modelOptions: { value: string; label: string }[];
  onModelChange: (value: string) => void;
}

export default function ChatComposer({
  pendingPermissionRequests,
  handlePermissionDecision,
  handleGrantToolPermission,
  claudeStatus,
  isLoading,
  onAbortSession,
  provider,
  permissionMode,
  onModeSwitch,
  thinkingMode,
  setThinkingMode,
  tokenBudget,
  slashCommandsCount,
  onToggleCommandMenu,
  hasInput,
  onClearInput,
  isUserScrolledUp,
  hasMessages,
  onScrollToBottom,
  onSubmit,
  isDragActive,
  attachedImages,
  onRemoveImage,
  uploadingImages,
  imageErrors,
  showFileDropdown,
  filteredFiles,
  selectedFileIndex,
  onSelectFile,
  filteredCommands,
  selectedCommandIndex,
  onCommandSelect,
  onCloseCommandMenu,
  isCommandMenuOpen,
  frequentCommands,
  getRootProps,
  getInputProps,
  openImagePicker,
  inputHighlightRef,
  renderInputWithMentions,
  textareaRef,
  input,
  onInputChange,
  onTextareaClick,
  onTextareaKeyDown,
  onTextareaPaste,
  onTextareaScrollSync,
  onTextareaInput,
  onInputFocusChange,
  placeholder,
  isTextareaExpanded,
  sendByCtrlEnter,
  activeModel,
  modelOptions,
  onModelChange,
}: ChatComposerProps) {
  const { t } = useTranslation('chat');
  const textareaRect = textareaRef.current?.getBoundingClientRect();
  const commandMenuPosition = {
    top: textareaRect ? Math.max(16, textareaRect.top - 316) : 0,
    left: textareaRect ? textareaRect.left : 16,
    bottom: textareaRect ? window.innerHeight - textareaRect.top + 8 : 90,
  };

  // Detect if the AskUserQuestion interactive panel is active
  const hasQuestionPanel = pendingPermissionRequests.some(
    (r) => r.toolName === 'AskUserQuestion'
  );

  // Hide the thinking/status bar while any permission request is pending
  const hasPendingPermissions = pendingPermissionRequests.length > 0;

  return (
    <div className="composer">
      {!hasPendingPermissions && (
        <ClaudeStatus
          status={claudeStatus}
          isLoading={isLoading}
          onAbort={onAbortSession}
          provider={provider}
        />
      )}

      {pendingPermissionRequests.length > 0 && (
        <div className="mb-3 w-full">
          <PermissionRequestsBanner
            pendingPermissionRequests={pendingPermissionRequests}
            handlePermissionDecision={handlePermissionDecision}
            handleGrantToolPermission={handleGrantToolPermission}
          />
        </div>
      )}

      {!hasQuestionPanel && <div className="relative w-full">
        {isUserScrolledUp && hasMessages && (
          <div className="absolute -top-10 left-0 right-0 z-10 flex justify-center">
            <button
              type="button"
              onClick={onScrollToBottom}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-foreground"
              title={t('input.scrollToBottom', { defaultValue: 'Scroll to bottom' })}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        {showFileDropdown && filteredFiles.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-md">
            {filteredFiles.map((file, index) => (
              <div
                key={file.path}
                className={`cursor-pointer touch-manipulation border-b border-border/30 px-4 py-3 last:border-b-0 ${
                  index === selectedFileIndex
                    ? 'bg-primary/8 text-primary'
                    : 'text-foreground hover:bg-accent/50'
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectFile(file);
                }}
              >
                <div className="text-sm font-medium">{file.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{file.path}</div>
              </div>
            ))}
          </div>
        )}

        <CommandMenu
          commands={filteredCommands}
          selectedIndex={selectedCommandIndex}
          onSelect={onCommandSelect}
          onClose={onCloseCommandMenu}
          position={commandMenuPosition}
          isOpen={isCommandMenuOpen}
          frequentCommands={frequentCommands}
        />

        <PromptInput
          onSubmit={onSubmit as (event: FormEvent<HTMLFormElement>) => void}
          status={isLoading ? 'streaming' : 'ready'}
          className={isTextareaExpanded ? 'chat-input-expanded' : ''}
          {...getRootProps()}
        >
          {isDragActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[var(--radius-2)] border border-dashed border-[var(--accent)] bg-[var(--accent-soft)]">
              <div className="rounded-[var(--radius-1)] border border-[var(--line)] bg-[var(--paper)] p-3">
                <p className="text-sm font-medium text-[var(--ink)]">Drop images here</p>
              </div>
            </div>
          )}

          {attachedImages.length > 0 && (
            <PromptInputHeader>
              <div className="flex flex-wrap gap-2">
                {attachedImages.map((file, index) => (
                  <ImageAttachment
                    key={index}
                    file={file}
                    onRemove={() => onRemoveImage(index)}
                    uploadProgress={uploadingImages.get(file.name)}
                    error={imageErrors.get(file.name)}
                  />
                ))}
              </div>
            </PromptInputHeader>
          )}

          <input {...getInputProps()} />

          <PromptInputTools>
            <PromptInputButton
              tooltip={{ content: t('input.attachImages') }}
              onClick={openImagePicker}
            >
              <PaperclipIcon size={14} />
            </PromptInputButton>

            <PromptInputButton
              tooltip={{ content: t('input.mentionFile', { defaultValue: 'Mention file' }) }}
              onClick={() => {
                const ta = textareaRef.current;
                if (!ta) return;
                const start = ta.selectionStart ?? input.length;
                const end = ta.selectionEnd ?? input.length;
                const prefix = input.slice(0, start);
                const suffix = input.slice(end);
                const needsSpace = start > 0 && !/\s$/.test(prefix);
                const insertion = `${needsSpace ? ' ' : ''}@`;
                const nextValue = `${prefix}${insertion}${suffix}`;
                const syntheticEvent = {
                  target: { ...ta, value: nextValue },
                  currentTarget: { ...ta, value: nextValue },
                } as unknown as ChangeEvent<HTMLTextAreaElement>;
                onInputChange(syntheticEvent);
                requestAnimationFrame(() => {
                  ta.focus();
                  const caret = prefix.length + insertion.length;
                  try { ta.setSelectionRange(caret, caret); } catch { /* ignore */ }
                });
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>@</span>
            </PromptInputButton>

            <PromptInputButton
              tooltip={{ content: t('input.showAllCommands') }}
              onClick={onToggleCommandMenu}
              className="relative"
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>/</span>
              {slashCommandsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-[var(--accent-ink)]">
                  {slashCommandsCount}
                </span>
              )}
            </PromptInputButton>

            <span className="composer-divider" />

            <select
              className="composer-model"
              value={activeModel}
              onChange={(event) => onModelChange(event.target.value)}
              title={t('header.modelLabel', { defaultValue: 'Active model' })}
            >
              {modelOptions.length === 0 || !modelOptions.find((option) => option.value === activeModel) ? (
                <option value={activeModel}>{activeModel}</option>
              ) : null}
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onModeSwitch}
              className="composer-mode composer-model"
              title={t('input.clickToChangeMode')}
            >
              <span className="composer-mode-dot" data-mode={permissionMode} />
              <span className="hidden whitespace-nowrap sm:inline">
                {t(`codex.modes.${permissionMode}`, { defaultValue: permissionMode })}
              </span>
            </button>

            {provider === 'claude' && (
              <ThinkingModeSelector selectedMode={thinkingMode} onModeChange={setThinkingMode} onClose={() => {}} className="" />
            )}

            {hasInput && (
              <PromptInputButton
                tooltip={{ content: t('input.clearInput', { defaultValue: 'Clear input' }) }}
                onClick={onClearInput}
              >
                <XIcon />
              </PromptInputButton>
            )}

            <span className="composer-spacer" />

            <TokenUsagePie used={tokenBudget?.used || 0} total={tokenBudget?.total || parseInt(import.meta.env.VITE_CONTEXT_WINDOW) || 160000} />
          </PromptInputTools>

          <PromptInputBody>
            <div ref={inputHighlightRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--radius-2)]">
              <div className="chat-input-placeholder block w-full whitespace-pre-wrap break-words px-[var(--s-3)] py-[var(--s-3)] text-transparent">
                {renderInputWithMentions(input)}
              </div>
            </div>

            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onClick={onTextareaClick}
              onKeyDown={onTextareaKeyDown}
              onPaste={onTextareaPaste}
              onScroll={(event) => onTextareaScrollSync(event.target as HTMLTextAreaElement)}
              onFocus={() => onInputFocusChange?.(true)}
              onBlur={() => onInputFocusChange?.(false)}
              onInput={onTextareaInput}
              placeholder={placeholder}
              rows={3}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <span className="composer-hint">
              {sendByCtrlEnter ? t('input.hintText.ctrlEnter') : t('input.hintText.enter')}
            </span>
            <PromptInputSubmit
              disabled={!input.trim() || isLoading}
              label={t('input.send', { defaultValue: 'Send' })}
              stopLabel={t('input.stop', { defaultValue: 'Stop' })}
              onMouseDown={(event) => {
                event.preventDefault();
                onSubmit(event as unknown as MouseEvent<HTMLButtonElement>);
              }}
              onTouchStart={(event) => {
                event.preventDefault();
                onSubmit(event as unknown as TouchEvent<HTMLButtonElement>);
              }}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>}
    </div>
  );
}
