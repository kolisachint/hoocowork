# Learnings - UI Rendering Fixes

## Task 5: Chat Wrapper Flex Layout (2026-05-12)

- The chat tab wrapper div in MainContent.tsx (line 125) needed `flex flex-col min-h-0 overflow-hidden` classes
- `min-h-0` is critical for flex children - without it, flexbox default `min-height: auto` prevents children from shrinking below their content size, breaking scroll behavior
- The conditional rendering (`${activeTab === 'chat' ? 'block' : 'hidden'}`) must remain intact - this controls which tab is visible
- The `overflow-hidden` prevents the chat wrapper from overflowing its parent container
