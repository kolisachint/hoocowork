import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { useServerPlatform } from "../../../../hooks/useServerPlatform";
import SessionProviderLogo from "../../../llm-logo-provider/SessionProviderLogo";
import { useHoocodeModels } from "../../hooks/useHoocodeModels";
import { useOpenCodeModels } from "../../hooks/useOpenCodeModels";
import {
  CLAUDE_MODELS,
  CURSOR_MODELS,
  CODEX_MODELS,
  GEMINI_MODELS,
  OPENCODE_MODELS,
  HOOCODE_MODELS,
  PROVIDERS,
} from "../../../../../shared/modelConstants";
import type { ProjectSession, LLMProvider } from "../../../../types/app";
import { NextTaskBanner } from "../../../task-master";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Card,
} from "../../../../shared/view/ui";

const MOD_KEY =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

type ProviderSelectionEmptyStateProps = {
  selectedSession: ProjectSession | null;
  currentSessionId: string | null;
  provider: LLMProvider;
  setProvider: (next: LLMProvider) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  claudeModel: string;
  setClaudeModel: (model: string) => void;
  cursorModel: string;
  setCursorModel: (model: string) => void;
  codexModel: string;
  setCodexModel: (model: string) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  hoocodeModel: string;
  setHoocodeModel: (model: string) => void;
  openCodeModel: string;
  setOpenCodeModel: (model: string) => void;
  tasksEnabled: boolean;
  isTaskMasterInstalled: boolean | null;
  onShowAllTasks?: (() => void) | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

type ProviderGroup = {
  id: LLMProvider;
  name: string;
  models: { value: string; label: string }[];
};

const PROVIDER_GROUPS: ProviderGroup[] = PROVIDERS.map((p) => ({
  id: p.id as LLMProvider,
  name: p.name,
  models: p.models.OPTIONS,
}));

function getModelConfig(p: LLMProvider) {
  if (p === "claude") return CLAUDE_MODELS;
  if (p === "codex") return CODEX_MODELS;
  if (p === "gemini") return GEMINI_MODELS;
  if (p === "hoocode") return HOOCODE_MODELS;
  if (p === "opencode") return OPENCODE_MODELS;
  return CURSOR_MODELS;
}

function getCurrentModel(
  p: LLMProvider,
  c: string,
  cu: string,
  co: string,
  g: string,
  hoocode: string,
  oc: string,
) {
  if (p === "claude") return c;
  if (p === "codex") return co;
  if (p === "gemini") return g;
  if (p === "hoocode") return hoocode;
  if (p === "opencode") return oc;
  return cu;
}

function getProviderDisplayName(p: LLMProvider) {
  if (p === "claude") return "Claude";
  if (p === "cursor") return "Cursor";
  if (p === "codex") return "Codex";
  if (p === "hoocode") return "Hoocode";
  if (p === "opencode") return "OpenCode";
  return "Gemini";
}

export default function ProviderSelectionEmptyState({
  selectedSession,
  currentSessionId,
  provider,
  setProvider,
  textareaRef,
  claudeModel,
  setClaudeModel,
  cursorModel,
  setCursorModel,
  codexModel,
  setCodexModel,
  geminiModel,
  setGeminiModel,
  hoocodeModel,
  setHoocodeModel,
  openCodeModel,
  setOpenCodeModel,
  tasksEnabled,
  isTaskMasterInstalled,
  onShowAllTasks,
  setInput,
}: ProviderSelectionEmptyStateProps) {
  const { t } = useTranslation("chat");
  const { isWindowsServer } = useServerPlatform();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Lazy-load Hoocode's full model catalog (~197 entries) once the picker opens.
  // The static HOOCODE_MODELS list is only used as a fallback while loading or if
  // `hoocode --list-models` fails (Hoocode not installed, etc.).
  const { models: hoocodeDynamicModels, loading: hoocodeLoading, error: hoocodeError, installed: hoocodeInstalled, refresh: refreshHoocode } =
    useHoocodeModels({ enabled: dialogOpen });

  // Same lazy-load pattern as Hoocode: only fetch the OpenCode catalog (~186
  // entries) once the picker opens, fall back to the static OPENCODE_MODELS
  // list while loading or if the binary isn't installed.
  const { models: openCodeDynamicModels, installed: openCodeInstalled } =
    useOpenCodeModels({ enabled: dialogOpen });

  const visibleProviderGroups = useMemo(() => {
    let base = isWindowsServer ? PROVIDER_GROUPS.filter((p) => p.id !== "cursor") : PROVIDER_GROUPS;

    if (hoocodeInstalled && hoocodeDynamicModels.length > 0) {
      // Replace the static Hoocode group with the live catalog. Keep "Auto" first
      // because the server special-cases it (omits --model so Hoocode uses its default).
      const dynamicHoocodeModels = [
        { value: "auto", label: "Auto (Hoocode default)" },
        ...hoocodeDynamicModels.map((m) => ({ value: m.value, label: m.label })),
      ];
      base = base.map((group) =>
        group.id === "hoocode" ? { ...group, models: dynamicHoocodeModels } : group,
      );
    }

    if (openCodeInstalled && openCodeDynamicModels.length > 0) {
      // Same Auto-first treatment for OpenCode — server omits --model when
      // value is "auto" so the binary uses its configured default.
      const dynamicOpenCodeModels = [
        { value: "auto", label: "Auto (OpenCode default)" },
        ...openCodeDynamicModels.map((m) => ({ value: m.value, label: m.label })),
      ];
      base = base.map((group) =>
        group.id === "opencode" ? { ...group, models: dynamicOpenCodeModels } : group,
      );
    }

    return base;
  }, [isWindowsServer, hoocodeDynamicModels, hoocodeInstalled, openCodeDynamicModels, openCodeInstalled]);

  useEffect(() => {
    if (isWindowsServer && provider === "cursor") {
      setProvider("claude");
      localStorage.setItem("selected-provider", "claude");
    }
  }, [isWindowsServer, provider, setProvider]);

  const nextTaskPrompt = t("tasks.nextTaskPrompt", {
    defaultValue: "Start the next task",
  });

  const currentModel = getCurrentModel(
    provider,
    claudeModel,
    cursorModel,
    codexModel,
    geminiModel,
    hoocodeModel,
    openCodeModel,
  );

  const currentModelLabel = useMemo(() => {
    const config = getModelConfig(provider);
    const found = config.OPTIONS.find(
      (o: { value: string; label: string }) => o.value === currentModel,
    );
    return found?.label || currentModel;
  }, [provider, currentModel]);

  const setModelForProvider = useCallback(
    (providerId: LLMProvider, modelValue: string) => {
      if (providerId === "claude") {
        setClaudeModel(modelValue);
        localStorage.setItem("claude-model", modelValue);
      } else if (providerId === "codex") {
        setCodexModel(modelValue);
        localStorage.setItem("codex-model", modelValue);
      } else if (providerId === "gemini") {
        setGeminiModel(modelValue);
        localStorage.setItem("gemini-model", modelValue);
      } else if (providerId === "hoocode") {
        setHoocodeModel(modelValue);
        localStorage.setItem("hoocode-model", modelValue);
      } else if (providerId === "opencode") {
        setOpenCodeModel(modelValue);
        localStorage.setItem("opencode-model", modelValue);
      } else {
        setCursorModel(modelValue);
        localStorage.setItem("cursor-model", modelValue);
      }
    },
    [setClaudeModel, setCursorModel, setCodexModel, setGeminiModel, setHoocodeModel, setOpenCodeModel],
  );

  const handleModelSelect = useCallback(
    (providerId: LLMProvider, modelValue: string) => {
      setProvider(providerId);
      localStorage.setItem("selected-provider", providerId);
      setModelForProvider(providerId, modelValue);
      setDialogOpen(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    },
    [setProvider, setModelForProvider, textareaRef],
  );

  if (!selectedSession && !currentSessionId) {
    return (
      <div className="cli-select" style={{ alignItems: 'center', justifyContent: 'center', maxWidth: 'none' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 'var(--s-5)', textAlign: 'center' }}>
            <div className="cli-eyebrow">{t("providerSelection.title")}</div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginTop: 'var(--s-1)' }}>
              {t("providerSelection.description")}
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Card
                className="group mx-auto max-w-xs cursor-pointer border-border/60 transition-all duration-150 hover:border-border hover:shadow-md active:scale-[0.99]"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-2 p-3">
                  <SessionProviderLogo
                    provider={provider}
                    className="h-5 w-5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-foreground">
                        {getProviderDisplayName(provider)}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="truncate text-xs text-foreground">
                        {currentModelLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {t("providerSelection.clickToChange", {
                        defaultValue: "Click to change model",
                      })}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
                </div>
              </Card>
            </DialogTrigger>

            <DialogContent className="max-w-md overflow-hidden p-0">
              <DialogTitle>Model Selector</DialogTitle>
              <Command>
                <CommandInput
                  placeholder={t("providerSelection.searchModels", {
                    defaultValue: "Search models...",
                  })}
                />
                {(hoocodeLoading || hoocodeError) && (
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5 text-[11px] text-muted-foreground">
                    <span>
                      {hoocodeLoading
                        ? "Loading Hoocode catalog…"
                        : `Hoocode catalog: ${hoocodeError}. Showing fallback list.`}
                    </span>
                    {!hoocodeLoading && hoocodeError && (
                      <button
                        type="button"
                        onClick={() => void refreshHoocode()}
                        className="rounded border border-border/60 px-1.5 py-0.5 hover:bg-muted/40"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
                <CommandList className="max-h-[350px]">
                  <CommandEmpty>
                    {t("providerSelection.noModelsFound", {
                      defaultValue: "No models found.",
                    })}
                  </CommandEmpty>
                  {visibleProviderGroups.map((group, idx) => (
                    <CommandGroup
                      key={group.id}
                      className={
                        idx > 0
                          ? "border-t border-border/40 [&_[cmdk-group-heading]]:mt-1 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                          : "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                      }
                      heading={
                        <span className="flex items-center gap-1.5">
                          <SessionProviderLogo provider={group.id} className="h-3.5 w-3.5 shrink-0" />
                          {group.name}
                        </span>
                      }
                    >
                      {group.models.map((model) => {
                        const isSelected = provider === group.id && currentModel === model.value;
                        return (
                          <CommandItem
                            key={`${group.id}-${model.value}`}
                            value={`${group.name} ${model.label}`}
                            onSelect={() => handleModelSelect(group.id, model.value)}
                            className="ml-4 border-l border-border/40 pl-4"
                          >
                            <span className="flex-1 truncate">{model.label}</span>
                            {isSelected && (
                              <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </DialogContent>
          </Dialog>

          <p className="mt-4 text-center text-sm text-muted-foreground/70">
            {
              {
                claude: t("providerSelection.readyPrompt.claude", {
                  model: claudeModel,
                }),
                cursor: t("providerSelection.readyPrompt.cursor", {
                  model: cursorModel,
                }),
                codex: t("providerSelection.readyPrompt.codex", {
                  model: codexModel,
                }),
                gemini: t("providerSelection.readyPrompt.gemini", {
                  model: geminiModel,
                }),
                hoocode: t("providerSelection.readyPrompt.hoocode", {
                  model: hoocodeModel,
                  defaultValue: `Ready to chat with Hoocode (${hoocodeModel})`,
                }),
                opencode: t("providerSelection.readyPrompt.opencode", {
                  model: openCodeModel,
                  defaultValue: `Ready to chat with OpenCode (${openCodeModel})`,
                }),
              }[provider]
            }
          </p>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground/60">
            <Trans
              i18nKey="providerSelection.pressToSearch"
              values={{ shortcut: MOD_KEY === "⌘" ? "⌘K" : "Ctrl+K" }}
              components={{
                kbd: (
                  <kbd className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]" />
                ),
              }}
            />
          </p>

          {provider && tasksEnabled && isTaskMasterInstalled && (
            <div className="mt-5">
              <NextTaskBanner
                onStartTask={() => setInput(nextTaskPrompt)}
                onShowAllTasks={onShowAllTasks}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md px-6 text-center">
          <p className="mb-1.5 text-lg font-semibold text-foreground">
            {t("session.continue.title")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("session.continue.description")}
          </p>

          {tasksEnabled && isTaskMasterInstalled && (
            <div className="mt-5">
              <NextTaskBanner
                onStartTask={() => setInput(nextTaskPrompt)}
                onShowAllTasks={onShowAllTasks}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
