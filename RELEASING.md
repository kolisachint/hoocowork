# Releasing HooCowork

## Overview

HooCowork is distributed two ways:

1. **npm package** (`@kolisachint/hoocowork`) -- for Node.js users
2. **Standalone binaries** -- for users without Node.js, distributed via GitHub Releases

Both are built and published by the same GitHub Actions workflow.

## Prerequisites

- Access to the GitHub repository with admin permissions
- `RELEASE_PAT` and `NPM_TOKEN` secrets configured in the repo
- (For winget submission) A GitHub account with a fork of microsoft/winget-pkgs

## Triggering a Release

### Via GitHub UI (Recommended)

1. Go to [Actions, Release](https://github.com/kolisachint/hoocowork/actions/workflows/release.yml)
2. Click "Run workflow"
3. Choose version bump: `patch`, `minor`, or `major`
4. Click "Run workflow"

### What the Workflow Does

The release workflow automates everything:

| Job | What it does |
|-----|-------------|
| `release` | Bumps version, generates changelog, tags commit, creates GitHub Release, publishes to npm |
| `release-binaries` | Matrix build across 5 platforms, compiles standalone binaries, uploads as artifacts |
| `upload-binaries` | Downloads all binary artifacts, attaches them to the GitHub Release |

### After the Workflow Completes

1. Verify the release shows up at [Releases](https://github.com/kolisachint/hoocowork/releases)
2. Check that all 5 binaries are attached:
   - `hoocowork-linux-x64`
   - `hoocowork-linux-arm64`
   - `hoocowork-darwin-x64`
   - `hoocowork-darwin-arm64`
   - `hoocowork-win-x64.exe`
3. Verify npm package is updated: `npm view @kolisachint/hoocowork version`

## Binary Distribution

### Download

Users can download binaries from the [Releases page](https://github.com/kolisachint/hoocowork/releases).

### Verify a Binary

```bash
# Check version
./hoocowork --version

# Check help
./hoocowork --help

# Check status
./hoocowork status
```

### Update

Binary users can update via:

```bash
hoocowork update
```

This checks GitHub Releases for newer versions and downloads the appropriate binary.

## Submitting to Winget

After each release, submit the updated winget manifest:

1. Fork [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs)
2. Clone your fork
3. Create the manifest directory:
   ```bash
   mkdir -p manifests/k/kolisachint/hoocowork/{VERSION}
   ```
4. Copy `winget/kolisachint.hoocowork.yaml` from this repo to that directory
5. Update `PackageVersion` and `InstallerUrl` with the new version
6. Compute SHA256 of the Windows binary:
   ```bash
   # On macOS/Linux:
   shasum -a 256 hoocowork-win-x64.exe

   # On Windows:
   certutil -hashfile hoocowork-win-x64.exe SHA256
   ```
7. Update `InstallerSha256` with the hash
8. Commit, push, and submit a PR to microsoft/winget-pkgs

### Winget Manifest Location

`winget/kolisachint.hoocowork.yaml` -- single-file manifest (ManifestType: singleton).

## Manual Build (for testing)

```bash
# Prerequisites
bun install

# Build frontend
bun run build

# Embed assets
bun run scripts/embed-assets.ts

# Compile binary for current platform
bun build --compile server/binary-entry.ts --outfile=hoocowork-$(node -e "console.log(process.platform + '-' + process.arch)").test
```

## Troubleshooting

### Binary fails to start

- Ensure the binary has execute permission: `chmod +x hoocowork-*`
- On macOS, if Gatekeeper blocks it: `xattr -d com.apple.quarantine hoocowork-*`

### Release workflow fails

- Check [Actions](https://github.com/kolisachint/hoocowork/actions) for error logs
- Common issues:
  - `RELEASE_PAT` secret expired, regenerate and update
  - `bun publish` fails, check npm token is valid
  - Binary compile fails, bun version compatibility issue

### npm mode vs binary mode

| Feature | npm mode | binary mode |
|---------|----------|-------------|
| Install | `npm install -g @kolisachint/hoocowork` | Download from Releases |
| Update | `npm update -g @kolisachint/hoocowork` | `hoocowork update` |
| Config | `.env` in app root | `~/.hoocowork/.env` |
| Database | `~/.hoocowork/auth.db` | `~/.hoocowork/auth.db` |
| Entry point | `server/cli.js` | `server/binary-entry.ts`, binary |
