# Bun CI Pipeline + npm Publish Overhaul

## TL;DR

> **Rearchitect the project's CI/CD to use Bun**: Add bun for fast CI (install, build, test, publish), create a PR/commit check workflow, replace release-it with `bun publish`, fix 8 pre-existing test failures, conduct a full code/dependency audit, and update all documentation (including 6 translated READMEs).

> **Deliverables**:
> - `.github/workflows/ci.yml` — PR/push CI (lint → typecheck → build → test)
> - `.github/workflows/release.yml` — updated to use `bun publish` (replaces release-it)
> - `bun.lockb` committed — deterministic bun installs in CI
> - All 8 failing tests fixed — `bun test` passes cleanly
> - Lint warnings cleaned + dependency audit resolved
> - All docs updated with bun references (README × 7 languages + CONTRIBUTING + supporting docs)

> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves, 10+ tasks
> **Critical Path**: Fix tests → CI workflow → Docs → Verification

---

## Context

### Original Request
Review the project thoroughly, build/test with bun, publish to npm via bun, create CI workflow if missing, ensure it's used, update all docs.

### Interview Summary
**Key Decisions**:
- **Bun Strategy**: Hybrid — bun in CI, npm for devs. Both lockfiles committed.
- **CI Scope**: Full pipeline — PR checks + automated release + npm publish via `bun publish`
- **Review Depth**: Full review with fixes — lint warnings, dependency audit, security scan
- **Test Policy**: All 8 pre-existing failures must be fixed before CI passes
- **Docs Scope**: All docs — 7 READMEs + CONTRIBUTING + supporting docs
- **Release**: Replace release-it with `bun publish` based workflow

### Metis Review
**Identified Gaps** (addressed in plan):
- **Test failures need fixing**: 3 better-sqlite3 + 2 MCP assertion + 3 other failures — investigated and fixed
- **bun install native modules**: better-sqlite3, node-pty, bcrypt, sharp — precompiled or polyfilled
- **Lockfile drift risk**: Both `package-lock.json` and `bun.lockb` committed, CI warns on drift
- **release-it replacement**: New `bun publish` workflow with changelog generation via `conventional-changelog`
- **CI runner needs bun installed**: `oven-sh/setup-bun@v2` action added
- **Fork PR safety**: PR workflow skips secret-requiring steps

---

## Work Objectives

### Core Objective
Replace npm-based CI/CD with bun for faster builds and consistent publish pipeline, while preserving npm compatibility for local development.

### Concrete Deliverables
- `.github/workflows/ci.yml` — PR/push CI with 4 stages (lint → typecheck → build → test)
- `.github/workflows/release.yml` — rewritten to use `bun publish` + conventional-changelog + gh CLI
- `bun.lockb` — committed to repo
- `package.json` — updated with `"test"` script, updated build hooks
- `release-it` removed (devDependencies + config + release.sh)
- All 8 tests passing under `bun test`
- All lint errors fixed, 467 warnings addressed (auto-fixable + manual priority fixes)
- Dependency vulnerabilities resolved (critical/high)
- All docs updated with bun references

### Definition of Done
- [ ] `bun test` passes with 0 failures and ≥52 passing
- [ ] `npx tsc --noEmit -p tsconfig.json && npx tsc --noEmit -p server/tsconfig.json` passes (0 errors)
- [ ] `npm run lint` passes (0 errors, warnings at acceptable threshold)
- [ ] `bun run build` produces valid `dist/` and `dist-server/` output
- [ ] CI workflow runs on push and PR — all stages pass
- [ ] Release workflow can be triggered via `workflow_dispatch` and completes dry-run successfully
- [ ] `npm ci && npm run build` still works in clean checkout (dev workflow preserved)
- [ ] All docs contain accurate bun/npm guidance

### Must Have
- PR CI workflow runs tests, lint, typecheck, build on every push/PR
- Release workflow publishes to npm via `bun publish`
- Both lockfiles (`package-lock.json` + `bun.lockb`) committed and kept in sync
- 8 pre-existing test failures fixed
- Dependency vulnerabilities (critical/high) resolved
- All docs updated with correct bun references

### Must NOT Have (Guardrails)
- Do NOT modify `docker.yml` or `discord-release.yml` workflows
- Do NOT refactor or restructure source code files (only fix lint/test issues)
- Do NOT create abstraction wrappers for bun/npm duality
- Do NOT remove `package-lock.json` or `.nvmrc` (npm devs still supported)
- Do NOT rewrite doc content beyond CI/CD and bun usage additions
- Do NOT add `bun.lockb` to `.gitignore`

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (bun + node:test)
- **Automated tests**: Tests-after (fix existing tests, then verify with bun test)
- **Framework**: Node.js built-in (`node:test`) via `bun test`
- **QA Policy**: Every task verified via automated scripts + evidence capture

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Investigation + Foundation — 3 tasks, sequential):
├── Task 1: Fix all 8 pre-existing test failures [deep]
├── Task 2: Full code audit + lint warning cleanup [unspecified-high]
└── Task 3: Dependency audit + vulnerability fixes [quick]

Wave 2 (CI/CD Infrastructure — 3 tasks, parallel after Wave 1):
├── Task 4: bun.lockb + test script + config updates [quick]
├── Task 5: Create PR/commit CI workflow [quick]
└── Task 6: Rewrite release workflow (bun publish) [unspecified-high]

Wave 3 (Documentation — 4 tasks, parallel after Wave 2):
├── Task 7: Update main README.md [writing]
├── Task 8: Update CONTRIBUTING.md [writing]
├── Task 9: Update translated READMEs (6 files) [writing]
└── Task 10: Update supporting docs [writing]

Wave FINAL (Verification — 4 parallel reviews):
├── Task F1: Plan compliance + workflow dry-run (oracle)
├── Task F2: Code quality + lint/build/test pass (unspecified-high)
├── Task F3: Dev workflow preservation check (unspecified-high)
└── Task F4: Docs completeness + accuracy audit (unspecified-high)
→ Present results → Get explicit user okay
```

---

## TODOs

- [x] 1. Diagnose and Fix All Pre-existing Test Failures

  **What to do**:
  - Run `bun test --timeout 30000` and capture ALL failing tests (not just tail)
  - Categorize each failure:
    - **better-sqlite3 integration tests** (3 failures): These fail under bun because better-sqlite3 is a native Node.js module. Options (pick best):
      - Add `process.isBun` guard to skip these tests when running under bun
      - OR mock `better-sqlite3` with an in-memory SQLite polyfill for bun
      - OR rewrite tests to use `bun:sqlite` when available
    - **MCP test assertion** (2 failures): `assert.equal(7, 4)` — investigate if local MCP config files are causing false positive, or if there's a real logic bug in the provider discovery
    - **Any other failures**: Diagnose and fix with appropriate mock/test isolation
  - Fix ALL failures such that `bun test` outputs "0 fail"

  **Must NOT do**:
  - Do NOT change production business logic to make tests pass
  - Do NOT disable tests without understanding root cause
  - Do NOT modify unrelated test files

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: This is a genuine debugging challenge requiring root-cause analysis across multiple subsystems (DB, MCP providers, bun compatibility)
  - **Skills**: []
  - **Skills Evaluated but Omitted**: All — this is pure debugging and test engineering

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential investigation)
  - **Blocks**: Tasks 2, 3, 4, 5 (all downstream depend on passing tests)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `server/modules/database/repositories/projects.db.integration.test.ts` — DB integration tests that fail under bun
  - `server/modules/providers/tests/mcp.test.ts` — MCP provider tests with assertion mismatch
  - `server/shared/claude-cli-path.test.ts` — already passing, but use as reference for test structure
  - Bun docs for native module compatibility: `https://bun.sh/docs/runtime/nodejs-apis`

  **Acceptance Criteria**:
  - [ ] `bun test` outputs "0 fail" with ≥52 pass
  - [ ] Each fix has a documented root cause
  - [ ] No production code behavior changed

  **QA Scenarios**:
  ```
  Scenario: All tests pass under bun
    Tool: Bash
    Preconditions: Clean repo state, bun installed
    Steps:
      1. Run `bun test --timeout 30000`
      2. Check exit code is 0
      3. Check output contains "0 fail" and at least "52 pass"
    Expected Result: bun test exits 0 with all tests passing
    Evidence: .sisyphus/evidence/task-1-test-pass.txt

  Scenario: Specific fix verification (example — better-sqlite3)
    Tool: Bash
    Preconditions: Tests fixed
    Steps:
      1. Run `bun test server/modules/database/repositories/projects.db.integration.test.ts`
      2. Check for passing result
    Expected Result: DB integration tests pass under bun
    Evidence: .sisyphus/evidence/task-1-db-test-fix.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-1-test-pass.txt` — full bun test output showing 0 failures
  - [ ] `task-1-root-causes.md` — documented root causes for each failure

  **Commit**: YES
  - Message: `fix(tests): resolve 8 pre-existing test failures for bun compatibility`
  - Pre-commit: `bun test --timeout 30000`


- [x] 2. Full Code Audit + Lint Warning Cleanup

  **What to do**:
  - Run full lint suite: `npm run lint`
  - Categorize all warnings:
    - Auto-fixable: `npm run lint:fix` (runs eslint --fix)
    - Manual warnings: Review each and fix meaningful ones (unused imports, type issues, accessibility)
    - Known-pattern warnings: Suppress with eslint comments if they're intentional patterns
  - Run `npx tsc --noEmit -p tsconfig.json` and `npx tsc --noEmit -p server/tsconfig.json` — verify 0 errors
  - Generate a lint report showing: errors fixed, warnings remaining by category, auto-fixable count
  - Fix priority order: errors → unused imports → type issues → stylistic warnings

  **Must NOT do**:
  - Do NOT change runtime behavior — lint fixes only
  - Do NOT refactor or restructure components
  - Do NOT spend time fixing purely stylistic warnings unless they affect readability

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Code cleanup requiring judgment on which warnings to fix vs suppress
  - **Skills**: []
  - **Skills Evaluated but Omitted**: All — pure linting and code review task

  **Parallelization**:
  - **Can Run In Parallel**: NO (blocked by Task 1 — need clean test state)
  - **Blocks**: Task 3 (dependency audit can start after lint baseline)
  - **Blocked By**: Task 1 (test fixes may change lint state)

  **References**:
  - `eslint.config.js` — ESLint configuration defining all rules
  - `package.json` scripts: `"lint"`, `"lint:fix"`, `"typecheck"`

  **Acceptance Criteria**:
  - [ ] `npm run lint` exits 0 (0 errors, warnings documented)
  - [ ] `npm run typecheck` exits 0 (0 errors)
  - [ ] Lint report generated showing changes made

  **QA Scenarios**:
  ```
  Scenario: Lint passes after cleanup
    Tool: Bash
    Preconditions: Lint fixes applied
    Steps:
      1. Run `npm run lint` 2>&1
      2. Check for "0 errors" in output
    Expected Result: ESLint exits 0
    Evidence: .sisyphus/evidence/task-2-lint-pass.txt

  Scenario: TypeScript compiles cleanly
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run `npx tsc --noEmit -p tsconfig.json`
      2. Run `npx tsc --noEmit -p server/tsconfig.json`
    Expected Result: Both exit 0 with no errors
    Evidence: .sisyphus/evidence/task-2-typecheck-pass.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-2-lint-pass.txt` — lint output showing 0 errors
  - [ ] `task-2-typecheck-pass.txt` — typecheck output
  - [ ] `task-2-lint-report.md` — summary of warnings by category

  **Commit**: YES (groups with Task 3)
  - Message: `chore(lint): fix lint warnings and address audit findings`
  - Pre-commit: `npm run lint && npm run typecheck`


- [ ] 3. Dependency Audit + Vulnerability Fixes

  **What to do**:
  - Run `npm audit --audit-level=high` and `bun audit` (if available)
  - Categorize findings:
    - **Critical/High vulnerabilities**: Fix via `npm audit fix` or manual version bumps
    - **Moderate/Low**: Log and report, fix if straightforward
    - **False positives**: Document reason
  - Check for deprecated packages in use (e.g., `node-fetch` v2, `multer` v2)
  - Check for known supply-chain risks in devDependencies
  - Update `package.json` dependencies where needed
  - Run `bun install` to regenerate `bun.lockb` with updated deps
  - Run `npm install` to regenerate `package-lock.json` with updated deps

  **Must NOT do**:
  - Do NOT upgrade major versions without testing (minor/patch only unless critical)
  - Do NOT remove packages without verifying they're unused

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Well-scoped audit with clear commands
  - **Skills**: []
  - **Skills Evaluated but Omitted**: All — straightforward dependency management

  **Parallelization**:
  - **Can Run In Parallel**: NO (blocked by Task 2 — clean lint state first)
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `package.json` — dependencies and devDependencies to audit
  - `.nvmrc` — Node version constraint
  - `node_modules/` — installed packages to check

  **Acceptance Criteria**:
  - [ ] `npm audit --audit-level=high` exits 0 (no critical/high vulns)
  - [ ] Both `package-lock.json` and `bun.lockb` updated
  - [ ] Dependency audit report generated

  **QA Scenarios**:
  ```
  Scenario: No critical vulnerabilities
    Tool: Bash
    Preconditions: Dependencies updated
    Steps:
      1. Run `npm audit --audit-level=high`
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-3-audit-pass.txt

  Scenario: Both lockfiles in sync (install works)
    Tool: Bash
    Preconditions: Clean temp directory
    Steps:
      1. `cd /tmp && cp -r $PROJECT . && cd hoocowork`
      2. `bun install --frozen-lockfile`
      3. `npm ci`
    Expected Result: Both install commands succeed
    Evidence: .sisyphus/evidence/task-3-lockfiles-valid.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-3-audit-pass.txt` — npm audit output
  - [ ] `task-3-lockfiles-valid.txt` — lockfile validation
  - [ ] `task-3-dep-report.md` — dependency audit summary

  **Commit**: YES (groups with Task 2)
  - Message: `chore(lint): fix lint warnings and address audit findings`
  - Pre-commit: `npm run lint && npm run typecheck && bun test`

- [ ] 4. Add bun.lockb + Test Script + Config Updates

  **What to do**:
  - Run `bun install` in project root to generate `bun.lockb`
  - Add `"test": "bun test"` script to `package.json` scripts section (alphabetically after `"start"`)
  - Update `"prepublishOnly"` script from `"npm run build"` to `"bun run build"` in `package.json`
  - Update `"postinstall"` script — change `node scripts/fix-node-pty.js` to use `bun scripts/fix-node-pty.js` (ensure bun compatibility)
  - Update `.release-it.json` `before:init` hook from `"npm run build"` to `"bun run build"` (still needed until release workflow is fully replaced)
  - Verify `bun.lockb` is NOT in `.gitignore` (confirmed: not listed)
  - Stage and commit `bun.lockb`
  - Run `bun run build` to verify build works with bun
  - Run `bun test` to verify tests pass with bun
  - Run `npm ci && npm run build` to verify npm workflow still works

  **Must NOT do**:
  - Do NOT remove `package-lock.json` or `.nvmrc`
  - Do NOT add `bun.lockb` to `.gitignore`
  - Do NOT change any build tooling (Vite, tsc configs)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward config file edits with clear commands
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on clean test/lint state from Tasks 1-3)
  - **Blocks**: Tasks 5, 6 (CI workflows depend on working bun config)
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - `package.json:42` — `"prepublishOnly"` script location
  - `package.json:43` — `"postinstall"` script location
  - `.release-it.json:17` — `before:init` hook
  - `.gitignore` — confirm bun.lockb not ignored

  **Acceptance Criteria**:
  - [ ] `bun.lockb` exists at project root and is tracked by git
  - [ ] `"test": "bun test"` in package.json scripts
  - [ ] `"prepublishOnly": "bun run build"` in package.json
  - [ ] `bun run build` succeeds
  - [ ] `bun test` passes (0 failures)
  - [ ] `npm ci && npm run build` still succeeds

  **QA Scenarios**:
  ```
  Scenario: bun.lockb committed and tracked
    Tool: Bash
    Preconditions: bun install completed
    Steps:
      1. `git ls-files bun.lockb`
    Expected Result: bun.lockb appears in tracked files
    Evidence: .sisyphus/evidence/task-4-lockfile-tracked.txt

  Scenario: Test script works
    Tool: Bash
    Preconditions: Config updated
    Steps:
      1. `bun test --timeout 30000`
    Expected Result: Tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-4-test-script.txt

  Scenario: Build succeeds with bun
    Tool: Bash
    Preconditions: Config updated
    Steps:
      1. `bun run build`
      2. `ls dist/index.html` and `ls dist-server/server/index.js`
    Expected Result: Both dist/ and dist-server/ exist with expected files
    Evidence: .sisyphus/evidence/task-4-build-output.txt

  Scenario: npm workflow preserved
    Tool: Bash
    Preconditions: Clean state
    Steps:
      1. `rm -rf node_modules && npm ci`
      2. `npm run build`
    Expected Result: npm ci succeeds, build succeeds
    Evidence: .sisyphus/evidence/task-4-npm-workflow.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-4-lockfile-tracked.txt`
  - [ ] `task-4-test-script.txt`
  - [ ] `task-4-build-output.txt`
  - [ ] `task-4-npm-workflow.txt`

  **Commit**: YES
  - Message: `ci: add bun.lockb, test script, and config updates`
  - Pre-commit: `bun test && bun run build && npm ci && npm run build`


- [ ] 5. Create PR/Commit CI Workflow

  **What to do**:
  - Create `.github/workflows/ci.yml` with the following structure:
    ```yaml
    name: CI

    on:
      push:
        branches: [main]
      pull_request:
        branches: [main]

    jobs:
      ci:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: oven-sh/setup-bun@v2
            with:
              bun-version: latest
          - run: bun install --frozen-lockfile
          - run: bun run typecheck
          - run: bun run lint
          - run: bun run build
          - run: bun test
    ```
  - Use 4 separate steps (not combined) for clear failure reporting in GitHub UI
  - Add `timeout-minutes: 15` to job
  - Do NOT include publish steps (PR workflow should not have access to secrets)
  - Add workflow status badge to README.md: `![CI](https://github.com/kolisachint/hoocowork/actions/workflows/ci.yml/badge.svg)`
  - Verify workflow syntax: `bunx action-validator .github/workflows/ci.yml` or use `gh workflow` commands

  **Must NOT do**:
  - Do NOT include any publish or secret-requiring steps
  - Do NOT modify docker.yml or discord-release.yml
  - Do NOT add `setup-node` (bun handles everything)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard CI workflow creation, well-defined structure
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: Can run alongside Task 6 (no direct dependency between them)
  - **Parallel Group**: Wave 2 (with Task 6)
  - **Blocks**: None
  - **Blocked By**: Task 4 (needs test script + bun.lockb)

  **References**:
  - `.github/workflows/release.yml` — existing workflow patterns to follow (convention)
  - `https://github.com/oven-sh/setup-bun` — bun setup action docs
  - `package.json` scripts — scripts to reference in workflow steps

  **Acceptance Criteria**:
  - [ ] `.github/workflows/ci.yml` created with correct structure
  - [ ] Workflow triggers on push and PR to main
  - [ ] Workflow has 4 steps: typecheck, lint, build, test
  - [ ] No publish or secret steps included
  - [ ] CI badge added to README.md

  **QA Scenarios**:
  ```
  Scenario: Workflow file is valid YAML
    Tool: Bash
    Preconditions: Workflow created
    Steps:
      1. `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`
    Expected Result: No YAML parse error
    Evidence: .sisyphus/evidence/task-5-yaml-valid.txt

  Scenario: Workflow validates with GitHub Actions kit
    Tool: Bash
    Preconditions: Workflow created
    Steps:
      1. `gh workflow list` (if gh authenticated)
    Expected Result: ci.yml appears in workflow list
    Evidence: .sisyphus/evidence/task-5-workflow-list.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-5-yaml-valid.txt` — YAML validation
  - [ ] `task-5-workflow-list.txt` — GitHub workflow list
  - [ ] `task-5-ci.yml` — copy of the workflow file content

  **Commit**: YES
  - Message: `ci: create PR/commit check workflow`
  - Files: `.github/workflows/ci.yml`, `README.md`
  - Pre-commit: `bun test`


- [ ] 6. Rewrite Release Workflow to Use `bun publish`

  **What to do**:
  - Rewrite `.github/workflows/release.yml` to replace release-it with a bun-based publish pipeline:
    ```yaml
    name: Release

    on:
      workflow_dispatch:
        inputs:
          increment:
            description: 'Version bump: patch, minor, major'
            required: true
            default: 'patch'
            type: choice
            options:
              - patch
              - minor
              - major

    jobs:
      release:
        runs-on: ubuntu-latest
        permissions:
          contents: write
          id-token: write
        timeout-minutes: 15
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0
              token: ${{ secrets.RELEASE_PAT }}
          - uses: oven-sh/setup-bun@v2
            with:
              bun-version: latest
          - name: git config
            run: |
              git config user.name "${GITHUB_ACTOR}"
              git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
          - run: bun install --frozen-lockfile
          - run: bun run build
          - run: bun test
          
          - name: Bump version
            run: |
              NEW_VERSION=$(bun x semver -i ${{ inputs.increment }} $(node -p "require('./package.json').version"))
              echo "NEW_VERSION=$NEW_VERSION" >> $GITHUB_ENV
              node -e "const p=require('./package.json'); p.version='$NEW_VERSION'; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2)+'\n')"
          
          - name: Generate changelog
            run: |
              bun x conventional-changelog-cli -p conventionalcommits -i CHANGELOG.md -s
          
          - name: Commit and tag
            run: |
              git add package.json CHANGELOG.md
              git commit -m "chore(release): v${{ env.NEW_VERSION }}"
              git tag v${{ env.NEW_VERSION }}
              git push origin main --tags
          
          - name: Create GitHub Release
            run: |
              gh release create v${{ env.NEW_VERSION }} \
                --title "CloudCLI UI v${{ env.NEW_VERSION }}" \
                --notes-file <(bun x conventional-changelog-cli -p conventionalcommits -r 2 | tail -n +5)
            env:
              GITHUB_TOKEN: ${{ secrets.RELEASE_PAT }}
          
          - name: Publish to npm
            run: bun publish --access public
            env:
              NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
              BUN_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    ```
  - Remove `release-it` and its conventional-changelog plugin from devDependencies
  - Delete `.release-it.json` config file — no longer needed
  - Update `release.sh` to use bun-based release commands (or delete if superseded by workflow)
  - Add `"bump": "bun run build && bun test && node -e ..."` or keep simple
  - Verify the workflow can be dispatched (syntax validation)

  **Must NOT do**:
  - Do NOT keep `release-it` as a dependency (it's being replaced)
  - Do NOT leave `.release-it.json` in the repo (clean up)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Workflow rewrite with multiple moving parts (version bump, changelog, release, publish)
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: Can run alongside Task 5
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: None
  - **Blocked By**: Task 4 (needs bun config + test script)

  **References**:
  - `.release-it.json` — current release config to understand the workflow
  - `release.sh` — current local release script
  - `CHANGELOG.md` — changelog format to maintain
  - `package.json` — version field location

  **Acceptance Criteria**:
  - [ ] `.github/workflows/release.yml` rewritten with bun publish pipeline
  - [ ] release-it removed from devDependencies
  - [ ] `.release-it.json` deleted
  - [ ] `release.sh` updated or deleted
  - [ ] Workflow validates with `bunx action-validator` or YAML check
  - [ ] `bun publish --dry-run` succeeds (tests publish path without actually publishing)

  **QA Scenarios**:
  ```
  Scenario: Workflow YAML is valid
    Tool: Bash
    Preconditions: Workflow rewritten
    Steps:
      1. `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml'))"`
    Expected Result: No YAML error
    Evidence: .sisyphus/evidence/task-6-yaml-valid.txt

  Scenario: release-it is fully removed
    Tool: Bash
    Preconditions: Cleanup done
    Steps:
      1. `grep -r "release-it" package.json`
      2. `ls .release-it.json 2>&1 || echo "FILE_NOT_FOUND"`
      3. `grep -r "release-it" . 2>/dev/null | grep -v node_modules | grep -v ".git" | head -5`
    Expected Result: No release-it references found
    Evidence: .sisyphus/evidence/task-6-release-it-removed.txt

  Scenario: Dry-run publish works
    Tool: Bash
    Preconditions: Build passed, bun configured
    Steps:
      1. `bun publish --dry-run --access public 2>&1`
    Expected Result: Dry-run completes, shows what would be published
    Evidence: .sisyphus/evidence/task-6-dry-run.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-6-yaml-valid.txt`
  - [ ] `task-6-release-it-removed.txt`
  - [ ] `task-6-dry-run.txt`

  **Commit**: YES
  - Message: `ci: rewrite release workflow to use bun publish`
  - Files: `.github/workflows/release.yml`, `package.json`, delete `.release-it.json`, update `release.sh`
  - Pre-commit: `bun test && bun run build`

- [ ] 7. Update main README.md with bun and CI Badge

  **What to do**:
  - Update the main `README.md` to reflect bun usage in CI/CD and development:
    - In the "Quick Start" section, add a note about bun: "CI/CD uses bun for faster builds — install bun from https://bun.sh"
    - Keep npm instructions for Self-Hosted section (devs still use npm) but mention bun as alternative
    - Add CI workflow badge at the top: `![CI](https://github.com/kolisachint/hoocowork/actions/workflows/ci.yml/badge.svg)`
    - Add a "Development" section: `bun test`, `bun run build`, note both lockfiles maintained
    - Remove any `release-it` references
    - Update contributing link if CONTRIBUTING.md changes

  **Must NOT do**:
  - Do NOT rewrite existing content structure or remove npm instructions

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — independent of other doc tasks
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10)
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 5, 6

  **References**:
  - `README.md` — current README
  - `.github/workflows/ci.yml` — CI workflow for badge URL

  **Acceptance Criteria**:
  - [ ] CI badge present near top of README
  - [ ] Bun mentioned as CI/CD tool
  - [ ] Release-it references removed
  - [ ] npm instructions preserved for local dev

  **QA Scenarios**:
  ```
  Scenario: CI badge renders correctly
    Tool: Bash
    Steps:
      1. `grep "actions/workflows/ci.yml" README.md`
    Expected Result: Badge URL present
    Evidence: .sisyphus/evidence/task-7-badge.txt

  Scenario: No stale release-it references
    Tool: Bash
    Steps:
      1. `grep -i "release.it\|release-it" README.md || echo "CLEAN"`
    Expected Result: No references found
    Evidence: .sisyphus/evidence/task-7-no-release-it.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-7-badge.txt`
  - [ ] `task-7-no-release-it.txt`

  **Commit**: YES (groups with Tasks 8, 9, 10)
  - Message: `docs: update README, CONTRIBUTING, and translations with bun guidance`
  - Pre-commit: Verify docs render


- [ ] 8. Update CONTRIBUTING.md

  **What to do**:
  - Update `CONTRIBUTING.md` to add bun as optional tool:
    - Prerequisites: Add "Bun (optional, for fast CI)" with link
    - Getting Started: Add `bun install` alternative alongside npm
    - Development Workflow: Add `bun test`, `bun run dev`, `bun run build`
    - Releases section: Replace release-it instructions with GitHub Actions workflow dispatch
    - Pull Requests: Add note about CI check requiring pass
  - Remove release-it references

  **Must NOT do**:
  - Do NOT remove npm instructions or restructure document

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9, 10)
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 5, 6

  **References**:
  - `CONTRIBUTING.md` — current file
  - `.github/workflows/release.yml` — new release workflow

  **Acceptance Criteria**:
  - [ ] Bun in prerequisites as optional
  - [ ] Bun commands alongside npm in workflow sections
  - [ ] Release section references GitHub Actions
  - [ ] CI check requirement in PR section

  **QA Scenarios**:
  ```
  Scenario: Release section references GH Actions
    Tool: Bash
    Steps:
      1. `grep -i "workflow_dispatch\|Release.*workflow" CONTRIBUTING.md`
    Expected Result: Has GH Actions release process reference
    Evidence: .sisyphus/evidence/task-8-release-ref.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-8-release-ref.txt`

  **Commit**: YES (groups with Task 7)


- [ ] 9. Update Translated READMEs (6 files)

  **What to do**:
  - For each of 6 translated READMEs, apply equivalent changes as English README (Task 7):
    - `README.ru.md`, `README.de.md`, `README.ko.md`, `README.zh-CN.md`, `README.ja.md`, `README.tr.md`
  - Per translation: add CI badge, add bun CI/CD note in relevant sections, remove stale release-it refs
  - Strategy: Update English first (Task 7), replicate logical changes to each translation

  **Must NOT do**:
  - Do NOT machine-translate entire docs

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — each translation independent
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 10)
  - **Blocks**: None
  - **Blocked By**: Task 7 (English README finalized as source of truth)

  **References**:
  - `README.md` — English source after Task 7
  - `README.{ru,de,ko,zh-CN,ja,tr}.md` — current translations

  **Acceptance Criteria**:
  - [ ] All 6 translated READMEs updated with CI badge
  - [ ] Bun CI/CD content matching English version
  - [ ] Stale release-it refs removed

  **QA Scenarios**:
  ```
  Scenario: All translations have CI badge
    Tool: Bash
    Steps:
      1. `for f in README.{ru,de,ko,zh-CN,ja,tr}.md; do echo "$f: $(grep -c 'ci.yml' $f) badge(s)"; done`
    Expected Result: Each has ≥1 CI badge
    Evidence: .sisyphus/evidence/task-9-all-badges.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-9-all-badges.txt`

  **Commit**: YES (groups with Tasks 7, 8, 10)


- [ ] 10. Update Supporting Docs

  **What to do**:
  - `redirect-package/README.md`: Add CI badge, bun alternative to npm install
  - `docker/README.md`: Add CI badge, note about bun CI/CD
  - `docs/run-server.md`: Add bun alternative to npm commands
  - `public/convert-icons.md`: Update if it references build commands
  - `CHANGELOG.md`: Verify header consistency

  **Must NOT do**:
  - Do NOT restructure or add unrelated content

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9)
  - **Blocks**: None
  - **Blocked By**: Task 7

  **References**:
  - `redirect-package/README.md`, `docker/README.md`, `docs/run-server.md`

  **Acceptance Criteria**:
  - [ ] All supporting docs have CI badges where appropriate
  - [ ] Bun alternatives in command refs

  **QA Scenarios**:
  ```
  Scenario: Supporting docs updated
    Tool: Bash
    Steps:
      1. `grep -l "bun\|ci.yml" redirect-package/README.md docker/README.md docs/run-server.md`
    Expected Result: Each file contains bun or CI badge
    Evidence: .sisyphus/evidence/task-10-docs-verified.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-10-docs-verified.txt`

  **Commit**: YES (groups with Tasks 7, 8, 9)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results and get explicit user okay.

- [ ] F1. **Plan Compliance + Workflow Dry-Run** — `oracle`
  Read the plan end-to-end. Verify all "Must Have" items implemented. Run workflow dry-runs: verify `ci.yml` structure, verify `release.yml` can complete without errors (check `bun publish --dry-run`). Verify both lockfiles exist in git. Verify `release.sh`, `.release-it.json`, `release-it` dep removed.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Workflows [N/N valid] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality + Pipeline Pass** — `unspecified-high`
  Run `bun run typecheck` → PASS. Run `bun run lint` → PASS (0 errors, acceptable warnings). Run `bun run build` → PASS. Run `bun test` → PASS (0 failures). Check: no `as any`/`@ts-ignore` added, no console.log in prod, no commented-out code.
  Output: `Typecheck [PASS/FAIL] | Lint [PASS] | Build [PASS/FAIL] | Test [N pass/0 fail] | VERDICT`

- [ ] F3. **Dev Workflow Preservation** — `unspecified-high`
  From clean checkout: `rm -rf node_modules && npm ci && npm run build` → PASS. `rm -rf node_modules && bun install --frozen-lockfile && bun run build` → PASS. Verify `npx hoocowork --help` works (or at least binary resolves).
  Output: `npm workflow [PASS/FAIL] | bun workflow [PASS/FAIL] | Binary [PASS/FAIL] | VERDICT`

- [ ] F4. **Docs Completeness + Accuracy** — `unspecified-high`
  Read each updated doc file. Check: every `npm install` reference has appropriate `bun install` counterpart. No stale release-it references. CI/CD section accurate. New workflow badges present. All 6 translated READMEs match English README's CI/CD content.
  Output: `Docs [N/N current] | Translations [N/N synced] | Workflow badges [PRESENT/MISSING] | VERDICT`

---

## Commit Strategy

- **1**: `fix(tests): resolve 8 pre-existing test failures for bun compatibility`
  - Files: test files + mocks + configs
- **2**: `chore(lint): fix lint warnings and address audit findings`
  - Files: source files with lint fixes, dependency bumps
- **3**: `ci: add bun.lockb, test script, and config updates`
  - Files: `bun.lockb`, `package.json`, related configs
- **4**: `ci: create PR/commit check workflow`
  - Files: `.github/workflows/ci.yml`
- **5**: `ci: rewrite release workflow to use bun publish`
  - Files: `.github/workflows/release.yml`, removed `release-it`
- **6**: `docs: update README, CONTRIBUTING, and translations with bun guidance`
  - Files: `README.md`, `README.*.md`, `CONTRIBUTING.md`, support docs

---

## Success Criteria

### Verification Commands
```bash
bun test  # Expected: 52+ pass, 0 fail
bun run build  # Expected: dist/ and dist-server/ created
bun run typecheck  # Expected: 0 errors
npm ci && npm run build  # Expected: dev workflow preserved
```

### Final Checklist
- [ ] `bun test` = all passing
- [ ] `bun run build` = clean build
- [ ] CI workflow runs on push
- [ ] Release workflow dry-run succeeds
- [ ] npm dev workflow preserved
- [ ] All docs updated
