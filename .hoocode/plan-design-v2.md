# Plan: Kolisachint Minimal Design v2 — implementation checkpoint

Tracks the rollout of the **UI Kit Review v2** design pass from the
`kolisachint-minimal-design-system` handoff bundle. Source bundle was
fetched via `claude.ai/design` and extracted at
`/tmp/design-files/kolisachint-minimal-design-system/` during the
2026-05-17 session.

## Goal

Apply the design-system v2 visuals to the existing hoocowork app
**without changing user flow or removing features**. CSS-first
approach: drop in the new v2 stylesheets, then incrementally attach
the matching class names to existing React components so the styling
actually lands on surfaces.

Hard constraint: do not break anything. Keep current functionality.

## Source of truth

- Design bundle archive: `/tmp/design.gz` → `/tmp/design`
  (POSIX tar, decompressed in `/tmp/design-files/`)
- Re-fetchable from: `https://api.anthropic.com/v1/design/h/iFxsmZIzkO72QapqOnL-dw`
- Primary review file (read in full):
  `kolisachint-minimal-design-system/project/UI Kit Review.html`
- Prototype JSX (reference only — do **not** copy verbatim):
  `kolisachint-minimal-design-system/project/ui_kits/hoocowork/*.jsx`

## Repo state at start

- `src/main.jsx` loads: `index.css` → `kit.css` → `kit-extra.css` →
  `kit-revisions.css` → `kit-mobile.css` → `kit-overrides.css`
- v1 stylesheets in repo have **drifted** from the design bundle's
  v1 (repo is larger; assume repo-side customizations are intentional
  and preserve them — do not overwrite kit.css / kit-extra.css /
  kit-revisions.css / kit-mobile.css).
- Tokens (paper/ink palette, JetBrains Mono, rust accent, spacing,
  radii, shadow ramps) are already wired in `src/index.css`.

## Plan

### Phase 1 — Stylesheets (CSS only, additive)  ✅ DONE

- [x] Copy `kit-v2.css` from design bundle into `src/styles/kit-v2.css`
- [x] Copy `kit-mobile-v2.css` into `src/styles/kit-mobile-v2.css`
- [x] Wire imports in `src/main.jsx` in this order:
  ```
  kit.css → kit-extra.css → kit-revisions.css → kit-mobile.css
    → kit-v2.css → kit-mobile-v2.css → kit-overrides.css
  ```
  (mirrors design `index.html` load order; kit-overrides.css stays
  last so any repo-specific overrides keep winning)
- [ ] Start dev server and confirm no console regressions
  *(not run here — node_modules not installed in this session;
   stylesheets are verbatim from design bundle so vite picks
   them up at startup)*

### Phase 2 — Class-hook attachment per surface  ◔ PARTIAL

Done in this pass (low-risk, additive class attachment — no
behavioural changes):

- [x] **Sidebar v2**
  - `GitHubStarBadge.tsx` → `gh-star-badge` + `star-count`
  - `SidebarContent.tsx` → `sidebar-search-modes` (search mode tabs)
  - `SidebarContent.tsx` → `update-banner` / `update-banner-title` /
    `update-banner-meta` (footer version banner)
- [x] **Plugins v2** — `PluginSettingsTab.tsx`
  - `ServerDot` → `plugin-server-dot` + `.ping`
  - `SuggestionCard` → `plugin-suggest-card` / `-stripe` / `-body` /
    `-icon` / `-meta` / `-line` / `-name` / `-desc` / `-repo`
  - Install-from-git row → `plugin-install-bar`
  - Security warning → `plugin-security-note`
  - Footer links → `plugin-foot-links`
- [x] **Agents settings** — `AgentSelectorSection.tsx`
  - Adds `x6` modifier when ≥ 6 providers (`agent-selector x6` ⇒
    6-up grid on desktop, 3/2-up on tablet/mobile)
- [x] **Version upgrade modal** — `VersionUpgradeModal.tsx`
  - `modal-overlay` + `modal-shell` + `modal-head` / `-title` /
    `-icon` + `modal-body` + `modal-foot`
  - Version rows → `vupg-versions` / `vupg-vrow` / `vupg-vrow.latest`
    / `vupg-vrow-label` / `vupg-vrow-val`
  - Changelog → `vupg-changelog`
  - Upgrade command → `vupg-cmd`
- [x] **MCP server form modal** — `McpServerFormModal.tsx`
  - `modal-overlay` + `modal-shell` + `modal-head` / `-title` +
    `modal-body` + `mcp-form` on the form element
  - (Footer actions stay inside the `<form>` due to submit
    semantics; modal-foot not used here)
- [x] **Provider login modal** — `ProviderLoginModal.tsx`
  - `modal-overlay` + `modal-shell` + `modal-head` / `-title`
  - Gemini branch → `plm-gemini-steps` / `plm-gemini-step` /
    `plm-step-num` / `plm-step-text`
- [x] **Project creation wizard** — `ProjectCreationWizard.tsx` +
  `WizardProgress.tsx` + `WizardFooter.tsx`
  - `modal-overlay` + `modal-shell` + `modal-head` / `-title` /
    `-icon` + `modal-body` + `modal-foot`
  - Progress bar → `pwiz-progress` + `pwiz-step` (with `active`/
    `done` state) + `.num` + `.sep`
- [x] **Chat thinking-mode dropdown** —
  `ThinkingModeSelector.tsx`
  - Dropdown shell → `think-dropdown` (composes with portal-
    positioned inline style; inline `position: fixed` wins)
  - Header → `think-dropdown-head` with `h4` + `p`
  - Each option → `think-option` / `.active`
  - Option head → `think-option-head` + `think-option-name`
  - Active pill → `think-option-active-pill`
  - Description → `think-option-desc`
  - Prefix code → `think-option-prefix`
- [x] **ClaudeStatus pill** — `ClaudeStatus.tsx`
  - Inner pill → composed `claude-status` class (v2 paper-2 bg /
    line border / radius-1 / padding declarations win over Tailwind
    by source order)
  - Loading status dot → adds `.pulse` class for v2 accent-color
    1.2s pulse animation when isLoading
- [x] **AccountContent v2 account-card** —
  `AccountContent.tsx`
  - Auth row settings-row now wraps an `account-card` (with
    `.connected` modifier when authenticated) → `agent-conn-icon` +
    `account-card-meta` (with `account-card-name` /
    `account-card-state`) + login button in the auto-width slot
  - Mirrors design-bundle `Settings.jsx` AccountContent structure
- [x] **PermissionsContent v2 mode grid** —
  `PermissionsContent.tsx` `RadioModeSection`
  - Renders modes as `permissions-grid` of `permission-mode-card`
    buttons (with `role="radio"` + `aria-checked` for a11y; same
    value/onChange contract preserved — affects codex + gemini)
  - Each card: `permission-mode-card-head` (status-dot + name +
    optional warning icon) + `permission-mode-card-desc` (tone-
    tinted ok/warn)
- [x] **Model picker v2** —
  `ProviderSelectionEmptyState.tsx`
  - Trigger Card → `modelpick-card` with `modelpick-glyph` /
    `modelpick-provider` / `modelpick-model` / `modelpick-chev`
  - CommandList → `modelpick-list`
  - CommandGroup → `modelpick-group` with arbitrary-variant
    `[&_[cmdk-group-heading]]:modelpick-group-head` to apply v2
    heading styling to cmdk's auto-generated heading element
  - CommandItem → `modelpick-row` (+ `.selected` when active) +
    `modelpick-row-label`
  - Selected Check → adds `check` class for v2 accent color

Intentionally skipped (would be deeper refactors / system-wide
churn — defer):

- [~] **Shared Dialog primitive** — `src/shared/view/ui/Dialog.tsx`
  is used by ~40 dialogs; modifying its base className would change
  radius/sizing app-wide. Better to attach modal-* per modal as we
  did with Version/MCP/ProviderLogin/Wizard. Hooks remain available.
- [~] **Auth / Onboarding / CliSelection** — outer container
  positioning (`.auth-stage` / `.onboard-stage` would switch
  `min-h-screen` flow → `position: fixed`) still skipped to avoid
  bootstrap-path layout regressions. **Inner hooks now wired**
  additively (no positioning change):
  - `AuthScreenLayout.tsx` → `auth-card` / `auth-brand` /
    `brand-mark` / `auth-h1` / `auth-sub` / `auth-foot`
  - `AuthInputField.tsx` → `auth-field` (wrapper); existing label/
    input Tailwind classes win on their own declarations
  - `AuthErrorAlert.tsx` → `auth-error` (composes with existing
    Tailwind error styling)
  - `LoginForm.tsx` + `SetupForm.tsx` → `auth-form` on the
    `<form>` element
  - `Onboarding.tsx` → `onboard-shell` on the `w-full max-w-2xl`
    wrapper + `onboard-foot` on the prev/next button row;
    `OnboardingStepProgress` left as bespoke (48px circles +
    progress lines differ from v2's 22px text pills)
- [~] **Chat composer v2** — substantial surface with carefully-
  tuned layout. Hooks live in kit-v2.css; do as intentional
  redesign, not bulk-rewire.
- [~] **PermissionsContent cmd-tag list** — existing rows are
  colored by tone (ok-soft/err-soft) to distinguish allowed vs
  disallowed; v2 `.cmd-tag` is monochrome and would lose that
  semantic distinction.
- [~] **MCP transport tabs** — existing form uses `<select>` not
  tab-style buttons; v2 `.mcp-transport-tabs` would be a UX change.

- [x] **Git-panel modals** — `NewBranchModal.tsx` +
  `ConfirmActionModal.tsx`
  - Restructured to `modal-overlay` (with click-outside close) +
    `modal-shell` + `modal-head` (with `modal-head-title` /
    `modal-head-icon` where applicable) + `modal-body` + `modal-foot`
  - Sibling backdrop divs folded into overlay (overlay handles
    click-outside via `event.target === event.currentTarget`)
- [x] **PRD-editor modals** — `GenerateTasksModal.tsx` +
  `OverwriteConfirmModal.tsx`
  - Same `modal-overlay` / `modal-shell` / `modal-head` /
    `modal-body` / `modal-foot` restructure
  - OverwriteConfirmModal: `warn-soft` token for icon background
- [x] **Task-master modals** — `CreateTaskModal.tsx` +
  `TaskHelpModal.tsx`
  - `modal-*` restructure; close button kept in `modal-head` with
    `icon-btn`
- [x] **Sidebar delete confirmations** — `SidebarModals.tsx`
  - Both `deleteConfirmation` (project) and `sessionDeleteConfirmation`
    inline modals restructured to `modal-*`
  - Footers retain `paper-2` background via inline style; project-
    delete foot keeps stacked button layout via `flex-col gap-2`
    override (composes with v2 `modal-foot` row default)
  - Icon backgrounds use `warn-soft` / `err-soft` tokens
- [x] **ImageViewer** — `ImageViewer.tsx`
  - `modal-overlay` (with click-outside close) + `modal-shell` +
    `modal-head` only; body/foot left bespoke (viewport-centered
    image layout)
- [x] **FolderBrowserModal** — `FolderBrowserModal.tsx`
  - `modal-overlay` + `modal-shell` + `modal-head` + `modal-body`
    + `modal-foot`
  - `modal-body` uses `padding: 0; gap: 0` inline override to keep
    inner scrollable list wrapper in charge of its own spacing
  - Path-display row sits between body and foot as a flex-shrink-0
    sibling (matches v2 modal structural pattern)
- [x] **TokenUsagePie composer-tokens** — `TokenUsagePie.tsx`
  - Wrapper composes `composer-tokens` (v2 4px gap + fs-xs + ink-3)
    on top of existing Tailwind layout classes
- [x] **TaskMasterSetupModal** — `TaskMasterSetupModal.tsx`
  - `modal-overlay` (with click-outside close, composes with
    Tailwind `items-start` / `pt-16` for top-aligned overlay) +
    `modal-shell` + `modal-head` (with `modal-head-icon` carrying
    accent tint) + `modal-foot`
  - Shell content (terminal) kept as bespoke `flex-1 p-4` between
    head and foot to preserve the embedded `Shell` layout
  - Foot composed with `items-center justify-between` override
    to keep the completion status / close button row layout
- [x] **TaskDetailModal** — `TaskDetailModal.tsx`
  - `modal-overlay` (with click-outside close) + `modal-shell`
    (composes with responsive `h-full md:h-[90vh]` /
    `md:rounded-lg` so mobile remains full-screen, desktop
    floats; mobile-v2 CSS already resets border/radius at ≤760px)
  - `modal-head` + `modal-head-title` wrapping the bespoke
    status-icon + task-ID chip + editable title cluster
  - Body left as bespoke `space-y-6` scrollable region (gap +
    flex direction from `modal-body` would conflict with the
    grid + space-y layout)
  - h1 left intact (modal-head h3 selector does not apply)
- [x] **FileTree delete confirmation** — `FileTree.tsx`
  - `modal-overlay` (with click-outside cancel, disabled while
    delete is in flight) + `modal-shell` + `modal-head` (with
    `modal-head-icon` using `err-soft` token) + `modal-body` +
    `modal-foot`
  - Inline-rendered delete dialog now matches sidebar / git-panel
    confirmation modals
- [x] **Chat composer + chat header v2** — confirmed already
  wired in prior passes (no new edits needed)
  - `ChatComposer.tsx`: root `composer`; `composer-divider`,
    `composer-mode`, `composer-mode-dot`, `composer-spacer`,
    `composer-model`, `composer-hint` directly attached;
    `composer-foot` / `composer-tools` / `composer-tool` /
    `composer-input` / `composer-attachments` provided by the
    shared `PromptInput*` primitives; `composer-tokens` via
    `TokenUsagePie`; `composer-think` via `ThinkingModeSelector`
  - `ChatHeader.tsx`: `chat-header-info` + `chat-title` /
    `chat-eyebrow` / `chat-name` + `chat-meta` with
    `chat-meta-id` / `-tokens` / `-count` / `-time` (each with
    `chat-meta-id-label` + `-value` sub-spans)
- [x] **PermissionRequestsBanner v2 sub-classes** —
  `PermissionRequestsBanner.tsx`
  - `permission-banner-head` composed on `ConfirmationTitle`,
    `permission-banner-body` on body wrappers,
    `permission-banner-tool` on the inline tool-name `<code>`
    chips, `permission-banner-foot` on `ConfirmationActions`
  - Root `permission-banner` class skipped because the
    `Confirmation` primitive renders an `Alert` with
    `display: grid; grid-cols-[0_1fr]` for col-start-2 child
    placement, which the v2 `display: flex` would break
- [x] **ToolDiffViewer v2 diff hooks** —
  `ToolDiffViewer.tsx`
  - Outer wrapper gains `tool-diff` so mobile-v2's
    `.tool-diff { padding: 8px 10px }` and kit-overrides'
    `.tool-diff .diff-add/.diff-rem` color rules apply
  - Each diff line row now carries `diff-add` / `diff-rem`
    alongside existing Tailwind classes

Remaining work (per-surface, on-demand):

- [x] **CodeEditor floating variant** — `CodeEditor.tsx`
  - Inner container now composes `modal-shell` with Tailwind
    overrides:
    - Non-fullscreen: `modal-shell ... md:w-full md:max-w-6xl
      md:h-[80vh] md:max-h-[80vh]` (the 80vh max-height wins over
      modal-shell's 90vh because it's more restrictive)
    - Fullscreen: `modal-shell ... md:w-full md:h-full
      md:rounded-none md:max-h-none md:border-0` (Tailwind classes
      override modal-shell's max-height/border/radius)
  - Outer overlay container left unchanged (`fixed inset-0
    z-[9999] md:bg-black/50`) so the z-[9999] stacking and
    bg-black/50 backdrop are preserved (modal-overlay's z-120
    would have stacked below other portaled UIs)
  - Sidebar variant unchanged (no modal-shell — embedded surface)
- [x] **CodeEditorBinaryFile** —
  `CodeEditorBinaryFile.tsx`
  - Inner now composes `modal-shell` on both fullscreen
    (`modal-shell ... w-full h-full md:max-h-none md:border-0
    md:rounded-none`) and floating
    (`modal-shell ... md:max-w-2xl md:h-auto md:max-h-[60vh]`)
    branches — 60vh wins over modal-shell's 90vh
- [x] **PrdEditorWorkspace** —
  `PrdEditorWorkspace.tsx`
  - Inner container now composes
    `modal-shell prd bg-[var(--paper)] shadow-2xl ...` plus the
    fullscreen branch picks up `md:max-h-none md:border-0` while
    the floating branch keeps `md:max-w-6xl md:h-[85vh]
    md:max-h-[85vh]` (85vh wins over modal-shell's 90vh)
  - `.prd` v1 hook from kit-extra retained (provides flex/padding
    layout); modal-shell layers in border/radius/shadow only

### Phase 3 — Verification  ◔ PARTIAL

- [x] `npm run typecheck` — **no new errors from v2 edits**. Pre-
  existing errors only, all in untouched files (xterm typings in
  `src/components/shell/*`, `CommandPalette.tsx`, `MessageComponent.tsx`,
  `SidebarCollapsed.tsx`, `WebSocketContext.tsx`). None of the
  surfaces touched in Phase 2 appear in the error list.
- [ ] `npm run lint` — **could not run in this session**: eslint
  crashes with `Bus error (core dumped)` on the sandbox (956 MB
  RAM, eslint OOMs even on a single file with `--max-old-space-size`
  bumped). Re-run locally.
- [ ] `npm run dev` boots; visual spot-check on chat / sidebar /
  settings / plugins / auth surfaces in light + dark
  *(not run — vite dev server also needs more memory than the
  sandbox has)*
- [ ] Manual phone-width check (≤760px) for the mobile-v2 declutter
  pass (topbar tabs, composer rows, plugins stack)

## Out of scope (explicitly)

- Replacing components with prototype JSX from `ui_kits/hoocowork/`
- Removing/refactoring existing features (token tracking, command
  palette logic, hoocode tree chat, etc.)
- Overwriting repo-side v1 kit*.css customizations
- Backend/server work — design is chrome-only

## Resume checkpoint

When resuming this work, read this file plus the section
checkboxes above. The bundle in `/tmp/design-files/` may not
survive a reboot — re-fetch via the design URL if missing.

Last updated: 2026-05-18 (modal-* + chat v2 pass, third batch:
ChatComposer/ChatHeader confirmed already wired; PermissionRequestsBanner
permission-banner-head/-body/-tool/-foot sub-classes added; ToolDiffViewer
tool-diff / diff-add / diff-rem hooks added; **fourth batch: deferred
surfaces wired** — CodeEditor + CodeEditorBinaryFile + PrdEditorWorkspace
gain `modal-shell` with sizing/border overrides; Auth/Onboarding inner
hooks added without flipping outer container positioning).
- Phase 1 complete (stylesheets in build).
- Phase 2 broader (sidebar v2, plugins v2, agent-selector x6,
  version upgrade modal, MCP form modal, provider login modal,
  project creation wizard, chat thinking-mode dropdown, ClaudeStatus
  pill, AccountContent account-card, PermissionsContent
  permission-mode-card grid, model picker modelpick-*, git-panel
  modals, prd-editor modals, task-master modals, sidebar delete
  confirmations, ImageViewer, FolderBrowserModal,
  TokenUsagePie composer-tokens, **TaskMasterSetupModal**,
  **TaskDetailModal**, **FileTree delete confirmation**,
  **ChatComposer/ChatHeader v2 verified**, **PermissionRequestsBanner
  permission-banner-* sub-classes**, and **ToolDiffViewer tool-diff /
  diff-add / diff-rem hooks** all wired).
- Deferred surfaces now wired (fourth batch): **CodeEditor** +
  **CodeEditorBinaryFile** + **PrdEditorWorkspace** floating
  variants compose `modal-shell` with Tailwind sizing/border
  overrides (80vh / 60vh / 85vh wins over 90vh by being more
  restrictive; fullscreen branch uses `md:max-h-none md:border-0
  md:rounded-none` to fully restore the existing fullscreen
  behavior). **Auth/Onboarding** inner hooks added (`auth-card`,
  `auth-brand`, `auth-h1`, `auth-sub`, `auth-foot`, `auth-field`,
  `auth-error`, `auth-form`, `onboard-shell`, `onboard-foot`)
  without changing outer container positioning (`.auth-stage` /
  `.onboard-stage` still skipped to keep `min-h-screen` flow on
  the bootstrap path).
- Still deferred: CodeEditor/PrdEditor loading states (transient);
  `OnboardingStepProgress` (visual design differs from v2 step bar).
- Phase 3 partial: `npm install` ran; `npm run typecheck` is clean
  for all v2-edited files (pre-existing errors in untouched shell/
  xterm/CommandPalette/WebSocketContext only); `npm run lint` and
  `npm run dev` could not run in the sandbox (OOM) — re-run locally.
