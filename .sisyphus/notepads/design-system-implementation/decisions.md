# Decisions

## Project naming: "HooCowork"
- Used in index.html title, manifest.json, apple-mobile-web-app-title

## Logo replacement
- Copy design bundle's hairline-square + prompt glyph + cursor bar SVG

## Favicon creation
- Not in design bundle — create from logo: 64x64 viewBox, paper background (#FAFAF7), hairline ink stroke (#111110)

## Server build fix approach
- Use `with { type: 'json' }` for JSON import
- Drop `.ts` extension from import path
- Add `@ts-expect-error` for Bun global
- Do NOT modify tsconfig.json

## kit-overrides.css stays
- `.backdrop-blur-sm:not(.keep-blur)` rule means backdrop elements need `.keep-blur` class

## Wave strategy
- Wave 1: Foundation (branding + build fix + keep-blur) — all parallel
- Wave 2: High-impact migration (AppContent, chat, sidebar)
- Wave 3: Medium-priority (settings, onboarding, mcp, plugins, taskmaster, prd)
- Wave 4: Remaining surfaces (file-tree, git, shell, code-editor, auth)
