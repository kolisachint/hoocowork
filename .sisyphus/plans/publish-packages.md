# Publish Packages to npm (v0.1.0)

## TL;DR
> **Publish both `@kolisachint/hoocowork` and `@siteboon/claude-code-ui` to npm with version `0.1.0`.**
>
> **Steps**: Update versions → Build (main) → Publish both → Restore versions

---

## TODOs

- [ ] 1. Update root `package.json` version from `1.33.0` to `0.1.0`

- [ ] 2. Update `redirect-package/package.json` version from `3.0.0` to `0.1.0`

- [ ] 3. Publish `@kolisachint/hoocowork` — `npm publish` (prepublishOnly runs build automatically)

- [ ] 4. Publish `@siteboon/claude-code-ui` — `npm publish` from `redirect-package/`

- [ ] 5. Restore original version numbers in both `package.json` files (1.33.0 and 3.0.0)

