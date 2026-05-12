# Fix Chat Vertical Text Rendering

## TL;DR

> **Quick Summary**: Fix vertical text rendering issue in chat where each character appears on a new line. Root cause is a conflicting `block` class that overrides `flex` display.
> 
> **Deliverables**:
> - Fixed MainContent.tsx - Remove conflicting `block` class
> 
> **Estimated Effort**: Immediate (5 minutes)
> **Parallel Execution**: No - single task
> 

---

## Context

### Original Request
After the previous UI fixes, the user is experiencing a new issue where text in the chat renders vertically with each character on a new line.

### Root Cause Analysis (Completed)
The issue is in `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/MainContent.tsx` at line 125:

**Current code:**
```jsx
<div className={`h-full flex flex-col min-h-0 overflow-hidden ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
```

**Problem:** When `activeTab === 'chat'`, the conditional adds the `block` class. The `block` class sets `display: block` which **overrides** the `display: flex` from `flex flex-col`. This breaks the flex layout and causes the width constraint issue, forcing text to render vertically.

**Solution:** Remove `block` from the conditional, keeping only `hidden`:
```jsx
<div className={`h-full flex flex-col min-h-0 overflow-hidden ${activeTab === 'chat' ? '' : 'hidden'}`}>
```

---

## Work Objectives

### Core Objective
Fix the vertical text rendering by removing the conflicting CSS class.

### Concrete Deliverables
- `src/components/main-content/view/MainContent.tsx` - Line 125: Remove `block` from conditional class

### Definition of Done
- [ ] Text in chat renders horizontally (normally)
- [ ] Chat tab still shows/hides correctly
- [ ] No other layout regressions

### Must NOT Have (Guardrails)
- Do NOT change other logic
- Do NOT remove the `hidden` class
- Do NOT change other CSS

---

## Execution Strategy

### Single Task

- [ ] 1. Fix conflicting class in MainContent.tsx

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/MainContent.tsx`
  - Find line 125: `<div className={\`h-full flex flex-col min-h-0 overflow-hidden ${activeTab === 'chat' ? 'block' : 'hidden'}\`}>`
  - Change to: `<div className={\`h-full flex flex-col min-h-0 overflow-hidden ${activeTab === 'chat' ? '' : 'hidden'}\`}>`
  - The fix removes `block` from the conditional, keeping only `hidden`

  **Why this fixes it**:
  - `flex flex-col` sets `display: flex; flex-direction: column`
  - When `block` was added conditionally, it set `display: block`
  - `display: block` overrides `display: flex`, breaking the layout
  - Removing `block` keeps `display: flex` active, allowing proper text flow

  **Acceptance Criteria**:
  - [ ] Line 125 no longer contains `block` in the conditional
  - [ ] Conditional only adds `hidden` when tab is not active

  **QA Scenarios**:
  ```
  Scenario: Verify fix
    Tool: Read file
    Steps:
      1. Read MainContent.tsx line 125
      2. Verify no 'block' in conditional
      3. Verify 'hidden' still present
    Expected Result: ClassName uses flex only, no block override
  ```

  **Commit**: YES
  - Message: `fix(ui): remove conflicting block class causing vertical text`
  - Files: `src/components/main-content/view/MainContent.tsx`

---

## Success Criteria

### Final Checklist
- [ ] Text renders horizontally in chat
- [ ] Chat tab visibility works correctly
- [ ] No console errors
