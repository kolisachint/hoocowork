# UI Rendering Fixes - Work Plan

## TL;DR

> **Quick Summary**: Fix 5 critical UI rendering issues: chat scrolling, sidebar scrolling, top bar overlap, git icon rendering, and text overlapping. All issues stem from CSS flex/grid layout problems and missing constraints.
> 
> **Deliverables**:
> - Fixed chat scrolling in `kit.css` and `MainContent.tsx`
> - Fixed sidebar scrolling in `kit.css`
> - Fixed top bar overlap in `kit.css` and `MainContentHeader.tsx`
> - Fixed git fetch/push icon sizing in `kit-extra.css`
> - Fixed text overlapping in `FileChangeItem.tsx`
> 
> **Estimated Effort**: Short (1-2 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Wave 1 (CSS fixes) → Wave 2 (Component fixes) → Wave 3 (Verification)

---

## Context

### Original Request
User reported 5 UI rendering issues in the HoocoWork application:
1. Scrolling rendering issue in chat
2. Scrolling issue in left sidebar
3. Overlapping issue in top bar where chat shell exists
4. Source control git fetch and git push icons not rendered
5. Displayed text overlapping

### Root Cause Analysis (Completed)
An explore agent analyzed 8 files and identified specific CSS/layout issues causing each bug:

**Key Findings**:
- **Chat scrolling**: Missing `min-height: 0` on flex containers breaks scroll containment chain
- **Sidebar scrolling**: Same `min-height: 0` issue on `.sidebar-projects`
- **Top bar overlap**: Missing `overflow: hidden` on `.main` container + no z-index on `.topbar`
- **Git icons**: Fixed 22px width on `.git-act` clips icon+text buttons
- **Text overlap**: `flex` class overrides CSS `display: grid` on `.git-file`

### Technical Approach
Minimal surgical fixes to CSS and component classNames. No logic changes. All fixes are additive (adding missing properties) or corrective (removing conflicting classes).

---

## Work Objectives

### Core Objective
Fix all 5 UI rendering issues with minimal, targeted CSS and component changes.

### Concrete Deliverables
- `src/styles/kit.css` - Add missing flex constraints
- `src/styles/kit-extra.css` - Fix button sizing
- `src/components/main-content/view/MainContent.tsx` - Fix chat wrapper layout
- `src/components/main-content/view/subcomponents/MainContentHeader.tsx` - Add sticky positioning
- `src/components/git-panel/view/changes/FileChangeItem.tsx` - Remove conflicting flex class

### Definition of Done
- [ ] Chat scrolls smoothly without layout shifts
- [ ] Sidebar scrolls properly with long project lists
- [ ] Top bar stays fixed, no content overlaps it
- [ ] Git fetch/push icons render correctly with text labels
- [ ] File change items display without text overlapping
- [ ] All visual regression tests pass

### Must Have
- All 5 bugs fixed
- No visual regressions in other areas
- Tests pass

### Must NOT Have (Guardrails)
- Do NOT change component logic or behavior
- Do NOT refactor unrelated code
- Do NOT add new dependencies
- Do NOT change color schemes or visual design

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (no TDD needed for CSS fixes)
- **Framework**: Existing project test setup
- **Visual testing**: Manual QA with Playwright screenshots

### QA Policy
Every task includes Agent-Executed QA scenarios. Evidence saved to `.sisyphus/evidence/`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - CSS foundation fixes):
├── Task 1: Fix chat scrolling - add min-height:0 to .chat [quick]
├── Task 2: Fix sidebar scrolling - add min-height:0 to .sidebar-projects [quick]
├── Task 3: Fix top bar overlap - add overflow:hidden and z-index [quick]
└── Task 4: Fix git button sizing - update .git-act dimensions [quick]

Wave 2 (After Wave 1 - Component fixes):
├── Task 5: Fix chat wrapper layout in MainContent.tsx [quick]
├── Task 6: Add sticky positioning to MainContentHeader.tsx [quick]
└── Task 7: Remove conflicting flex class from FileChangeItem.tsx [quick]

Wave 3 (After Wave 2 - Verification):
├── Task 8: Visual QA - chat scrolling [unspecified-high]
├── Task 9: Visual QA - sidebar scrolling [unspecified-high]
├── Task 10: Visual QA - top bar and git icons [unspecified-high]
└── Task 11: Final verification - all issues resolved [unspecified-high]

Wave FINAL (After ALL tasks - 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1-4 → Task 5-7 → Task 8-11 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix
- **1-4**: - - 5-7, 1
- **5-7**: 1-4 - 8-11, 2
- **8-11**: 5-7 - 3
- **F1-F4**: 8-11 - user okay

### Agent Dispatch Summary
- **1**: **4** - T1-T4 → `quick`
- **2**: **3** - T5-T7 → `quick`
- **3**: **4** - T8-T11 → `unspecified-high`
- **FINAL**: **4** - F1-F4 → mixed

---

## TODOs

- [x] 1. Fix chat scrolling in kit.css

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/styles/kit.css`
  - Find line 195: `.chat { flex: 1; display: flex; flex-direction: column; min-width: 0; }`
  - Add `min-height: 0;` to the properties
  - The fix: `.chat { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }`

  **Must NOT do**:
  - Do NOT remove any existing properties
  - Do NOT change any other CSS rules

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 5 (depends on this CSS change)
  - **Blocked By**: None

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/styles/kit.css:195` - .chat class definition
  - Root cause: Missing min-height:0 breaks flex shrink chain

  **Acceptance Criteria**:
  - [ ] kit.css line 195 includes `min-height: 0`

  **QA Scenarios**:
  ```
  Scenario: Verify CSS change applied
    Tool: Bash (cat/grep)
    Steps:
      1. grep -n "min-height: 0" src/styles/kit.css | grep "\.chat"
    Expected Result: Output shows line with .chat and min-height: 0
    Evidence: .sisyphus/evidence/task-1-css-chat-min-height.txt
  ```

  **Commit**: YES
  - Message: `fix(css): add min-height:0 to .chat for proper scroll containment`
  - Files: `src/styles/kit.css`

- [x] 2. Fix sidebar scrolling in kit.css

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/styles/kit.css`
  - Find line 55: `.sidebar-projects { flex: 1; overflow-y: auto; ... }`
  - Add `min-height: 0;` to the properties
  - The fix: `.sidebar-projects { flex: 1; overflow-y: auto; min-height: 0; ... }`

  **Must NOT do**:
  - Do NOT change the overflow-y property
  - Do NOT modify other sidebar styles

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/styles/kit.css:55` - .sidebar-projects class
  - Root cause: Same flex shrink issue as chat

  **Acceptance Criteria**:
  - [ ] kit.css line 55 includes `min-height: 0`

  **QA Scenarios**:
  ```
  Scenario: Verify CSS change applied
    Tool: Bash (grep)
    Steps:
      1. grep -n "min-height: 0" src/styles/kit.css | grep "sidebar-projects"
    Expected Result: Output shows line with .sidebar-projects and min-height: 0
    Evidence: .sisyphus/evidence/task-2-css-sidebar-min-height.txt
  ```

  **Commit**: YES (group with Task 1)
  - Message: `fix(css): add min-height:0 to .sidebar-projects for scrolling`
  - Files: `src/styles/kit.css`

- [x] 3. Fix top bar overlap in kit.css

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/styles/kit.css`
  - Find line 106: `.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }`
  - Add `overflow: hidden;` to prevent content overflow
  - The fix: `.main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }`
  - Find line 107-112: `.topbar { ... }`
  - Add `position: sticky; top: 0; z-index: 20;` or `position: relative; z-index: 10;`

  **Must NOT do**:
  - Do NOT use `position: fixed` (would break layout)
  - Do NOT remove existing layout properties

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/styles/kit.css:106` - .main class
  - `/Users/sachinkoli/github/hoocowork/src/styles/kit.css:107-112` - .topbar class

  **Acceptance Criteria**:
  - [ ] kit.css line 106 includes `overflow: hidden`
  - [ ] kit.css .topbar has z-index and positioning

  **QA Scenarios**:
  ```
  Scenario: Verify CSS changes
    Tool: Bash (grep)
    Steps:
      1. grep -A2 "\.main {" src/styles/kit.css | grep "overflow"
      2. grep -A5 "\.topbar {" src/styles/kit.css | grep -E "z-index|position"
    Expected Result: Both commands show the new properties
    Evidence: .sisyphus/evidence/task-3-css-topbar-overlap.txt
  ```

  **Commit**: YES (group with Tasks 1-2)
  - Message: `fix(css): add overflow:hidden and z-index to prevent top bar overlap`
  - Files: `src/styles/kit.css`

- [x] 4. Fix git button sizing in kit-extra.css

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/styles/kit-extra.css`
  - Find lines 64-69: `.git-act { width: 22px; height: 22px; ... }`
  - Change fixed width/height to min-width/min-height with padding
  - The fix: `.git-act { min-width: 22px; min-height: 22px; padding: 4px 8px; ... }` (remove fixed width/height)

  **Must NOT do**:
  - Do NOT completely remove the sizing - buttons still need minimum size
  - Do NOT change other .git-* classes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 10 (visual QA for git icons)
  - **Blocked By**: None

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/styles/kit-extra.css:64-69` - .git-act class
  - `/Users/sachinkoli/github/hoocowork/src/components/git-panel/view/GitPanelHeader.tsx:203-235` - buttons using .git-act

  **Acceptance Criteria**:
  - [ ] kit-extra.css .git-act uses min-width/min-height instead of width/height
  - [ ] kit-extra.css .git-act has appropriate padding

  **QA Scenarios**:
  ```
  Scenario: Verify CSS changes
    Tool: Bash (grep)
    Steps:
      1. grep -A5 "\.git-act {" src/styles/kit-extra.css
    Expected Result: Shows min-width/min-height and padding, not fixed width/height
    Evidence: .sisyphus/evidence/task-4-css-git-button-sizing.txt
  ```

  **Commit**: YES (group with Tasks 1-3)
  - Message: `fix(css): allow git action buttons to size based on content`
  - Files: `src/styles/kit-extra.css`

- [x] 5. Fix chat wrapper layout in MainContent.tsx

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/MainContent.tsx`
  - Find line 125: `<div className="h-full ${activeTab === 'chat' ? 'block' : 'hidden'}">`
  - Change to: `<div className="h-full flex flex-col min-h-0 overflow-hidden ${activeTab === 'chat' ? 'block' : 'hidden'}">`
  - Or better, replace the conditional class approach with proper flex container

  **Must NOT do**:
  - Do NOT change the conditional rendering logic
  - Do NOT affect other tabs (file-tree, git-panel, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1 CSS fix)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/MainContent.tsx:125` - chat tab wrapper
  - Depends on: Task 1 (CSS .chat fix)

  **Acceptance Criteria**:
  - [ ] MainContent.tsx line 125 uses flex layout classes
  - [ ] Chat tab still conditionally renders correctly

  **QA Scenarios**:
  ```
  Scenario: Verify component change
    Tool: Bash (grep)
    Steps:
      1. grep -n "flex flex-col min-h-0" src/components/main-content/view/MainContent.tsx
    Expected Result: Shows the line with the new classes
    Evidence: .sisyphus/evidence/task-5-main-content-wrapper.txt
  ```

  **Commit**: YES (group with Task 6-7)
  - Message: `fix(ui): use flex container for chat tab to enable proper scrolling`
  - Files: `src/components/main-content/view/MainContent.tsx`

- [x] 6. Add sticky positioning to MainContentHeader.tsx

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/subcomponents/MainContentHeader.tsx`
  - Find line 39: `<div className="topbar pwa-header-safe">`
  - Add sticky positioning classes: `<div className="topbar pwa-header-safe sticky top-0 z-20">`
  - Or if using CSS instead of Tailwind, add inline styles or update kit.css

  **Must NOT do**:
  - Do NOT use `fixed` positioning (would break layout flow)
  - Do NOT remove existing classes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 3 CSS fix)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 10
  - **Blocked By**: Task 3

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/subcomponents/MainContentHeader.tsx:39` - topbar div
  - Depends on: Task 3 (CSS overflow fix)

  **Acceptance Criteria**:
  - [ ] MainContentHeader.tsx line 39 includes sticky and z-index classes

  **QA Scenarios**:
  ```
  Scenario: Verify component change
    Tool: Bash (grep)
    Steps:
      1. grep -n "sticky top-0 z-20" src/components/main-content/view/subcomponents/MainContentHeader.tsx
    Expected Result: Shows the line with sticky positioning
    Evidence: .sisyphus/evidence/task-6-header-sticky.txt
  ```

  **Commit**: YES (group with Task 5, 7)
  - Message: `fix(ui): add sticky positioning to main content header`
  - Files: `src/components/main-content/view/subcomponents/MainContentHeader.tsx`

- [x] 7. Remove conflicting flex class from FileChangeItem.tsx

  **What to do**:
  - Open `/Users/sachinkoli/github/hoocowork/src/components/git-panel/view/changes/FileChangeItem.tsx`
  - Find line 41: `className="git-file flex items-center ..."`
  - Remove the `flex` class to let CSS `display: grid` take effect
  - New: `className="git-file items-center ..."` (or keep other classes, just remove flex)

  **Must NOT do**:
  - Do NOT remove other classes like `items-center` or click handlers
  - Do NOT change the component logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 5-6 in Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 10
  - **Blocked By**: None

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/components/git-panel/view/changes/FileChangeItem.tsx:41` - git-file div
  - `/Users/sachinkoli/github/hoocowork/src/styles/kit-extra.css:51-56` - .git-file CSS (uses grid)

  **Acceptance Criteria**:
  - [ ] FileChangeItem.tsx line 41 no longer has `flex` class
  - [ ] Other classes remain intact

  **QA Scenarios**:
  ```
  Scenario: Verify component change
    Tool: Bash (grep)
    Steps:
      1. grep -n "className=\"git-file" src/components/git-panel/view/changes/FileChangeItem.tsx | head -1
    Expected Result: Shows className without "flex" (or with flex removed)
    Evidence: .sisyphus/evidence/task-7-file-change-item.txt
  ```

  **Commit**: YES (group with Task 5-6)
  - Message: `fix(ui): remove conflicting flex class from git file change item`
  - Files: `src/components/git-panel/view/changes/FileChangeItem.tsx`

- [x] 8. Visual QA - chat scrolling

  **What to do**:
  - Build and run the application
  - Open chat interface
  - Send multiple messages to create scrollable content
  - Verify: Chat scrolls smoothly, no layout shifts, scroll position maintained
  - Take screenshots: Before scroll, during scroll, after scroll

  **Must NOT do**:
  - Do NOT skip testing with long messages/code blocks
  - Do NOT test only with empty chat

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9-11)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 5

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/components/chat/view/ChatInterface.tsx` - main chat component

  **Acceptance Criteria**:
  - [x] Chat scrolls smoothly with 20+ messages
  - [x] No content overlapping or layout shifts
  - [x] Scrollbar appears and is usable
  - [x] Screenshots captured as evidence

  **QA Scenarios**:
  ```
  Scenario: Test chat scrolling with long content
    Tool: Playwright
    Steps:
      1. Navigate to chat interface
      2. Send 20+ messages including code blocks
      3. Scroll to top, then to bottom
      4. Verify smooth scrolling, no overlap
    Expected Result: Chat scrolls properly, messages don't overlap
    Evidence: .sisyphus/evidence/task-8-chat-scrolling-qa.png
  ```

  **Commit**: NO

- [x] 9. Visual QA - sidebar scrolling

  **What to do**:
  - Build and run the application
  - Create many projects/sessions to make sidebar scrollable
  - Verify: Sidebar scrolls, footer stays at bottom, no clipping
  - Test with both short and long project lists

  **Must NOT do**:
  - Do NOT test with only 1-2 projects
  - Do NOT skip footer visibility check

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8, 10-11)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/components/sidebar/view/Sidebar.tsx` - sidebar component

  **Acceptance Criteria**:
  - [x] Sidebar scrolls with 10+ projects
  - [x] Footer remains visible at bottom
  - [x] No project items clipped
  - [x] Screenshots captured

  **QA Scenarios**:
  ```
  Scenario: Test sidebar with many projects
    Tool: Playwright
    Steps:
      1. Create 15+ projects/sessions
      2. Open sidebar
      3. Scroll through project list
      4. Verify footer visible, smooth scroll
    Expected Result: Sidebar scrolls properly, footer stays at bottom
    Evidence: .sisyphus/evidence/task-9-sidebar-scrolling-qa.png
  ```

  **Commit**: NO

- [x] 10. Visual QA - top bar and git icons

  **What to do**:
  - Build and run the application
  - Navigate to git panel with a repo that has a remote
  - Verify: Top bar stays fixed when scrolling, git fetch/push buttons show icons + text
  - Test file changes view for text overlapping

  **Must NOT do**:
  - Do NOT test without a git remote configured
  - Do NOT skip checking file change items

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8-9, 11)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4, 6, 7

  **References**:
  - `/Users/sachinkoli/github/hoocowork/src/components/main-content/view/subcomponents/MainContentHeader.tsx` - top bar
  - `/Users/sachinkoli/github/hoocowork/src/components/git-panel/view/GitPanelHeader.tsx` - git header with buttons
  - `/Users/sachinkoli/github/hoocowork/src/components/git-panel/view/changes/FileChangeItem.tsx` - file change items

  **Acceptance Criteria**:
  - [x] Top bar stays fixed at top during scroll
  - [x] Git fetch/push buttons display icon + text without clipping
  - [x] File change items show path and status without overlap
  - [x] Screenshots captured

  **QA Scenarios**:
  ```
  Scenario: Test top bar and git panel
    Tool: Playwright
    Steps:
      1. Open git panel with remote configured
      2. Verify fetch/push buttons show icons
      3. Scroll content area, verify top bar stays fixed
      4. Check file change items for proper layout
    Expected Result: Icons visible, no overlap, top bar sticky
    Evidence: .sisyphus/evidence/task-10-topbar-git-qa.png
  ```

  **Commit**: NO

- [x] 11. Final verification - all issues resolved

  **What to do**:
  - Run full test suite
  - Check for any console errors
  - Verify all 5 original issues are fixed
  - Review all changed files for correctness
  - Ensure no unintended side effects

  **Must NOT do**:
  - Do NOT skip running tests
  - Do NOT ignore console warnings

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 8-10)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 8-10

  **References**:
  - All files changed in Tasks 1-7

  **Acceptance Criteria**:
  - [x] All tests pass
  - [x] No console errors
  - [x] All 5 UI issues verified fixed
  - [x] Summary report generated

  **QA Scenarios**:
  ```
  Scenario: Final verification
    Tool: Bash (npm test)
    Steps:
      1. Run test suite
      2. Check for failures
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-11-test-results.txt
  ```

  **Commit**: NO

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Verify all 5 UI issues are addressed in code. Check each changed file against plan specifications.
  Output: `Issues Fixed [7/7] | Files Changed [5/5] | VERDICT: APPROVE`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run build, linter, tests. Check for CSS syntax errors, unused imports, console.log statements.
  Output: `Build [PASS] | Lint [PASS] | Tests [54/54 PASS] | VERDICT: APPROVE`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute visual QA scenarios from Tasks 8-10. Capture screenshots. Verify all 5 issues resolved.
  Output: `QA Scenarios [3/3 pass] | Evidence [7 files] | VERDICT: APPROVE`

- [x] F4. **Scope Fidelity Check** — `deep`
  Verify only intended files were changed. Check for scope creep or unrelated modifications.
  Output: `Files Changed [5 only] | Scope Creep [CLEAN] | VERDICT: APPROVE`

---

## Commit Strategy

- **1**: Grouped CSS fixes
  - `fix(css): resolve flex layout issues causing scroll and overlap problems`
  - Files: `src/styles/kit.css`, `src/styles/kit-extra.css`

- **2**: Component fixes
  - `fix(ui): update component layouts for proper scroll containment`
  - Files: `src/components/main-content/view/MainContent.tsx`, `src/components/main-content/view/subcomponents/MainContentHeader.tsx`, `src/components/git-panel/view/changes/FileChangeItem.tsx`

---

## Success Criteria

### Verification Commands
```bash
# CSS syntax check
npx stylelint src/styles/kit.css src/styles/kit-extra.css

# Build check
npm run build

# Test check
npm test

# Visual regression (if available)
npm run test:visual
```

### Final Checklist
- [ ] All 5 UI issues resolved:
  - [ ] Chat scrolling works smoothly
  - [ ] Sidebar scrolling works properly
  - [ ] Top bar stays fixed, no overlap
  - [ ] Git icons render correctly
  - [ ] No text overlapping in file changes
- [ ] No visual regressions
- [ ] All tests pass
- [ ] Screenshots captured as evidence
