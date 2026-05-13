# Chat Section Design Alignment Plan

## Goal
Align the chat section user message component and composer with the Kolisachint Minimal Design System (handoff-4), ensuring a consistent paper-and-ink aesthetic with mono typography and the rust accent.

## Current State Analysis

### MessageComponent.tsx (User Message)
**Current implementation:**
- Uses `msg msg-user group w-full` structure
- Has copy controls and timestamp that appear on hover
- Contains image attachment grid
- Extra wrapper divs and conditional styling

**Design spec from handoff-4:**
```
.msg { display: grid; grid-template-columns: 24px 1fr; gap: var(--s-2); }
.msg-gutter { color: var(--ink-4); font-family: var(--font-mono); padding-top: 2px; }
.msg-user .msg-gutter { color: var(--accent); }
.msg-body { font-size: var(--fs-base); line-height: var(--lh-normal); color: var(--ink); }
```

### PromptInput.tsx (Shared UI)
**Current implementation:**
- Uses glassmorphism: `bg-card/80`, `backdrop-blur-sm`, `border-border/50`
- Complex nested structure with Header, Body, Footer, Tools, Button, Submit
- Tailwind-heavy styling with rounded-xl

**Design spec:**
- Flat paper surfaces (no blur)
- Hairline borders (`--line`)
- Tight radii (`--radius-2: 4px` max)

### ChatComposer.tsx
**Current implementation:**
- Uses PromptInput components from shared/view/ui
- Has additional permission banners, status indicators
- Complex conditional rendering for various states

## Files to Modify

### 1. `/src/components/chat/view/subcomponents/MessageComponent.tsx`
**Line range:** 80-130 (user message section)

**Changes:**
- Simplify user message structure to match kit pattern
- Remove excessive wrapper divs and conditional hover states for copy controls
- Ensure timestamp/copy controls follow minimal design (subtle, not distracting)
- Keep image attachment grid but ensure it aligns with design spacing

**Before:**
```tsx
{message.type === 'user' ? (
  <div className="msg msg-user group w-full">
    <div className="msg-gutter">❯</div>
    <div className="msg-body">
      <div className="whitespace-pre-wrap break-words">{message.content}</div>
      {/* ... images ... */}
      {(shouldShowUserCopyControl || formattedTime) && (
        <div className="mt-1 flex items-center gap-2 text-[var(--fs-xs)] text-[var(--ink-4)] opacity-0 transition-opacity group-hover:opacity-100">
          {/* copy controls */}
        </div>
      )}
    </div>
  </div>
) : ...}
```

**After (align with design):**
```tsx
{message.type === 'user' ? (
  <div className="msg msg-user">
    <div className="msg-gutter">❯</div>
    <div className="msg-body">
      <div className="whitespace-pre-wrap break-words">{message.content}</div>
      {message.images && message.images.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {/* images */}
        </div>
      )}
    </div>
  </div>
) : ...}
```

### 2. `/src/shared/view/ui/PromptInput.tsx`
**Line range:** 35-50 (root form styling)

**Changes:**
- Remove glassmorphism (`backdrop-blur-sm`, `bg-card/80`)
- Replace with flat paper surface (`bg-[var(--paper)]`)
- Use hairline border (`border-[var(--line)]`)
- Reduce border radius to match kit (`rounded-[var(--radius-2)]`)

**Before:**
```tsx
className={cn(
  'relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:border-primary/30 focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/15',
  className
)}
```

**After:**
```tsx
className={cn(
  'relative overflow-hidden rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper)] transition-all duration-200 focus-within:border-[var(--ink)]',
  className
)}
```

### 3. `/src/shared/view/ui/PromptInput.tsx` - Textarea
**Line range:** 75-85

**Changes:**
- Remove placeholder styling that's too faint
- Ensure text uses `--ink` variable

### 4. `/src/shared/view/ui/PromptInput.tsx` - Footer
**Line range:** 95-105

**Changes:**
- Use `--line` for border instead of `border-border/30`

### 5. `/src/components/chat/view/subcomponents/ChatComposer.tsx`
**Line range:** 180-220 (PromptInput usage)

**Changes:**
- Review and simplify the composer structure if needed
- Ensure permission banners use kit styling (badges from kit)
- Remove any remaining Tailwind color classes that don't map to kit tokens

### 6. `/src/styles/kit-overrides.css`
**Add new rules:**

```css
/* Ensure PromptInput follows kit design */
[data-slot="prompt-input"] {
  background: var(--paper) !important;
  border-color: var(--line) !important;
  border-radius: var(--radius-2) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

[data-slot="prompt-input"]:focus-within {
  border-color: var(--ink) !important;
  box-shadow: none !important;
}

[data-slot="prompt-input-footer"] {
  border-color: var(--line) !important;
}
```

### 7. `/src/components/chat/view/subcomponents/MessageComponent.tsx` - Tool Messages
**Line range:** 150-300

**Changes:**
- Review tool message rendering for consistency with `msg-tool` class in kit
- Ensure tool headers use `tool-head`, `tool-glyph`, `tool-name`, `tool-summary` pattern
- Badge component should use kit badge classes

## New Files

None required - changes are modifications to existing files.

## Design Tokens Reference (from colors_and_type.css)

### Colors:
- `--paper`: #FAFAF7 (bone - primary surface)
- `--paper-2`: #F2F2EC (chalk - recessed)
- `--paper-3`: #ECECE6 (code blocks)
- `--ink`: #111110 (primary text)
- `--ink-2`: #36362F (secondary text)
- `--ink-3`: #6B6B66 (muted text)
- `--ink-4`: #9A9A93 (placeholder)
- `--line`: #DEDED7 (hairline borders)
- `--accent`: #C2603A (rust - CTA)

### Typography:
- `--fs-base`: 13px (body)
- `--fs-xs`: 11px (micro labels)
- `--fs-sm`: 12px (secondary)
- `--font-mono`: 'JetBrains Mono', ui-monospace, ...

### Spacing:
- `--s-2`: 8px
- `--s-3`: 12px
- `--s-4`: 16px
- `--s-5`: 24px

### Geometry:
- `--radius-1`: 2px (default)
- `--radius-2`: 4px (buttons, cards)
- `--radius-3`: 6px (max)

## Tests

### Visual Regression Tests:
1. User message renders with `❯` gutter in accent color
2. Assistant message renders with `·` gutter in ink-4 color
3. Tool messages have proper card styling with hairline border
4. Composer has flat paper surface (no blur)
5. Focus states use ink color, not primary blue
6. No glassmorphism/backdrop-blur in chat components

### Functional Tests:
1. Message copy control still works (even if styled differently)
2. Image attachments display correctly
3. Permission banners render properly
4. Composer submit works with new styling
5. All existing keyboard shortcuts preserved

## Verification Commands

```bash
# Build the project
npm run build

# Run linting
npm run lint

# Type check
npx tsc --noEmit

# Visual verification - start dev server and check:
# 1. User message gutter color is rust accent
# 2. Composer has no blur/glass effect
# 3. Borders are hairline (1px, subtle)
# 4. Typography is JetBrains Mono
npm run dev
```

## Implementation Notes

1. **kit.css already has the target styles** - The CSS rules for `msg`, `msg-user`, `msg-gutter`, `msg-body`, `composer`, etc. are already defined in `/src/styles/kit.css`. The React components need to align their markup structure and remove conflicting Tailwind classes.

2. **PromptInput is shared** - Changes to PromptInput.tsx will affect other parts of the app. Ensure the changes are broadly compatible or add kit-specific overrides.

3. **Copy controls** - The design emphasizes minimalism. The copy control can be simplified or moved to a context menu instead of hover-reveal.

4. **Permission banners** - These should use kit Badge component variants (`badge-warn`, `badge-ok`, etc.) for consistency.

5. **Backward compatibility** - The `kit-overrides.css` file exists specifically to enforce kit styling without breaking existing component structures.

## Rollback Plan

If issues arise:
1. Revert changes to `PromptInput.tsx` (shared component)
2. Keep `kit-overrides.css` additions as they are additive only
3. Restore original MessageComponent.tsx structure
