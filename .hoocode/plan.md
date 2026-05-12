# UI Fix Plan

## Goal
Fix chat text rendering issue (vertical text), sidebar scrolling, and position settings/version at the bottom of the sidebar.

## Issues Identified

### 1. Chat Vertical Text Rendering
**Problem**: Text in chat messages is rendering vertically with one character per line (as seen in screenshot with "OMTE NATI TTO RR" text stacked vertically).

**Root Cause**: The sidebar in the main layout uses `className="sidebar"` but the kit.css `.sidebar` class has `flex: 0 0 280px` which should apply to the sidebar itself, not a wrapper div. The wrapper div in AppContent.tsx creates a flex child that doesn't properly constrain the sidebar width, causing content in the main area to be squished or have incorrect width calculations.

**Files to modify**:
- `src/components/app/AppContent.tsx` (line ~125): The wrapper div should not use the `sidebar` class, or the sidebar component should directly use the class

### 2. Left Sidebar Scrolling Not Working
**Problem**: The sidebar doesn't scroll when there are many projects.

**Root Cause**: The `.sidebar-projects` class has `flex: 1; min-height: 0; overflow-y: auto` which should work, but the parent hierarchy needs proper flex constraints. The issue is that the sidebar wrapper in AppContent doesn't enforce the height constraint properly.

**Files to modify**:
- `src/styles/kit.css`: Ensure `.sidebar` has proper height constraints
- `src/components/app/AppContent.tsx`: Fix the sidebar wrapper structure

### 3. Settings/Version Position
**Problem**: Settings and version are not at the bottom of the sidebar.

**Root Cause**: The `.sidebar-foot` has `margin-top: auto` which requires the parent to be a flex container with `flex-direction: column` and proper height. The sidebar structure is correct in kit.css, but the wrapper issue affects this.

**Files to modify**:
- `src/components/sidebar/view/SidebarContent.tsx`: Ensure the aside element uses the correct structure

## Implementation Plan

### Changes Required

#### File: `src/components/app/AppContent.tsx`
**Line ~125** (desktop sidebar wrapper):
- Current: `<div className="sidebar">`
- Issue: This creates a nested structure where the Sidebar component also renders an `<aside className="sidebar">`
- Fix: Remove the wrapper div or change it to not use the `sidebar` class

```
Change:
<div className="sidebar">
  <Sidebar {...sidebarSharedProps} />
</div>

To:
<Sidebar {...sidebarSharedProps} />
```

#### File: `src/styles/kit.css`
**Verify sidebar styles are correct**:
- `.sidebar` should have: `display: flex; flex-direction: column; overflow: hidden;`
- `.sidebar-projects` should have: `flex: 1; min-height: 0; overflow-y: auto;`
- `.sidebar-foot` should have: `margin-top: auto;`

These are already correct, so no changes needed here.

#### File: `src/components/sidebar/view/SidebarContent.tsx`
**Verify the aside element** (line ~99):
- Currently renders `<aside className="sidebar">` which is correct
- No changes needed if AppContent fix is applied

## Verification Steps

1. **Start the server**: `npm run server:dev`
2. **Start the client**: `npm run client`
3. **Test sidebar scrolling**: Add many projects or reduce window height to verify scrolling works
4. **Test settings position**: Verify settings button and version are at the bottom of the sidebar
5. **Test chat rendering**: Open a chat session and verify text renders horizontally, not vertically

## Commands

```bash
# Kill existing servers
pkill -f "tsx.*server/index.js" 2>/dev/null

# Start server with logs
npm run server:dev

# In another terminal, start client
npm run client
```

## Expected Behavior After Fix

1. **Sidebar**: Properly scrolls when content exceeds viewport height
2. **Footer**: Settings button and version text stay at the bottom of the sidebar
3. **Chat**: All text renders horizontally with proper word wrapping
