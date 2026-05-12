# Publish @kolisachint/hoocowork to npm (v0.1.0)

## TL;DR
> **Publish `@kolisachint/hoocowork` to npm with version `0.1.0`, then restore original version.**
>
> **Steps**: Update version → Build → Publish → Restore version

---

## TODOs

- [x] 1. **Bump version to `0.1.0`**
  
  Update `package.json` version from `1.33.0` to `0.1.0`.
  
  **Acceptance**: `node -p "require('./package.json').version"` → `0.1.0`
  
  **QA**: Check version before publish.

- [x] 2. **Publish `@kolisachint/hoocowork` to npm**
  
  Run: `bun publish --access public`
  
  This auto-builds via the `prepublishOnly: bun run build` script.
  
  **Acceptance**: `npm view @kolisachint/hoocowork version` shows `0.1.0`
  
  **QA Scenario**:
  ```
  Scenario: Package published successfully
    Tool: Bash
    Steps:
      1. bun publish --access public
      2. npm view @kolisachint/hoocowork version
    Expected Result: Exit 0, version shows 0.1.0
    Evidence: .sisyphus/evidence/publish-success.txt
  ```

- [x] 3. **Restore original version**
  
  Update `package.json` version back to `1.33.0`.
  
  **Acceptance**: `node -p "require('./package.json').version"` → `1.33.0`
  
  **QA**: Verify version restored.

---

## Commit Strategy
No commits needed — version changes are temporary for publish.
