## [2026-05-12] Task 1b: Binary Entry Point

### Key Decisions
- **Binary detection**: Use `typeof Bun !== 'undefined' && process.argv[1]` combined with bunfs path check. Handles both `/$bunfs/` and `/bunfs/` path patterns since different bun versions use different formats.
- **APP_ROOT override**: `process.env.APP_ROOT` is set by binary-entry.ts and `runtime-paths.js:findAppRoot()` checks it first. This avoids modifying the existing path walking logic.
- **package.json embedding**: Statically imported via `import packageJson from '../package.json'` which bun's compiler bundles into the binary. Exposed via `globalThis.__BINARY_PACKAGE_JSON__`.
- **Embedded assets**: Loaded at startup via `import embeddedAssets from './generated/embedded-assets.ts'`. Exposed via `globalThis.__EMBEDDED_ASSETS__` for `server/index.js` to use later.
- **Homedir paths**: Binary mode uses `~/.hoocowork/` for data directory, `.env`, and database files.

### Verification Results
- `bun build --compile server/binary-entry.ts --outfile=/tmp/hoocowork-test` — succeeds, 560 modules bundled
- `/tmp/hoocowork-test --version` — prints `1.33.0`
- `/tmp/hoocowork-test --help` — shows help with correct URLs
- `/tmp/hoocowork-test status` — shows correct paths (APP_ROOT = `/$bunfs/root`, DB_PATH = `~/.hoocowork/auth.db`)
- `node server/cli.js --version` — unchanged, prints version (npm mode unaffected)
- `bun test` — 54 pass, 6 skip, 0 fail (no regressions)

### Files
- `server/binary-entry.ts` — new binary entry point (68 lines)
- `server/utils/runtime-paths.js` — added APP_ROOT env var check (+3 lines)
- `server/cli.js` — added BINARY_MODE + globalThis check for package.json resolution (+7 lines)

## [2026-05-12] Task 1c: Binary-Aware CLI Updates

### Changes Made
- **`showStatus()`** (line 142-147): Added binary-mode section showing "Standalone Binary" type, binary path from `process.argv[1]`, and `~/.hoocowork/` data directory
- **`checkForUpdates()`** (line 220-255): In binary mode, fetches from `https://api.github.com/repos/kolisachint/hoocowork/releases/latest` instead of `npm show`. Parses `tag_name` with `v` prefix stripping.
- **`getBinaryAssetName()`** (line 257-264): New helper returning platform-specific asset name (`hoocowork-darwin-arm64`, `hoocowork-win-x64.exe`, etc.)
- **`updatePackage()`** (line 267-342): In binary mode, downloads matching asset from GitHub Releases to temp path next to current binary, shows manual replacement instructions

### Key Decisions
- Download uses `Response.arrayBuffer()` + `Buffer.from()` + `fs.writeFileSync()` for maximum cross-runtime compatibility (works in both Bun and Node.js, unlike `body.pipe()`)
- Binary download saves to a `.tmp` file next to the current binary, then shows `mv` instructions (no self-replacement)
- All changes guarded by `process.env.BINARY_MODE === 'true'` — npm mode logic completely untouched

### Platform Assets Convention
- Windows: `hoocowork-win-x64.exe`
- macOS ARM: `hoocowork-darwin-arm64`
- macOS Intel: `hoocowork-darwin-x64`
- Linux x64: `hoocowork-linux-x64`

### Verification
- `bun build --compile` succeeds (560 modules)
- Binary `--version`, `--help`, `status` all work with correct binary output
- `node server/cli.js --version` works (npm mode)
- `bun test`: 54 pass, 6 skip, 0 fail

## [2026-05-12] Task 2a: Matrix Build in Release Workflow

### Changes Made
- Modified `.github/workflows/release.yml` (+79 lines)
- Added `--generate-notes` flag to existing `gh release create` step
- Added new `release-binaries` job (matrix: 5 platforms, `needs: release`)
- Added new `upload-binaries` job (`needs: [release, release-binaries]`)

### Matrix Platforms
| OS Runner | Binary Suffix | Flags |
|-----------|--------------|-------|
| ubuntu-latest | linux-x64 | (default) |
| ubuntu-latest | linux-arm64 | `--target=bun-linux-arm64` |
| windows-latest | win-x64.exe | `--target=bun-windows-x64 --windows-hide-console` |
| macos-latest | darwin-x64 | (default) |
| macos-latest | darwin-arm64 | (default) |

### Build Pipeline
`bun install` → `bun run build` → `bun run scripts/embed-assets.ts` → `bun build --compile` → upload artifact

### Verified
- YAML syntax valid (python3 yaml parser)
- `bun build --compile` still succeeds
- Binary `--version` works
- npm mode works

## [2026-05-12] Final Verification Wave (F1-F4)

### Results
- **F1 (Plan Compliance)**: APPROVE — all must-haves met, guardrails respected, structural requirements satisfied
- **F2 (Binary Smoke Tests)**: APPROVE — binary compiles, --version/--help/status work, 89MB size, embedded assets compile
- **F3 (CI/CD Workflow)**: APPROVE — release.yml valid, 5-platform matrix, npm publish preserved, no deprecated actions
- **F4 (Distribution Docs)**: APPROVE — winget manifest complete, RELEASING.md covers full release process

### Flagged Gap (not a blocker, noted for follow-up)
`server/index.js` has NOT been updated to serve from `globalThis.__EMBEDDED_ASSETS__`. In binary mode, `express.static(path.join(APP_ROOT, 'dist'))` at line 216 will attempt to read from bunfs virtual filesystem. The binary works for CLI commands today since they don't require the HTTP server. To fully serve the frontend UI from within the binary, `index.js` needs a middleware that checks `__EMBEDDED_ASSETS__` before falling back to `express.static`. This was flagged by F1.

### Key Achievements
- Cross-platform binary pipeline: asset embedding → binary compilation → CI matrix → GitHub Releases → winget
- Binary entry point with BINARY_MODE flag, APP_ROOT override, homedir paths (~/.hoocowork/)
- Binary-aware update via GitHub Releases API (cli.js)
- Release workflow with 5-platform matrix build (linux-x64, linux-arm64, win-x64.exe, darwin-x64, darwin-arm64)
- Winget manifest + RELEASING.md documentation
- Zero regressions: bun test 54/60 pass, npm mode unaffected
