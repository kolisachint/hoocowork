# Plan: Update UI Labels

## Goal
Change two UI labels: "Source Control" → "Git" and "Project Stats" → "Stats"

## Files to modify

### 1. `src/i18n/locales/en/common.json` (line 24)
**Current:**
```json
"git": "Source Control",
```
**Change to:**
```json
"git": "Git",
```

### 2. `src/i18n/locales/en/settings.json` (line 477)
**Current:**
```json
"name": "Project Stats",
```
**Change to:**
```json
"name": "Stats",
```

## Tests
- N/A - Simple string label changes

## Verification
1. Run the dev server: `npm run dev`
2. Open the app in browser
3. Verify the tab label shows "Git" instead of "Source Control"
4. Go to Settings > Plugins and verify "Stats" appears instead of "Project Stats"
