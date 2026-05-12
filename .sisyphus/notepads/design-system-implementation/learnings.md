# Design System Implementation - Learnings

## 2026-05-12: keep-blur escape hatch

- **File**: `src/components/app/AppContent.tsx` (line 153)
- **Change**: Added `keep-blur` class to the mobile drawer backdrop overlay
- **Why**: `kit-overrides.css` uses `.backdrop-blur-sm:not(.keep-blur) { backdrop-filter: none !important; }` to kill blur on Tailwind's backdrop utility classes. The mobile drawer scrim needs blur to visually separate the drawer from main content, so it needs the `keep-blur` escape hatch.
- **Pattern**: Any element using `backdrop-blur-*` that should preserve its blur effect must also include `keep-blur` in its className.

## 2026-05-12: server/tsconfig.json uses NodeNext moduleResolution

- **File**: `server/binary-entry.ts`
- **Change**: Fixed 3 TS build errors
- **Findings**:
  - `server/tsconfig.json` uses `"moduleResolution": "NodeNext"` — this forces explicit `.js` extensions in relative imports (the compiled JS extension, not the source `.ts`)
  - JSON imports require `with { type: 'json' }` assertion syntax
  - Bun globals accessed at runtime need `@ts-expect-error` since no `@types/bun` is installed
- **Pattern**: For relative imports in server code, use `.js` extension (not `.ts`, not bare). JSON imports need `with { type: 'json' }` assertion.

### Task 6 — Migrate AppContent.tsx layout to kit classes

**File**: `src/components/app/AppContent.tsx`
**Build**: `npm run build:client` passes (exit 0)

**Replacements made:**

| Line | Before | After | Kit class definition |
|------|--------|-------|---------------------|
| 144 | `h-full flex-shrink-0 border-r border-border/50` | `sidebar` | `.sidebar { flex: 0 0 280px; border-right: 1px solid var(--line); ... }` |
| 176 | `flex min-w-0 flex-1 flex-col` | `main` | `.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }` |

**Kept as-is (no kit equivalent):**
- Root container: `fixed inset-0 flex bg-background` — structural positioning for keyboard handling
- Mobile drawer overlay: `fixed inset-0 z-50 flex transition-all duration-150 ease-out`
- Scrim: `fixed inset-0 bg-background/60 backdrop-blur-sm keep-blur transition-opacity...`
- Mobile drawer panel: `relative h-full w-[85vw] max-w-sm transform border-r border-border/40 bg-card...`

**Key insight**: `.sidebar` on the wrapper div provides `flex: 0 0 280px` which is more specific than the original `flex-shrink-0` (it also prevents grow and sets basis). The border-right uses `var(--line)` which is the solid hairline token — visually equivalent to `border-border/50`.

### Task 8 — Migrate sidebar view files to kit CSS classes

**Files modified:**
- `src/components/sidebar/view/subcomponents/SidebarModals.tsx`
- `src/components/sidebar/view/subcomponents/SidebarCollapsed.tsx`
- `src/components/sidebar/view/subcomponents/GitHubStarBadge.tsx`
- `src/components/sidebar/view/subcomponents/TaskIndicator.tsx`

**Build**: `npm run build:client` passes (exit 0)

**SidebarModals.tsx replacements:**
| Change | Before | After |
|--------|--------|-------|
| Card bg | `border border-border bg-card` | `border` + `style={{ background: 'var(--paper)' }}` |
| Heading text | `text-lg font-semibold text-foreground` | `text-lg font-semibold` (inherits) |
| Body text | `text-sm text-muted-foreground` | `text-sm` + `style={{ color: 'var(--ink-3)' }}` |
| Emphasized text | `font-medium text-foreground` | `font-medium` (inherits) |
| Footer bg | `border-t border-border bg-muted/30` | `border-t` + `style={{ background: 'var(--paper-2)' }}` |

**SidebarCollapsed.tsx replacements:**
| Change | Before | After |
|--------|--------|-------|
| Container bg | `bg-background/80 backdrop-blur-sm` | `style={{ background: 'var(--paper)' }}` |
| Button hover | `hover:bg-accent/80` | `hover:bg-[var(--paper-3)]` |
| Icon color | `text-muted-foreground` | `style={{ color: 'var(--ink-3)' }}` |

**GitHubStarBadge.tsx:**
| Change | Before | After |
|--------|--------|-------|
| Added `.badge` class | (none) | `badge` added | 

**TaskIndicator.tsx:**
| Change | Before | After |
|--------|--------|-------|
| Default state colors | `text-muted-foreground bg-muted` | `text-[var(--ink-3)] bg-[var(--paper-2)]` |

**Already migrated (no changes needed):**
- `SidebarContent.tsx` — already uses `sidebar`, `sidebar-header`, `brand`, `brand-mark`, `brand-name`, `sidebar-search`, `sidebar-eyebrow`, `sidebar-projects`, `sidebar-foot`, `foot-row`, `icon-btn`, `kbd`, `badge`, `btn`, `btn-sm`, `btn-ghost`, `btn-outline`
- `SidebarProjectItem.tsx` — already uses `project-block`, `project-row`, `project-chev`, `project-name`, `project-branch`, `session-list`, `session-row`, `session-title`, `tree-glyph`, `session-empty`, `icon-btn`, `input`
- `SidebarSessionItem.tsx` — already uses `session-row`, `session-title`, `session-meta`, `tree-glyph`, `status-dot`, `dot-busy`, `dot-off`, `icon-btn`, `input`
- `Sidebar.tsx` — pure orchestration component, no HTML elements

**Kept as Tailwind (no clear kit equivalent):**
- Layout/positioning: `absolute`, `flex`, `items-center`, `justify-center`, `gap-*`, `p-*`, `m-*`
- Icon sizing: `h-3 w-3`, `h-4 w-4`
- Interactive utilities: `hidden group-hover/*:flex`, `transition-colors`, `animate-spin`
- Responsive: `hidden md:inline-flex`
- Group hover patterns: `group-hover:text-foreground`, `group-hover/*:flex`

### Task 7 — Migrate chat view files to kit CSS classes

**Files modified (8 of 14):**
- `src/components/chat/view/ChatInterface.tsx` — simplified `className="chat flex h-full flex-col"` to `className="chat"` (`.chat` already provides flex column layout)
- `src/components/chat/view/subcomponents/ChatMessagesPane.tsx` — simplified `chat-stream min-h-0 flex-1 overflow-y-auto` to `chat-stream min-h-0` (`.chat-stream` already provides flex-1 and overflow-y-auto)
- `src/components/chat/view/subcomponents/MessageComponent.tsx` — added `.msg`, `.msg-user`/`.msg-assistant`, `.msg-gutter`, `.msg-body`, `.msg-tool`, `.tool-head` to message structure
- `src/components/chat/view/subcomponents/ChatComposer.tsx` — added `.composer-hint` to hint text
- `src/components/chat/view/subcomponents/ClaudeStatus.tsx` — used `.status-dot` + `.dot-ok` for status indicator
- `src/components/chat/view/subcomponents/PiTreeChat.tsx` — used `.msg-tool` + `.tool-head` for branch point UI
- `src/components/chat/view/subcomponents/Markdown.tsx` — used `.badge.badge-default` for language label
- `src/components/chat/view/subcomponents/TokenUsagePie.tsx` — replaced hardcoded colors (`#3b82f6`, `#f59e0b`, `#ef4444`) with design system tokens (`var(--info)`, `var(--warn)`, `var(--err)`)

**Key constraints encountered:**
1. **`chat-message` class MUST be preserved** — it's referenced by `useChatSessionState.ts` for `querySelector('.chat-message')` AND defined in `src/index.css` with critical touch-action, word-wrap, and max-width rules
2. **`cn()` calls must be handled carefully** — only change class strings within the function, not the conditional logic
3. **Animation classes preserved** — `animate-spin`, `animate-pulse`, `transition-*` kept as-is
4. **CSS variable usage is already design-system-compatible** — many files already use `var(--ink)`, `var(--paper)`, `var(--line)` etc. directly; these are part of the kit design system and don't need migration

**Files with minimal/no changes (already design-system-compatible or using shared components):**
- `PermissionRequestsBanner.tsx` — uses kit `Confirmation` components
- `ProviderSelectionEmptyState.tsx` — already uses `.cli-select`, `.cli-eyebrow`
- `ThinkingModeSelector.tsx` — already uses CSS variables extensively
- `ImageAttachment.tsx` — minimal, uses CSS variables
- `MessageCopyControl.tsx` — uses Tailwind for small UI, no kit equivalents
- `CommandMenu.tsx` — complex component with custom `command-*` classes

**Build:** `npm run build:client` passes (exit 0)


## Task 11: MCP & Plugins view migration

- **McpServers.tsx**: Applied `.mcp-list` to the server list container (replacing `space-y-2`), simplified `.mcp-row` usage by removing redundant border/rounded/bg classes (now provided by `.mcp-list`). Kept `p-4` for row content padding.
- **McpServerFormModal.tsx**: Applied `.input` class to all 5 `<textarea>` elements, replacing verbose Tailwind class strings. The JSON textarea keeps conditional error border via `jsonValidationError ? 'border-[var(--err)]' : ''`.
- **PluginSettingsTab.tsx**: 
  - Replaced custom ToggleSwitch implementation with kit `.toggle`, `.toggle-track`, `.toggle-thumb` classes — much cleaner HTML.
  - Applied `.plugin-glyph` to icon containers, `.plugin-name` to display names, `.plugin-desc` to descriptions across all three card components (PluginCard, StarterPluginCard, TerminalPluginCard).
- **PluginIcon.tsx** and **PluginTabContent.tsx**: No Tailwind classes to migrate (minimal JSX, no style classes).
- Build passes cleanly with `npm run build:client`.

## 2026-05-12: Task 9 — Migrate settings view files to kit CSS classes

**Files modified (18 files):**

**Build**: `npm run build:client` passes (exit 0)

**Replacements summary:**

| Pattern | Replacement | Notes |
|---------|-------------|-------|
| `text-foreground` | removed (inherits) or `text-[var(--ink)]` | Text inherits color from parent in most cases |
| `text-muted-foreground` | `style={{ color: 'var(--ink-3)' }}` or `text-[var(--ink-3)]` | Used inline style for unique cases, Tailwind arbitrary value for batch replacements |
| `border-border` | `style={{ borderColor: 'var(--line)' }}` or `border-[var(--line)]` | |
| `bg-background`, `bg-card` | `style={{ background: 'var(--paper)' }}` or `bg-[var(--paper)]` | |
| `bg-muted`, `bg-card/50` | `bg-[var(--paper-2)]` | Muted background surface |
| `bg-muted/50`, `bg-accent` | `bg-[var(--paper-3)]` | Hover/secondary surface |
| `bg-primary` | `style={{ background: 'var(--accent)' }}` | Accent replaces primary |
| `text-primary` | `style={{ color: 'var(--accent)' }}` | Accent replaces primary |
| `border-primary` | `border-[var(--accent)]` | |
| `bg-foreground/60`, `bg-foreground/80` | `bg-[var(--ink-3)]` | |
| `text-primary-foreground` | `style={{ color: 'var(--paper)' }}` | |

**Kit CSS classes applied:**
- `.t-eyebrow` — **SettingsSection.tsx** section title (replaced `text-sm font-semibold uppercase tracking-wider text-muted-foreground`)
- `.t-h3` — **ApiKeysSection.tsx**, **GithubCredentialsSection.tsx** titles
- `.badge-ok` — **AboutTab.tsx**, **AccountContent.tsx**, **VersionInfoSection.tsx** connected/update badges
- `.badge-default` — **AccountContent.tsx** disconnected badge
- `.btn`, `.btn-accent` — **AccountContent.tsx** login button

**Key constraints encountered:**
1. **`SettingsToggle.tsx`**: Could NOT use `.toggle` kit class — the component uses `button[role="switch"]` pattern while the kit toggle requires `label > input[type="checkbox"]` structure. The CSS selectors (`.toggle input:checked ~ .toggle-track`) would not match. Kept button-based structure with CSS variable color replacements.
2. **Inline styles vs Tailwind arbitrary values**: For one-off replacements, `style={{ color: 'var(--...)': '1px solid var(--line)' }}` works better. For batch replacements across many occurrences, `text-[var(--ink-3)]` was more efficient.
3. **Template literal classNames**: Files like `PermissionsContent.tsx` use template literals (`\`\``) for conditional classes — replaceAll worked but needed post-verification to check for syntax issues.
4. **`replaceAll` caution**: Using `replaceAll` on a full string like `border-t border-border/50 pt-4` breaks when the surrounding quote `"` is still present. Need to include the surrounding context in the oldString to match exactly.

**Not migrated to kit (kept as Tailwind or inline style):**
- Icon sizing: `h-4 w-4`, `h-5 w-5`, `h-3 w-3`
- Layout utilities: `flex`, `items-center`, `justify-between`, `gap-*`
- Spacing: `p-*`, `px-*`, `py-*`, `m-*`, `space-y-*`
- Responsive: `md:flex`, `hidden`, `md:p-6`, etc.
- Interactive: `transition-colors`, `hover:underline`, `cursor-pointer`
- Font sizing: `text-sm`, `text-xs`, `text-lg`, `text-base`
- Font weight: `font-medium`, `font-semibold`
