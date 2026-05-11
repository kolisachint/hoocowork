# HooCowork Project Review & Fix Plan

**Created:** 2026-05-11  
**Status:** REVIEW COMPLETE — READY FOR EXECUTION

---

## Executive Summary

The project is in **good structural state** with a completed rebrand from `cloudcli`/`siteboon` to `hoocowork`/`kolisachint`. Build passes, typecheck passes. However, there are **several issues that need attention** before this is production-ready.

---

## 🔴 Issues Found

### 1. **Pending Changes Not Committed** (High Priority)
13 files staged but not committed. If these changes represent the rebrand work, they should be committed with an appropriate message like `refactor!: complete rebrand from cloudcli to hoocowork`.

**Fix:** Review changes, commit with proper conventional commit message.

### 2. **Local README Files Not Updated** (Medium Priority)
The localized README files still have old branding:
- `README.de.md` - mentions `cloudcli.ai`
- `README.ja.md` - mentions `cloudcli.ai`
- `README.ko.md` - mentions `cloudcli.ai`
- `README.ru.md` - mentions `cloudcli.ai`
- `README.tr.md` - mentions `cloudcli.ai`
- `README.zh-CN.md` - mentions `cloudcli.ai`

**Fix:** Update all 6 localized README files with:
- `cloudcli` → `hoocowork`
- `siteboon/claudecodeui` → `kolisachint/hoocowork`
- `cloudcli.ai` → `hoocowork.app`
- Update installation commands (`npx @cloudcli-ai/cloudcli` → `npx @kolisachint/hoocowork`)

### 3. **Trendshift Badge URL May Be Wrong** (Low Priority)
The badge URL is `repositories/15586` — need to verify this is the correct repo ID for `kolisachint/hoocowork`.

**Fix:** Check if badge needs updating at `https://trendshift.io/repositories/kolisachint/hoocowork`.

### 4. **Leftover `.tgz` Package Files** (Low Priority)
Several `.tgz` files in root directory from testing:
- `cloudcli-ai-cloudcli-1.31.6.tgz`
- `cloudcli-ai-cloudcli-1.31.7.tgz`
- `cloudcli-ai-cloudcli-1.31.8.tgz`
- `cloudcli-ai-cloudcli-1.32.0.tgz`
- `cloudcli-ai-cloudcli-1.33.0-rc.4.tgz`
- `cloudcli-ai-cloudcli-1.33.0.tgz`

**Fix:** Delete these leftover test artifacts.

### 5. **Old Logo Files in `public/`** (Medium Priority)
Old logo files should be cleaned:
- Check if `public/logo-512.png`, `public/logo-128.png`, `public/logo-64.png` exist
- Check if `public/favicon.png` exists

**Fix:** Remove old logo files and verify only SVG logo remains.

### 6. **Staged `.hoocode/plan.md` Should Be Removed** (Medium Priority)
The `.hoocode/` directory and its `plan.md` are implementation artifacts, not part of the project.

**Fix:** Unstage and remove `.hoocode/plan.md` from git.

### 7. **REFACTOR_PLAN.md Staged** (Medium Priority)
This is a one-time documentation file, should either:
- Move to docs/ directory, or
- Remove from git entirely (keep local copy if needed)

**Fix:** Decide and act accordingly.

---

## ✅ What's Working Correctly

| Check | Status | Notes |
|-------|--------|-------|
| `npm run typecheck` | ✅ Pass | No TypeScript errors |
| `npm run build` | ✅ Pass | Client + server build succeeds |
| Branding (source code) | ✅ Clean | No `claudecodeui`/`cloudcli`/`siteboon` in src/server |
| package.json | ✅ Updated | Correct name, repo, homepage |
| Main README.md | ✅ Updated | Full rebrand done |
| Git diff staged changes | ✅ Reasonable | Reasonable refactoring |

---

## 📋 Execution Plan

### Phase 1: Cleanup Leftover Files
```bash
# Remove .tgz package artifacts
rm cloudcli-ai-cloudcli-*.tgz

# Remove implementation artifacts
rm -rf .hoocode
rm REFACTOR_PLAN.md

# Unstage them if already staged
git restore --staged .hoocode/plan.md REFACTOR_PLAN.md 2>/dev/null || true
```

### Phase 2: Update Localized README Files

Update each of the 6 localized README files:
- **README.de.md** (German)
- **README.ja.md** (Japanese)
- **README.ko.md** (Korean)
- **README.ru.md** (Russian)
- **README.tr.md** (Turkish)
- **README.zh-CN.md** (Simplified Chinese)

Changes for each:
1. Replace `cloudcli.ai` → `hoocowork.app`
2. Replace `siteboon/claudecodeui` → `kolisachint/hoocowork`
3. Update `npx @cloudcli-ai/cloudcli` → `npx @kolisachint/hoocowork`
4. Update `npm install -g @cloudcli-ai/cloudcli` → `npm install -g @kolisachint/hoocowork`
5. Update `cloudcli` → `hoocowork`
6. Update `CloudCLI` → `HooCowork` where applicable

### Phase 3: Verify Trendshift Badge
Check if the badge at `https://trendshift.io/repositories/15586` is correct or needs update.

### Phase 4: Commit Changes
```bash
git add .
git commit -m "refactor!: complete rebrand to HooCowork"
git push origin main
```

### Phase 5: Final Verification
```bash
# 1. No old branding in any README
rg -i "cloudcli.ai|siteboon/claudecodeui|@cloudcli-ai" *.md

# 2. Build still works
npm run build

# 3. Lint (optional - warnings are acceptable)
npm run lint
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `README.de.md` | Full rebrand |
| `README.ja.md` | Full rebrand |
| `README.ko.md` | Full rebrand |
| `README.ru.md` | Full rebrand |
| `README.tr.md` | Full rebrand |
| `README.zh-CN.md` | Full rebrand |
| `.gitignore` | Verify final state |

## Files to Delete

| File | Reason |
|------|--------|
| `cloudcli-ai-cloudcli-*.tgz` | Package artifacts |
| `.hoocode/plan.md` | Implementation artifact |
| `REFACTOR_PLAN.md` | One-time doc (move to docs/ if needed) |

## Verification Commands

```bash
# Check no old branding in any README
rg -i "cloudcli.ai|siteboon/claudecodeui|@cloudcli-ai" README*.md

# Check tgz files removed
ls *.tgz 2>/dev/null  # should have no output

# Final build check
npm run build

# Typecheck
npm run typecheck
```

---

## Completion Checklist

- [ ] Remove leftover .tgz files
- [ ] Unstage and remove .hoocode/plan.md
- [ ] Decide on REFACTOR_PLAN.md (docs/ or delete)
- [ ] Update all 6 localized README files
- [ ] Verify trendshift badge URL
- [ ] Commit all changes with proper message
- [ ] Final verification (build + typecheck pass)