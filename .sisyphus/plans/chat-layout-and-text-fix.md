# Fix Chat Layout and Vertical Text Rendering

## TL;DR

> **Quick Summary**: Fix remaining vertical text issue in chat and implement two-row chat header layout (files/shell row + session info row) based on design system.
> 
> **Deliverables**:
> - Fixed vertical text rendering in chat messages
> - New chat header component with two-row layout
> - Row 1: Files/shell context
> - Row 2: Session info (name, provider, status)
> 
> **Estimated Effort**: Medium (1-2 hours)
> 

---

## Context

### Original Request
1. Fix vertical text rendering in chat (still occurring after previous fixes)
2. Implement design system layout: Two-row header
   - Row 1: Chat shell/files context at top level
   - Row 2: Session information (session name, provider, badges)

### Root Cause Analysis - Vertical Text

**Problem**: Text renders vertically (one character per line) in chat messages.

**Investigation Results**:
1. ✅ Added `min-width: 0` to `.msg` grid - helped but didn't fully fix
2. ⚠️ Parent containers still have constraints:
   - `.chat-stream` has `display: flex; flex-direction: column` 
   - The message component uses both `.msg` and `.chat-message` classes
   - `.chat-message *` in index.css sets `max-width: 100%` on all children
   - Grid container at `.msg` level needs width constraint fix

**Root Cause**: The flex column layout in parent containers combined with CSS Grid `1fr` column causes width calculation issues. Even with `min-width: 0`, child elements need proper width constraints.

**Solution**: Add `width: 100%` and proper overflow handling to message containers.

### Design System Reference

From `/tmp/design-handoff/kolisachint-minimal-design-system/project/ui_kits/cloudcli/ChatInterface.jsx`:

```jsx
<section className="chat">
  <div className="chat-header">  {/* Row 2: Session info */}
    <div className="chat-title">
      <span className="chat-eyebrow">Session</span>
      <span className="chat-name">Session Name</span>
    </div>
    <div className="chat-meta">
      <Badge>model</Badge>
      <Badge>status</Badge>
    </div>
  </div>
  
  <div className="chat-stream">{messages}</div>
  <div className="composer">{input}</div>
</section>
```

Current implementation missing:
- Chat header with session info
- Files/shell context row (needs to be added)

---

## Work Objectives

### Core Objective
1. Fix vertical text rendering completely
2. Implement two-row chat header layout

### Concrete Deliverables
- `src/styles/kit.css` - Add/fix CSS for message width constraints
- `src/components/chat/view/ChatInterface.tsx` - Add chat header component
- `src/components/chat/view/subcomponents/ChatHeader.tsx` - New component for two-row header

### Definition of Done
- [ ] Text in chat renders horizontally with proper word wrapping
- [ ] Chat has two-row header layout
- [ ] Row 1 shows files/shell context
- [ ] Row 2 shows session info (name, provider, status badges)
- [ ] Build passes, tests pass
- [ ] Visual QA confirms fixes

### Must NOT Have (Guardrails)
- Do NOT break existing chat functionality
- Do NOT remove existing composer features
- Do NOT change message rendering logic

---

## Execution Strategy

### Wave 1: Fix Vertical Text Rendering

- [ ] 1. Add width constraints to message containers

  **What to do**:
  - Open `src/styles/kit.css`
  - Find `.msg` class (line 207)
  - Add `width: 100%` to ensure grid takes full width
  - Add `overflow: hidden` to prevent overflow issues
  - Find `.msg-body` class (line 210)
  - Add `min-width: 0` and `word-break: break-word`
  
  **Changes**:
  ```css
  /* Line 207 - .msg */
  .msg { 
    display: grid; 
    grid-template-columns: 24px 1fr; 
    gap: var(--s-2); 
    min-width: 0;
    width: 100%;
    overflow: hidden;
  }
  
  /* Line 210 - .msg-body */
  .msg-body { 
    font-size: var(--fs-base); 
    line-height: var(--lh-normal); 
    color: var(--ink);
    min-width: 0;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  ```

  **Acceptance Criteria**:
  - [ ] `.msg` has `width: 100%` and `overflow: hidden`
  - [ ] `.msg-body` has `min-width: 0` and word breaking

  **QA**:
  ```
  Scenario: Verify CSS changes
    Tool: Read kit.css
    Steps:
      1. Check .msg has width: 100%
      2. Check .msg-body has min-width: 0
  ```

  **Commit**: YES (with Task 2)

- [ ] 2. Fix index.css chat-message selectors

  **What to do**:
  - Open `src/index.css`
  - Find `.chat-message *` selector (around line 897)
  - Change from `max-width: 100%` to more specific targeting
  - Or add `width: 100%` to `.chat-message` itself
  
  **Changes**:
  ```css
  /* Line 882 - .chat-message */
  .chat-message {
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    width: 100%;
    min-width: 0;
  }
  
  /* Line 897 - Remove or modify the * selector */
  /* Instead of .chat-message *, use more specific selectors */
  ```

  **Acceptance Criteria**:
  - [ ] `.chat-message` has `width: 100%` and `min-width: 0`
  - [ ] Wildcard selector doesn't break layout

  **Commit**: YES (grouped with Task 1)

### Wave 2: Add Chat Header Component

- [ ] 3. Create ChatHeader component

  **What to do**:
  - Create new file `src/components/chat/view/subcomponents/ChatHeader.tsx`
  - Implement two-row layout:
    - Row 1: Files/shell context (placeholder for now)
    - Row 2: Session info (eyebrow, name, provider badges)
  - Use existing CSS classes from kit.css: `.chat-header`, `.chat-title`, `.chat-eyebrow`, `.chat-name`, `.chat-meta`
  
  **Component Structure**:
  ```tsx
  interface ChatHeaderProps {
    selectedSession: ProjectSession | null;
    provider: LLMProvider;
    selectedProject: Project | null;
  }
  
  function ChatHeader({ selectedSession, provider, selectedProject }: ChatHeaderProps) {
    return (
      <div className="chat-header">
        {/* Row 1: Files/Shell Context */}
        <div className="chat-context-row">
          {selectedProject && (
            <span className="chat-context-project">
              {selectedProject.name}
            </span>
          )}
        </div>
        
        {/* Row 2: Session Info */}
        <div className="chat-title-row">
          <div className="chat-title">
            <span className="chat-eyebrow">Session</span>
            <span className="chat-name">
              {selectedSession?.name || 'New Session'}
            </span>
          </div>
          <div className="chat-meta">
            <Badge>{provider}</Badge>
            <Badge tone="ok">connected</Badge>
          </div>
        </div>
      </div>
    );
  }
  ```

  **Acceptance Criteria**:
  - [ ] Component created and exported
  - [ ] Uses existing CSS classes
  - [ ] Shows session name and provider
  - [ ] Shows project context

  **Commit**: YES

- [ ] 4. Integrate ChatHeader into ChatInterface

  **What to do**:
  - Open `src/components/chat/view/ChatInterface.tsx`
  - Import ChatHeader component
  - Add ChatHeader before ChatMessagesPane in the JSX
  - Pass required props (selectedSession, provider, selectedProject)
  
  **Changes**:
  ```tsx
  import ChatHeader from './subcomponents/ChatHeader';
  
  // In render:
  <section className="chat">
    <ChatHeader
      selectedSession={selectedSession}
      provider={provider}
      selectedProject={selectedProject}
    />
    <ChatMessagesPane ... />
    <ChatComposer ... />
  </section>
  ```

  **Acceptance Criteria**:
  - [ ] ChatHeader imported and rendered
  - [ ] Props passed correctly
  - [ ] Layout shows header above messages

  **Commit**: YES

### Wave 3: Update CSS for Two-Row Header

- [ ] 5. Update chat-header CSS for two-row layout

  **What to do**:
  - Open `src/styles/kit.css`
  - Update `.chat-header` to support two rows
  - Add `.chat-context-row` and `.chat-title-row` classes
  
  **Changes**:
  ```css
  /* Line 197 - Update .chat-header */
  .chat-header {
    display: flex;
    flex-direction: column;
    padding: var(--s-3) var(--s-5);
    border-bottom: 1px solid var(--line);
    gap: var(--s-2);
  }
  
  .chat-context-row {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    font-size: var(--fs-sm);
    color: var(--ink-3);
  }
  
  .chat-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Header shows two rows
  - [ ] Context row shows project info
  - [ ] Title row shows session info and badges

  **Commit**: YES

### Wave 4: Verification

- [ ] 6. Build and test

  **What to do**:
  - Run `npm run build`
  - Run `npm test`
  - Verify chat text renders horizontally
  - Verify header shows two rows
  - Take screenshots for evidence

  **Acceptance Criteria**:
  - [ ] Build passes
  - [ ] Tests pass
  - [ ] Text renders horizontally
  - [ ] Header shows correctly

  **Commit**: NO

---

## Commit Strategy

- **1**: `fix(css): resolve vertical text rendering with width constraints`
  - Files: `src/styles/kit.css`, `src/index.css`
  
- **2**: `feat(ui): add two-row chat header with session info`
  - Files: `src/components/chat/view/subcomponents/ChatHeader.tsx`, `src/components/chat/view/ChatInterface.tsx`, `src/styles/kit.css`

---

## Success Criteria

### Verification Commands
```bash
npm run build
npm test
```

### Final Checklist
- [ ] Chat text renders horizontally (not vertically)
- [ ] Chat header shows two rows
- [ ] Row 1: Project/files context visible
- [ ] Row 2: Session name, provider, status badges
- [ ] Build passes
- [ ] Tests pass
