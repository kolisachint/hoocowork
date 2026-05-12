# Cross-Platform Binary Distribution

## TL;DR
> **Create standalone binaries for Windows, Linux, and macOS using `bun build --compile`, embed frontend assets, and distribute via GitHub Releases + winget.**
>
> **Deliverables**:
> - `server/binary-entry.ts` — binary-aware entry point with embedded asset serving
> - `scripts/embed-assets.ts` — asset embedding build script
> - Updated `.github/workflows/release.yml` — matrix build for 4 platforms
> - GitHub Release with binary artifacts attached
> - `winget` manifest for Windows distribution
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Binary entry → Asset embedding → CI matrix build → Release → Winget

---

## Context

### Original Request
Create a Windows 64-bit binary and make it available via winget. Also build for other platforms (Linux x64, macOS ARM64 + x64) and embed the frontend assets inside the binary.

### Interview Summary
**Key Decisions**:
- **Binary tool**: `bun build --compile` (verified: 557 modules bundle successfully, 64MB binary)
- **Platforms**: Windows x64, Linux x64, macOS ARM64, macOS x64
- **Frontend assets**: Embedded inside the binary (not separate download)
- **Distribution**: GitHub Releases + winget manifest
- **Update mechanism**: GitHub Releases API (replaces current `npm update -g`)
- **Cross-compilation**: Not supported by bun — requires native GitHub Actions runners per platform

### Research Findings
- **CLI entry point**: `server/cli.js` — `#!/usr/bin/env node`, parses args, dispatches commands
- **Server entry**: `server/index.js` — Express app, WebSocket server, serves `dist/` via `express.static`
- **Path resolution**: `server/utils/runtime-paths.js` — walks fs tree looking for `server/` folder → FAILS in compiled binary (`/$bunfs/root/`)
- **Update command**: Uses `npm update -g @cloudcli-ai/cloudcli` → must be replaced in binary mode
- **Native addons**: `better-sqlite3`, `bcrypt`, `node-pty` all bundle successfully via `bun build --compile`

---

## Work Objectives

### Core Objective
Enable binary distribution of HooCowork across Windows, Linux, and macOS via `bun build --compile`, with embedded frontend assets and GitHub Releases delivery.

### Must Have
- [ ] Binary compiles and runs on all 4 target platforms
- [ ] Frontend assets served from inside the binary (no external files needed)
- [ ] `hoocowork start`, `status`, `help`, `version` commands work in binary mode
- [ ] `hoocowork update` checks GitHub Releases instead of npm
- [ ] Release workflow builds and uploads binaries for all platforms
- [ ] Windows winget manifest created

### Must NOT Have
- Do NOT code-sign or notarize binaries (separate concern)
- Do NOT replace the npm package — both distribution methods coexist
- Do NOT modify existing CLI behavior in npm mode
- Do NOT add auto-update daemon — manual `hoocowork update` only

---

## Verification Strategy

> All verification is agent-executed via commands and CI.

### Test Decision
- **Automated tests**: Tests-after (verify behavior, add tests for new code)
- **QA**: Each binary tested: `--help`, `--version`, `status`, `start` (should fail gracefully if no config)

---

## Execution Strategy

```
Wave 1 (Foundation — 3 tasks, can parallelize 1a+1b):
├── Task 1a: Create asset embedder script (scripts/embed-assets.ts) [quick]
├── Task 1b: Create binary entry point (server/binary-entry.ts) [unspecified-high]
└── Task 1c: Update CLI for binary-aware update (modify server/cli.js) [unspecified-high]

Wave 2 (CI/CD — 2 tasks, parallel):
├── Task 2a: Update release workflow with matrix build [unspecified-high]
├── Task 2b: Trigger release + verify all platform binaries [deep]

Wave 3 (Distribution — 2 tasks):
├── Task 3a: Create GitHub Release with binaries [quick]
└── Task 3b: Create winget manifest + docs [writing]

Wave FINAL (Verification — 4 parallel reviews):
├── Task F1: Plan compliance (oracle)
├── Task F2: Binary smoke tests on each platform (unspecified-high)
├── Task F3: CI/CD workflow validation (unspecified-high)
└── Task F4: Distribution completeness (unspecified-high)
```

---

## TODOs

### Wave 1: Foundation

- [x] 1a. **Create Asset Embedder Script**

  **What to do**:
  Create `scripts/embed-assets.ts` that scans the Vite-built `dist/` directory and generates `server/generated/embedded-assets.ts`.

  The generated file should export a `Map<string, { data: Buffer, contentType: string }>` with all files from `dist/`:
  - Walk `dist/` recursively
  - For each file, read as Buffer, determine MIME type via `mime-types` or extension mapping
  - Generate a TypeScript file that imports all files using `Bun.file()` or embeds as base64 strings
  - Structure: `{ "/assets/index-abc123.js": { data: Buffer, contentType: "text/javascript" }, "/index.html": { ... } }`
  - Use relative paths from `dist/` as keys (with leading `/`)

  **Acceptance**:
  - `bun run scripts/embed-assets.ts` generates `server/generated/embedded-assets.ts`
  - Generated file contains all files from `dist/`
  - Imports compile cleanly: `bun build server/generated/embedded-assets.ts` succeeds

  **QA Scenarios**:
  ```
  Scenario: Embedder generates valid output
    Steps:
      1. bun run build (build frontend first)
      2. bun run scripts/embed-assets.ts
      3. Check server/generated/embedded-assets.ts exists
      4. bun build server/generated/embedded-assets.ts
    Expected: File generated, compiles without errors
  ```

  **Commit**: YES — `feat(binary): add asset embedding script`

- [x] 1b. **Create Binary Entry Point**

  **What to do**:
  Create `server/binary-entry.ts` — the entry point for `bun build --compile`. This file handles binary-specific setup before delegating to the CLI.

  Key responsibilities:
  1. **Detect binary mode**: `if (typeof Bun !== 'undefined' && Bun.isBun)` or check if `process.argv[1]` contains `/bunfs/`
  2. **Set up path aliases**: Override `findServerRoot` / `findAppRoot` to work in `/$bunfs/root/` context
     - In binary mode, the "app root" is the directory containing the binary or `os.homedir()/.hoocowork`
     - The virtual `/$bunfs/root/` is the project root during compilation
  3. **Initialize embedded asset serving**: Before starting the Express server, populate the embedded assets map
  4. **Set `process.env.BINARY_MODE = 'true'`** flag for CLI/runtime to detect
  5. **Handle .env loading**: Read `.env` from user's home dir (`~/.hoocowork/.env`) instead of app root
  6. **Data directory**: Use `~/.hoocowork/` for database, config, logs in binary mode
  7. **Import and delegate**: `await import('./cli.js')` — re-export the main function

  The file should be self-contained (no imports from outside the project that won't bundle).

  **Acceptance**:
  - `bun build --compile server/binary-entry.ts --outfile=hoocowork` succeeds
  - `./hoocowork --version` shows version
  - `./hoocowork --help` shows help
  - `./hoocowork status` works (shows config from home dir)

  **References**:
  - `server/cli.js:20` — current path resolution that fails in binary mode
  - `server/utils/runtime-paths.js` — the `findAppRoot` and `findServerRoot` functions to override
  - `server/index.js:212-216` — static file serving from `APP_ROOT/dist`
  - `server/load-env.js` — env loading to adapt

  **Must NOT do**:
  - Do NOT modify the existing `server/cli.js` or `server/index.js` logic for npm mode
  - Do NOT add platform-specific code that breaks on other OS

  **QA Scenarios**:
  ```
  Scenario: Binary compiles and displays version
    Steps:
      1. bun build --compile server/binary-entry.ts --outfile=/tmp/hoocowork-test
      2. /tmp/hoocowork-test --version
    Expected: Prints version number, exits 0

  Scenario: Binary shows help
    Steps:
      1. /tmp/hoocowork-test --help
    Expected: Prints help text, exits 0
  ```

  **Commit**: YES — `feat(binary): add binary entry point with embedded asset support`

- [x] 1c. **Update CLI for Binary-Aware Updates**

  **What to do**:
  Modify `server/cli.js` to handle binary-mode updates differently:

  1. **`updatePackage()` function (line 232)**:
     - If `process.env.BINARY_MODE === 'true'`, use GitHub Releases API instead of `npm update`
     - Check `https://api.github.com/repos/kolisachint/hoocowork/releases/latest`
     - Download the appropriate binary for the current platform (win-x64, linux-x64, darwin-arm64, darwin-x64)
     - Replace the current binary (on Unix: `mv` new binary over old; on Windows: rename trick)
     - Show platform-appropriate instructions

  2. **`checkForUpdates()` function (line 209)**:
     - In binary mode, check GitHub Releases API for latest version tag
     - Compare with current version from package.json (embedded)

  3. **`showStatus()` function (line 92)**:
     - In binary mode, show binary install path instead of npm install dir

  Platform detection helper in binary mode:
  ```js
  function getBinaryPlatform() {
    if (process.platform === 'win32') return 'windows-x64';
    if (process.platform === 'darwin') return process.arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
    return 'linux-x64';
  }
  ```

  **References**:
  - `server/cli.js:209-251` — current update logic
  - `server/cli.js:92-144` — current status display
  - `https://docs.github.com/en/rest/releases/releases` — GitHub Releases API

  **Acceptance**:
  - `hoocowork update` in binary mode checks GitHub Releases (not npm)
  - Status shows binary path information
  - All existing npm mode behavior unchanged

  **Must NOT do**:
  - Do NOT break npm mode — `process.env.BINARY_MODE` check must guard binary-only changes
  - Do NOT implement self-replacement (just download + instruct user)

  **Commit**: YES (with 1b) — `feat(binary): add binary entry point with embedded asset support`

### Wave 2: CI/CD

- [x] 2a. **Update Release Workflow with Matrix Build**

  **What to do**:
  Modify `.github/workflows/release.yml` to add a matrix build that compiles binaries for all platforms and attaches them to the GitHub Release.

  The build matrix:
  ```yaml
  strategy:
    matrix:
      include:
        - os: ubuntu-latest
          target: linux-x64
          binary-suffix: linux-x64
        - os: windows-latest
          target: windows-x64
          binary-suffix: win-x64.exe
        - os: macos-latest
          target: darwin-x64
          binary-suffix: darwin-x64
        - os: macos-latest
          target: darwin-arm64
          binary-suffix: darwin-arm64
  ```

  For each runner:
  1. Checkout + setup bun (already done)
  2. `bun install --frozen-lockfile`
  3. `bun run build` (build frontend + server)
  4. `bun run scripts/embed-assets.ts` (generate embedded assets module)
  5. `bun build --compile server/binary-entry.ts --outfile=hoocowork-${{ matrix.binary-suffix }}`
  6. Upload binary as release artifact

  Add a `release-binaries` job after the `release` job that:
  1. Downloads the npm-published build step's artifacts (or runs fresh install)
  2. Runs the matrix build
  3. Uploads all binaries to the GitHub Release via `gh release upload`

  Update the `gh release create` step to include binary attachments.

  Windows-specific flags to add:
  ```yaml
  - if: matrix.target == 'windows-x64'
    run: bun build --compile server/binary-entry.ts --outfile=hoocowork-${{ matrix.binary-suffix }} --windows-hide-console
  ```

  **Acceptance**:
  - Workflow YAML validates
  - Matrix produces 4 binaries
  - Binaries uploaded to GitHub Release
  - Binary naming: `hoocowork-{version}-{platform}`

  **References**:
  - `.github/workflows/release.yml` — current release workflow
  - `https://docs.github.com/en/actions/using-jobs/using-a-build-matrix-for-your-jobs`

  **Must NOT do**:
  - Do NOT remove npm publish steps — both distribution methods coexist
  - Do NOT add code signing steps

  **Commit**: YES — `ci(binary): add matrix binary build to release workflow`

### Wave 3: Distribution

- [ ] 3a. **Create First GitHub Release with Binaries**

  **What to do**:
  Trigger the release workflow to produce the first binary distribution, or simulate manually:

  1. Ensure `server/binary-entry.ts` and `scripts/embed-assets.ts` are committed
  2. Build locally: `bun run build && bun run scripts/embed-assets.ts`
  3. Compile binary for local platform: `bun build --compile server/binary-entry.ts --outfile=hoocowork-darwin-arm64`
  4. `gh release create v0.1.0 --title "HooCowork v0.1.0" --notes "Initial binary release" ./hoocowork-darwin-arm64`
  5. Verify release shows on GitHub

  **Acceptance**:
  - GitHub Release exists with at least macOS ARM64 binary attached
  - Release page shows download links

  **Must NOT do**:
  - Do NOT delete the npm package — both coexist
  - Do NOT publish incomplete binaries

- [x] 3b. **Create Winget Manifest**

  **What to do**:
  Create a winget manifest for Windows distribution.

  1. Create `winget/kolisachint.hoocowork.yaml`:
  ```yaml
  PackageIdentifier: kolisachint.hoocowork
  PackageVersion: 0.1.0
  PackageLocale: en-US
  Publisher: kolisachint
  PackageName: HooCowork
  License: AGPL-3.0-or-later
  ShortDescription: A desktop and mobile UI for Claude Code, Cursor CLI, Codex, and Gemini-CLI
  InstallerUrls:
    - https://github.com/kolisachint/hoocowork/releases/download/v0.1.0/hoocowork-win-x64.exe
  InstallerType: portable
  InstallerSha256: <to-be-filled-after-build>
  ```

  2. Create `RELEASING.md` documentation for the release process:
     - How to trigger the release workflow
     - How to submit to winget-pkgs
     - Binary verification steps

  3. Document winget submission process:
     - Fork `https://github.com/microsoft/winget-pkgs`
     - Create manifest in `manifests/k/kolisachint/hoocowork/0.1.0/`
     - Submit PR

  **Acceptance**:
  - Winget manifest file created with correct structure
  - RELEASING.md documents full release process
  - SHA256 placeholder noted for CI fill-in

  **Commit**: YES — `docs(binary): add winget manifest and release documentation`

---

## Final Verification Wave

- [x] F1. **Plan Compliance** — `oracle`
  Verify: binary entry point exists, asset embedder works, CI workflow has matrix, winget manifest created. Check all "Must Have" items implemented.

- [x] F2. **Binary Smoke Tests** — `unspecified-high`
  Verify: compiled binary runs on current platform (`--version`, `--help`, `status`). Check binary size reasonable (< 200MB). Verify embedded assets accessible.

- [x] F3. **CI/CD Workflow Validation** — `unspecified-high`
  Verify: release workflow YAML validates. Matrix build steps correct. gh release upload steps present.

- [x] F4. **Distribution Docs** — `unspecified-high`
  Verify: RELEASING.md explains full process. Winget manifest correct. No missing fields.

---

## Commit Strategy

- **1**: `feat(binary): add asset embedding script and binary entry point`
  - Files: `scripts/embed-assets.ts`, `server/binary-entry.ts`, `server/generated/embedded-assets.ts` (generated)
- **2**: `ci(binary): add matrix binary build to release workflow`
  - Files: `.github/workflows/release.yml`
- **3**: `docs(binary): add winget manifest and release documentation`
  - Files: `winget/kolisachint.hoocowork.yaml`, `RELEASING.md`

---

## Success Criteria

- [ ] `bun build --compile server/binary-entry.ts --outfile=hoocowork` succeeds
- [ ] `./hoocowork --version` prints version
- [ ] `./hoocowork status` works in binary mode
- [ ] Release workflow matrix builds for 4 platforms
- [ ] GitHub Release has binary artifacts
- [ ] Winget manifest is ready for submission
