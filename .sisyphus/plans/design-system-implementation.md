# Plan: Kolisachint Minimal Design System — Final Implementation

## TL;DR

> **Quick Summary**: Complete the remaining ~10% of the Kolisachint Minimal Design System rollout: update branding assets (logo, favicon, manifest, title), fix the server build error, and migrate ~140 view component files from Tailwind utility classes to kit CSS classes for a fully consistent paper-and-ink aesthetic.
>
> **Deliverables**:
> - New minimal `public/logo.svg` and `public/favicon.svg`
> - Updated `index.html` (title: "HooCowork") and `public/manifest.json`
> - Server build passing (`npm run build:server` exit 0)
> - All view components migrated from Tailwind utilities to kit CSS classes
> - `kit-overrides.css` kept as safety net (not removed)
>
> **Estimated Effort**: Large (~140 files, 4 execution waves)
> **Parallel Execution**: YES — 4 waves with inter-wave dependencies
> **Critical Path**: Branding + Build Fix → High-impact migration → Remaining migration → Final verification

---

## Context

### Original Request
User provided a "Kolisachint Minimal Design System" design bundle (HTML/CSS/JS prototypes exported from Claude Design) and asked to implement the designs in the HooCowork project — specifically to make the existing project work as expected with the design system fully applied.

### Interview Summary
**Key Decisions**:
- **Project name**: Use "HooCowork" (matches GitHub/README/package.json)
- **Logo**: Replace old blue logo with new minimal terminal-prompt logo from design bundle
- **Component migration**: Full migration from Tailwind utilities to kit CSS classes
- **Build error**: Fix the 3 TS errors in `server/binary-entry.ts`

**Research Findings**:
- ~90% of the design system is already implemented: CSS tokens (paper-ink palette, fonts, spacing), kit CSS files (kit.css, kit-extra.css, kit-mobile.css, kit-overrides.css), React kit components (Button, Badge, Input, etc.), and all font files
- Remaining work: branding assets (logo, favicon, manifest, title), server build error, and migration of ~140 view component files
- The kit-overrides.css already patches Tailwind classes with !important — this safety net stays

### Metis Review
**Identified Gaps** (addressed):
- **140+ files scope**: Real count of view files outside AND inside subcomponents directories
- **`.keep-blur` escape hatch**: AppContent.tsx backdrop-blur will be silently killed unless tagged
- **No new favicon in bundle**: Design bundle has old favicon for reference only; must create new one from logo
- **Third-party boundaries**: xterm, CodeMirror, shadcn, Lucide — do NOT touch
- **Tailwind stays**: Don't remove Tailwind from project (third-party libs need it)
- **kit-overrides.css stays**: Safety net for edge cases, even after full migration

---

## Work Objectives

### Core Objective
Complete the Kolisachint Minimal Design System rollout: paper-and-ink aesthetic (warm-neutral bone/deep ink palette, JetBrains Mono typography, hairline borders, rust accent) applied consistently across all HooCowork UI surfaces.

### Concrete Deliverables
- `public/logo.svg` — replaced with minimal terminal-prompt logo
- `public/favicon.svg` — new favicon matching minimal design
- `index.html` — title: "HooCowork", theme-color: paper tone
- `public/manifest.json` — name updated to HooCowork
- `server/binary-entry.ts` — 3 TS errors fixed, build passing
- `src/components/*/view/*.tsx` — all ~140 files migrated from Tailwind to kit CSS classes
- `AppContent.tsx` — backdrop-blur gets `.keep-blur` escape hatch

### Definition of Done
- [ ] `npm run build:client` → passes (0 errors)
- [ ] `npm run build:server` → passes (0 errors)
- [ ] App loads without console errors (visual smoke test)
- [ ] All tabs render: chat, files, git, terminal, settings, MCP, plugins, TMS, PRD
- [ ] Dark mode toggle still works
- [ ] No visual regressions in any migrated component

### Must Have
- All branding assets reflect the paper-and-ink minimal aesthetic
- Server build compiles without errors
- View components use kit CSS classes instead of Tailwind utilities
- kit-overrides.css kept as safety net
- Tailwind remains installed for third-party component compatibility

### Must NOT Have (Guardrails)
- No changes to `src/index.css` tokens (already correct)
- No changes to third-party components (xterm, CodeMirror, shadcn, Lucide)
- No removal of Tailwind from project
- No new kit components — only migrate existing
- No behavioral/functional changes — styling only
- No removal of kit-overrides.css

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (no test framework found beyond bun test)
- **Automated tests**: None for this work
- **Verification**: Agent-executed QA scenarios + build checks

### QA Policy
Every task includes agent-executed build verification. The executing agent will:
- Run `npm run build:client` after each migration batch
- Run `npm run build:server` after build fix
- Do visual smoke test via browser (load app, check tabs, toggle dark mode)
- Capture evidence screenshots where applicable

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation, all independent):
├── Task 1: Replace logo.svg with minimal design
├── Task 2: Create new favicon.svg from minimal logo
├── Task 3: Update index.html + manifest.json (title, theme-color, branding)
├── Task 4: Fix server build error (binary-entry.ts)
└── Task 5: Add .keep-blur to AppContent.tsx backdrop element

Wave 2 (High-impact migration — most visible surfaces):
├── Task 6: Migrate AppContent.tsx root layout → kit CSS
├── Task 7: Migrate chat/ view files (ChatInterface + 13 subcomponents)
└── Task 8: Migrate sidebar/ view files (Sidebar + 7 subcomponents)

Wave 3 (Medium-priority surfaces):
├── Task 9: Migrate settings/ view files (19 files across tabs)
├── Task 10: Migrate onboarding/ + quick-settings-panel/ view files
├── Task 11: Migrate mcp/ + plugins/ view files
└── Task 12: Migrate task-master/ + prd-editor/ view files

Wave 4 (Remaining surfaces):
├── Task 13: Migrate file-tree/ view files (9 files)
├── Task 14: Migrate git-panel/ view files (16 files)
├── Task 15: Migrate shell/ + code-editor/ view files
└── Task 16: Migrate auth/ + provider-auth/ + standalone-shell/ + version-upgrade/ view files

Wave FINAL (Parallel verification):
├── Task F1: Build audit + scope compliance check
├── Task F2: Visual smoke test QA (browser)

Critical Path: Wave 1 → Wave 2 → Wave 3 → Wave 4 → Final
Parallel Speedup: ~60% faster than sequential (Wave 1 tasks are independent)
```

### Dependency Matrix
- **Tasks 1-5**: None (parallel Wave-1 start)
- **Tasks 6-8**: Blocked by Wave 1 completion
- **Tasks 9-12**: Blocked by Wave 2 completion
- **Tasks 13-16**: Blocked by Wave 3 completion
- **F1-F2**: Blocked by ALL previous tasks

---

## TODOs

- [x] 1. Replace `public/logo.svg` with new minimal design

  **What to do**:
  - Copy `/tmp/design-handoff/kolisachint-minimal-design-system/project/assets/logo.svg` to `public/logo.svg`
  - New logo: hairline square border with `>` terminal prompt glyph and cursor bar (vs old: blue rounded rect + chat bubble)
  - Verify the new SVG renders correctly

  **Must NOT do**:
  - Don't rename or move the file — `index.html`, manifest, and PWA icons reference `/logo.svg`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-5)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:
  - Design bundle logo: `/tmp/design-handoff/kolisachint-minimal-design-system/project/assets/logo.svg`
  - Current logo: `public/logo.svg`

  **Acceptance Criteria**:
  - [ ] `public/logo.svg` replaced with minimal terminal-prompt design
  - [ ] SVG is valid (renders in browser without errors)

  **QA Scenarios**:
  ```
  Scenario: Logo renders correctly
    Tool: Bash
    Steps:
      1. Read public/logo.svg — confirm content matches new minimal design (hairline square, > prompt, cursor bar)
      2. Validate SVG structure: <svg> with viewBox, <rect> with stroke, <path> for prompt glyph, <rect> for cursor
    Expected Result: SVG contains hairline-square mark with terminal prompt
    Evidence: .sisyphus/evidence/task-1-logo-verified.txt
  ```

  **Commit**: YES
  - Message: `feat(branding): replace logo with kolisachint minimal design`
  - Files: `public/logo.svg`

---

- [x] 2. Create new `public/favicon.svg` from minimal logo design

  **What to do**:
  - The design bundle has `assets/favicon-original.svg` (old design reference) but NOT a new minimal favicon
  - Create a new favicon based on the new minimal logo: hairline square with `>` prompt glyph
  - Target: 64x64 viewBox, paper background (#FAFAF7), hairline-ink stroke (#111110), no rounded corners
  - Use the same prompt glyph as the new logo but sized appropriately for 64x64

  **Must NOT do**:
  - Don't use the old favicon style (dark bg, message bubble icon)
  - Don't use rounded corners (max 2px if any)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - Design for logo: `/tmp/design-handoff/kolisachint-minimal-design-system/project/assets/logo.svg`
  - Current favicon: `public/favicon.svg`

  **Acceptance Criteria**:
  - [ ] `public/favicon.svg` uses minimal logo design (terminal prompt, not message bubble)
  - [ ] SVG is valid 64x64 viewBox
  - [ ] Renders correctly as browser tab favicon

  **QA Scenarios**:
  ```
  Scenario: Favicon renders as tab icon
    Tool: Bash
    Steps:
      1. Validate SVG is syntactically valid XML
      2. Confirm viewBox="0 0 64 64"
      3. Confirm stroke="#111110" (ink) color scheme
    Expected Result: Valid SVG with minimal terminal-prompt design
    Evidence: .sisyphus/evidence/task-2-favicon-verified.txt
  ```

  **Commit**: YES (groups with task 1)
  - Message: `feat(branding): replace logo with kolisachint minimal design`
  - Files: `public/favicon.svg`

---

- [x] 3. Update `index.html` and `manifest.json` branding

  **What to do**:
  - `index.html`:
    - Change `<title>` from "CloudCLI UI" to "HooCowork"
    - Change `apple-mobile-web-app-title` from "Claude UI" to "HooCowork"
    - Update `theme-color` from `#ffffff` to `#FAFAF7` (paper tone)
    - Update `msapplication-TileColor` from `#ffffff` to `#FAFAF7`
  - `public/manifest.json`:
    - Change `name` from "CloudCLI UI" to "HooCowork"
    - Change `short_name` from "CloudCLI UI" to "HooCowork"
    - Change `description` from "CloudCLI UI web application" to "A web-based UI for Claude Code, Cursor CLI, Codex, and Gemini-CLI"
    - Change `background_color` and `theme_color` from `#ffffff` to `#FAFAF7`

  **Must NOT do**:
  - Don't change any other meta tags
  - Don't modify PWA icon references

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `index.html`: line 8 title, line 16 apple title, line 23 theme-color
  - `public/manifest.json`: lines 2-8 name/short_name/description/colors

  **Acceptance Criteria**:
  - [ ] `index.html` title reads "HooCowork"
  - [ ] `manifest.json` name/short_name reads "HooCowork"
  - [ ] Both theme-color entries use `#FAFAF7`

  **QA Scenarios**:
  ```
  Scenario: HTML metadata is correct
    Tool: Bash
    Steps:
      1. grep '<title>' index.html — confirm "HooCowork"
      2. grep 'theme-color' index.html — confirm "#FAFAF7"
      3. grep 'apple-mobile-web-app-title' index.html — confirm "HooCowork"
    Expected Result: All branding metadata updated
    Evidence: .sisyphus/evidence/task-3-branding-verified.txt

  Scenario: Manifest is correct
    Tool: Bash
    Steps:
      1. grep '"name"' public/manifest.json — confirm "HooCowork"
      2. grep '"short_name"' public/manifest.json — confirm "HooCowork"
      3. grep 'theme_color' public/manifest.json — confirm "#FAFAF7"
    Expected Result: Manifest branding updated
    Evidence: .sisyphus/evidence/task-3-manifest-verified.txt
  ```

  **Commit**: YES
  - Message: `feat(branding): update html title and manifest to hoocowork`
  - Files: `index.html`, `public/manifest.json`

---

- [x] 4. Fix server build error in `server/binary-entry.ts`

  **What to do**:
  Fix 3 TypeScript errors:
  1. **TS1543** (line 7): Add `with { type: 'json' }` to the JSON import:
     ```
     import packageJson from '../package.json' with { type: 'json' };
     ```
  2. **TS5097** (line 8): Drop `.ts` extension from import:
     ```
     import embeddedAssets from './generated/embedded-assets';
     ```
     AND rename the target file from `.ts` to `.js` at `server/generated/embedded-assets.ts` → `.js` (or add `// @ts-expect-error` if the file must stay `.ts`)
  3. **TS2868** (line 11): Guard the `Bun` reference — change:
     ```
     const isBinaryMode = typeof Bun !== 'undefined' && ...
     ```
     to checked type access, or add `// @ts-ignore` before the `Bun` usage since this code only runs when executed by Bun runtime

  **Best approach**: Since this file is designed to run with Bun (#!/usr/bin/env bun), the simplest fix is:
  - Line 7: Add `with { type: 'json' }`
  - Line 8: Drop `.ts` extension (the file exists at that path)
  - Line 11: Add `// @ts-expect-error — Bun global is available only at runtime` before the line

  **Must NOT do**:
  - Don't change tsconfig.json (would affect the entire server build)
  - Don't add @types/bun dependency (only needed if proper type safety is desired)
  - Don't refactor the file logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `server/binary-entry.ts` current content (read the file first)

  **Acceptance Criteria**:
  - [ ] `npm run build:server` passes with exit code 0
  - [ ] No new type errors introduced

  **QA Scenarios**:
  ```
  Scenario: Server build passes
    Tool: Bash
    Steps:
      1. npm run build:server 2>&1
      2. Check exit code is 0
      3. Check stderr has no errors
    Expected Result: Server build exits 0 with no TS errors
    Evidence: .sisyphus/evidence/task-4-server-build-verified.txt
  ```

  **Commit**: YES
  - Message: `fix(build): resolve ts errors in server/binary-entry.ts`
  - Files: `server/binary-entry.ts`

---

- [x] 5. Add `.keep-blur` to AppContent.tsx backdrop element

  **What to do**:
  - In `src/components/app/AppContent.tsx`, find the backdrop overlay element (~line 153):
    ```tsx
    className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-150 ease-out"
    ```
  - Add `keep-blur` to the className so kit-overrides.css doesn't kill the backdrop filter:
    ```tsx
    className="fixed inset-0 bg-background/60 backdrop-blur-sm keep-blur transition-opacity duration-150 ease-out"
    ```

  **Why**: kit-overrides.css has `.backdrop-blur-sm:not(.keep-blur) { backdrop-filter: none !important; }`. This backdrop is the scrim behind the mobile drawer — it needs blur to visually separate the drawer from the main content.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/components/app/AppContent.tsx:151-154` — the backdrop overlay element
  - `src/styles/kit-overrides.css:62-68` — the `.backdrop-blur:not(.keep-blur)` rule

  **Acceptance Criteria**:
  - [ ] AppContent.tsx backdrop element includes `keep-blur` class
  - [ ] Mobile sidebar overlay retains blur effect

  **Commit**: YES (groups with migration tasks)
  - Message: `fix(ui): add keep-blur to mobile drawer backdrop`
  - Files: `src/components/app/AppContent.tsx`

---

- [x] 6. Migrate `AppContent.tsx` root layout to kit CSS classes

  **What to do**:
  - This is the root structural layout file at `src/components/app/AppContent.tsx`
  - Replace Tailwind utility classes with kit CSS equivalents:
    - `fixed inset-0 flex bg-background` → main container layout
    - `h-full flex-shrink-0 border-r border-border/50` → sidebar container
    - `fixed inset-0 z-50 flex transition-all duration-150 ease-out` → mobile drawer
    - `bg-background/60 backdrop-blur-sm keep-blur` → drawer scrim (already has keep-blur)
    - `relative h-full w-[85vw] max-w-sm transform border-r border-border/40 bg-card transition-transform duration-150 ease-out sm:w-80` → drawer panel
    - `flex min-w-0 flex-1 flex-col` → main content area
  - Kit equivalent classes available: `.main`, `.sidebar` (for the sidebar wrapper div)
  - Most structural classes (`flex`, `flex-col`, `flex-1`, `min-w-0`) can map to kit layout context
  - The fixed/absolute positioning, z-index, and transition classes are layout-critical — keep them where no kit equivalent exists

  **Must NOT do**:
  - Don't change component logic
  - Don't remove necessary structural Tailwind classes that have no kit equivalent (fixed positioning, z-index, transitions)
  - Don't remove Tailwind imports from the project

  **Parallelization**:
  - **Can Run In Parallel**: NO (structural root)
  - **Parallel Group**: Wave 2 start (sequential within wave)
  - **Blocks**: Tasks 7-16 (indirect — structural root affects all views)
  - **Blocked By**: Wave 1 (Tasks 1-5)

  **References**:
  - Kit CSS layout classes in `src/styles/kit.css`: `.main`, `.sidebar`, `.view`, `.topbar`
  - Current `AppContent.tsx` full content

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes
  - [ ] App loads without layout breakage
  - [ ] Mobile drawer opens/closes correctly
  - [ ] Sidebar/main content layout renders properly

  **QA Scenarios**:
  ```
  Scenario: App builds successfully after layout migration
    Tool: Bash
    Steps:
      1. npm run build:client 2>&1
      2. Check for 0 errors
    Expected Result: Build passes
    Evidence: .sisyphus/evidence/task-6-layout-build.txt
  ```

  **Commit**: YES (groups with Wave 2 tasks)

---

- [x] 7. Migrate `chat/` view files to kit CSS classes

  **What to do**:
  - Migrate all chat view files (ChatInterface.tsx + 13 subcomponents in `src/components/chat/view/subcomponents/`)
  - Replace Tailwind utility classes with kit CSS equivalents:
    - `.chat-stream` — already used in some files, ensure consistency
    - `.msg`, `.msg-gutter`, `.msg-body`, `.msg-user`, `.msg-assistant` — for message rendering
    - `.msg-tool`, `.tool-head`, `.tool-name`, `.tool-summary`, `.tool-diff` — for tool blocks
    - `.composer`, `.composer-tools`, `.composer-input`, `.composer-foot` — for the message composer
    - `.chat-header`, `.chat-title`, `.chat-eyebrow`, `.chat-name` — for header
  - **Most complex file**: `MessageComponent.tsx` (~68 className lines including responsive prefixes, animations, conditional classes via `cn()`)
  - Handle `cn()` conditional classes carefully — preserve all runtime states
  - Responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) — map to kit-mobile.css behavior or keep as-is where no kit equivalent exists
  - Animation classes (`animate-spin`, `transition-*`) — keep these (no kit equivalents)

  **Must NOT do**:
  - Don't change message rendering logic or component structure
  - Don't remove `cn()` utility imports

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 8)
  - **Parallel Group**: Wave 2 (with Task 8)
  - **Blocks**: Tasks 9-16 (indirect)
  - **Blocked By**: Wave 1

  **References**:
  - Kit CSS chat styles in `src/styles/kit.css` lines 194-268: `.chat`, `.chat-header`, `.chat-stream`, `.msg`, `.msg-tool`, `.composer`, `.composer-input`, etc.
  - Chat view files: `src/components/chat/view/ChatInterface.tsx` + 13 subcomponent files

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes
  - [ ] All chat files use kit CSS classes where available
  - [ ] Message rendering works (user, assistant, tool messages)
  - [ ] Composer input and tools display correctly
  - [ ] Dark mode chat rendering works

  **QA Scenarios**:
  ```
  Scenario: Chat builds after migration
    Tool: Bash
    Steps:
      1. npm run build:client 2>&1
      2. Check for 0 errors
    Expected Result: Build passes
    Evidence: .sisyphus/evidence/task-7-chat-build.txt
  ```

  **Commit**: YES (groups with Wave 2 chat changes)

---

- [x] 8. Migrate `sidebar/` view files to kit CSS classes

  **What to do**:
  - Migrate all sidebar view files (Sidebar.tsx + 7 subcomponents in `src/components/sidebar/view/subcomponents/`)
  - Replace Tailwind utility classes with kit CSS equivalents:
    - `.sidebar`, `.sidebar-header`, `.brand`, `.brand-mark`, `.brand-name` — sidebar structure
    - `.sidebar-search`, `.sidebar-search .input`, `.sidebar-search .kbd-inline` — search bar
    - `.sidebar-eyebrow` — section labels
    - `.sidebar-projects`, `.project-block`, `.project-row`, `.project-name`, `.project-chev` — projects list
    - `.session-list`, `.session-row`, `.session-title`, `.session-meta` — sessions
    - `.sidebar-foot`, `.foot-row`, `.foot-meta` — footer
    - `.status-dot`, `.dot-ok`, `.dot-busy`, `.dot-off`, `.dot-err` — status indicators
  - **Partially migrated already**: Some sidebar subcomponents already use kit classes
  - Handle `SidebarModals.tsx` (~32 className lines) and `SidebarProjectItem.tsx` (~27 lines) carefully

  **Must NOT do**:
  - Don't change sidebar state management logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 7)
  - **Parallel Group**: Wave 2 (with Task 7)
  - **Blocks**: Tasks 9-16
  - **Blocked By**: Wave 1

  **References**:
  - Kit CSS sidebar styles in `src/styles/kit.css` lines 14-103
  - Sidebar view files: `src/components/sidebar/view/Sidebar.tsx` + 7 subcomponents

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes
  - [ ] All sidebar files use kit CSS classes where available
  - [ ] Projects list renders with correct styling
  - [ ] Session list renders with correct styling
  - [ ] Search bar displays correctly
  - [ ] Collapse/expand works

  **QA Scenarios**:
  ```
  Scenario: Sidebar builds after migration
    Tool: Bash
    Steps:
      1. npm run build:client 2>&1
      2. Check for 0 errors
    Expected Result: Build passes
    Evidence: .sisyphus/evidence/task-8-sidebar-build.txt
  ```

  **Commit**: YES (groups with Wave 2 sidebar changes)

---

- [x] 9. Migrate `settings/` view files to kit CSS classes

  **What to do**:
  - Migrate all settings view files (~19 files in `src/components/settings/view/`)
  - This includes: Settings.tsx, SettingsCard.tsx, SettingsRow.tsx, SettingsSection.tsx, SettingsSidebar.tsx, SettingsToggle.tsx, SettingsMainTabs.tsx, PremiumFeatureCard.tsx
  - Plus tabs: AppearanceSettingsTab.tsx, AboutTab.tsx, AgentsSettingsTab.tsx, CredentialsSettingsTab.tsx, GitSettingsTab.tsx, NotificationsSettingsTab.tsx, TasksSettingsTab.tsx
  - Plus sub-tabs and sections under `tabs/agents-settings/sections/`
  - Kit CSS classes to use: `.input`, `.btn`, `.btn-*`, `.badge`, `.badge-*`, `.toggle`, `.toggle-track`, `.toggle-thumb`, `.t-eyebrow`, `.t-h3`, `.t-caption`
  - AppearanceSettingsTab.tsx is the heaviest Tailwind file in this group — contains theme picker, font controls, etc.

  **Must NOT do**:
  - Don't change settings logic or state management

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10-12)
  - **Parallel Group**: Wave 3 (with Tasks 10-12)
  - **Blocks**: Tasks 13-16
  - **Blocked By**: Wave 2

  **References**:
  - Kit CSS classes in `src/styles/kit.css` and `src/styles/kit-extra.css` (toggle at lines 212-217)

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes
  - [ ] All settings files use kit CSS classes where available

  **Commit**: YES (groups with Wave 3 changes)

---

- [x] 10. Migrate `onboarding/` and `quick-settings-panel/` view files

  **What to do**:
  - `src/components/onboarding/view/Onboarding.tsx` + 4 subcomponents
  - `src/components/quick-settings-panel/view/` (6 files: QuickSettingsContent, QuickSettingsHandle, QuickSettingsPanelHeader, QuickSettingsPanelView, QuickSettingsSection, QuickSettingsToggleRow)
  - Kit CSS classes for onboarding: `.onboard`, `.onboard-rail`, `.onboard-steps`, `.onboard-step`, `.onboard-pane`, `.onboard-title`, `.onboard-form`, `.onboard-themes`, `.onboard-theme`, `.onboard-foot`, `.btn`, `.btn-*`
  - Kit classes for quick settings: `.btn`, `.btn-*`, `.badge`, `.toggle`, `.input`, `.t-caption`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 11, 12)
  - **Parallel Group**: Wave 3

  **References**:
  - Kit CSS files: `kit-extra.css` lines 146-182 (onboarding), `kit.css` buttons/badges/toggles

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 3 changes)

---

- [x] 11. Migrate `mcp/` and `plugins/` view files

  **What to do**:
  - `src/components/mcp/view/McpServers.tsx` + McpServerFormModal.tsx
  - `src/components/plugins/view/` (3 files: PluginIcon, PluginSettingsTab, PluginTabContent)
  - Kit CSS classes: `.mcp`, `.mcp-head`, `.mcp-title`, `.mcp-list`, `.mcp-row`, `.mcp-row-head`, `.mcp-detail`, `.mcp-kv`, `.btn`, `.input`, `.badge`, `.toggle`
  - Kit classes for plugins: `.plugin-list`, `.plugin-row`, `.plugin-glyph`, `.plugin-name`, `.plugin-desc`, `.toggle`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 10, 12)
  - **Parallel Group**: Wave 3

  **References**:
  - Kit CSS: `kit-extra.css` lines 90-123 (MCP), 199-217 (plugins)

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 3 changes)

---

- [x] 12. Migrate `task-master/` and `prd-editor/` view files

  **What to do**:
  - `src/components/task-master/view/` (~11 files: TaskBoard.tsx, TaskBoardContent.tsx, TaskBoardToolbar.tsx, TaskCard.tsx, TaskDetailModal.tsx, TaskEmptyState.tsx, TaskMasterPanel.tsx, etc.)
  - `src/components/prd-editor/view/` (~7 files: PrdEditorBody.tsx, PrdEditorHeader.tsx, PrdEditorWorkspace.tsx, etc.)
  - Kit CSS for task-master: `.tm-head`, `.tm-board`, `.tm-col`, `.tm-card`, `.tm-title`, `.tm-prio`, `.btn`, `.badge`
  - Kit CSS for PRD: `.prd-head`, `.prd-body`, `.prd-edit`, `.prd-preview`, `.prd-textarea`, `.prd-h1`, `.prd-p`, `.btn`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9-11)
  - **Parallel Group**: Wave 3

  **References**:
  - Kit CSS: `kit-extra.css` lines 125-144 (task-master), 184-197 (PRD)

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 3 changes)

---

- [x] 13. Migrate `file-tree/` view files

  **What to do**:
  - `src/components/file-tree/view/` (9 files: FileTree.tsx, FileTreeNode.tsx, FileTreeBody.tsx, FileTreeHeader.tsx, FileTreeList.tsx, FileTreeEmptyState.tsx, FileTreeLoadingState.tsx, FileTreeDetailedColumns.tsx, FileContextMenu.tsx, ImageViewer.tsx)
  - Kit CSS classes: `.files`, `.files-tree`, `.files-eyebrow`, `.tree-row`, `.tree-icon`, `.tree-name`, `.tree-change`, `.files-pane`, `.files-tabs`, `.files-tab`, `.files-path`, `.code`, `.code-line`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 14-16)
  - **Parallel Group**: Wave 4 (with Tasks 14-16)
  - **Blocked By**: Wave 3

  **References**:
  - Kit CSS: `kit.css` lines 267-325 (file explorer)

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 4 changes)

---

- [x] 14. Migrate `git-panel/` view files

  **What to do**:
  - `src/components/git-panel/view/` (~16 files across subdirectories: changes/, branches/, history/, modals/, shared/)
  - Kit CSS classes: `.git`, `.git-rail`, `.git-branch-row`, `.git-eyebrow`, `.git-branch`, `.git-tabs`, `.git-tab`, `.git-list`, `.git-file`, `.git-mark`, `.git-path`, `.git-commit`, `.git-log`, `.git-diff`, `.btn`, `.input`, `.badge`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13, 15, 16)
  - **Parallel Group**: Wave 4

  **References**:
  - Kit CSS: `kit-extra.css` lines 15-88 (git panel)

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 4 changes)

---

- [x] 15. Migrate `shell/` and `code-editor/` view files

  **What to do**:
  - `src/components/shell/view/Shell.tsx` + 5 subcomponents
  - `src/components/code-editor/view/CodeEditor.tsx` + EditorSidebar.tsx + 7 subcomponents
  - Kit CSS for shell: `.terminal`, `.terminal-bar`, `.term-tab`, `.terminal-body`, `.term-line`
  - Kit CSS for code-editor: structural classes — `.files-pane`, `.files-tabs`, `.files-path`, `.code`
  - NOTE: CodeMirror integration uses its own classes — only migrate the wrapper/shell classes

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13, 14, 16)
  - **Parallel Group**: Wave 4

  **References**:
  - Kit CSS: `kit.css` lines 327-357 (terminal), 267-325 (file explorer)

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 4 changes)

---

- [x] 16. Migrate remaining view files (auth, provider-auth, standalone-shell, version-upgrade)

  **What to do**:
  - `src/components/auth/view/` (7 files: AuthErrorAlert, AuthInputField, AuthLoadingScreen, AuthScreenLayout, LoginForm, SetupForm, ProtectedRoute)
  - `src/components/provider-auth/view/ProviderLoginModal.tsx`
  - `src/components/standalone-shell/view/StandaloneShell.tsx` + subcomponents
  - `src/components/version-upgrade/view/VersionUpgradeModal.tsx`
  - Kit CSS classes: general `.btn`, `.btn-*`, `.input`, `.badge`, `.kbd`, `.t-eyebrow`, `.t-h1`-`.t-h4`, `.t-body`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13-15)
  - **Parallel Group**: Wave 4

  **Acceptance Criteria**:
  - [ ] `npm run build:client` passes

  **Commit**: YES (groups with Wave 4 changes)

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for violations (Tailwind removed? kit-overrides removed?). Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Build + QA Verification** — `unspecified-high`
  Run `npm run build:client` and `npm run build:server` — both must pass. Then launch dev server and visually verify: app loads, all tabs render, dark mode toggles, sidebar works, chat renders. Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Build: [PASS/FAIL] | Visual: [PASS/FAIL] | Dark mode: [PASS/FAIL] | VERDICT`

---

## Commit Strategy

- **Tasks 1-2**: `feat(branding): replace logo with kolisachint minimal design`
- **Task 3**: `feat(branding): update html title and manifest to hoocowork`
- **Task 4**: `fix(build): resolve ts errors in server/binary-entry.ts`
- **Task 5**: `fix(ui): add keep-blur to mobile drawer backdrop`
- **Tasks 6-8**: `refactor(ui): migrate app layout, chat, and sidebar to kit css classes`
- **Tasks 9-12**: `refactor(ui): migrate settings, onboarding, mcp, plugins, taskmaster, prd to kit css classes`
- **Tasks 13-16**: `refactor(ui): migrate file-tree, git, shell, code-editor, auth to kit css classes`

---

## Success Criteria

### Verification Commands
```bash
npm run build:client  # Expected: exit 0, no errors
npm run build:server  # Expected: exit 0, no errors
```

### Final Checklist
- [ ] `public/logo.svg` replaced with minimal terminal-prompt design
- [ ] `public/favicon.svg` matches new minimal logo
- [ ] `index.html` title reads "HooCowork", theme-color is `#FAFAF7`
- [ ] `public/manifest.json` name reads "HooCowork"
- [ ] `npm run build:server` passes (server/binary-entry.ts fixed)
- [ ] AppContent.tsx backdrop has `.keep-blur` class
- [ ] All view components use kit CSS classes (not Tailwind utilities) where kit equivalents exist
- [ ] `npm run build:client` passes
- [ ] No visual regressions in migrated components
- [ ] Dark mode toggle still works
- [ ] kit-overrides.css still in place (not removed)
- [ ] Tailwind still in package.json (not removed)
