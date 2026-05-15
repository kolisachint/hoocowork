# Plan: NPM Publish + Binary Build + Standalone Initialization

## Goal
Publish hoocowork to npm, build binaries for all platforms, and initialize them with server details for standalone operation.

## Current State
- Package: `@kolisachint/hoocowork` v2.1.1
- Build system: Vite (client) + TypeScript (server)
- Binary entry: `server/binary-entry.ts`
- Assets embedding: `scripts/embed-assets.ts`
- GitHub Actions workflow exists for automated release

---

## Files to Modify

### 1. `package.json` (lines 1-50, scripts section)
**Changes:**
- Add `build:binary` script for local binary compilation
- Add `publish:npm` script for npm publishing
- Add `release:local` script to do everything locally

```json
{
  "scripts": {
    "build:binary": "bun run build && bun run scripts/embed-assets.ts && bun build --compile server/binary-entry.ts --outfile=hoocowork",
    "build:binary:all": "bun scripts/build-binaries-local.ts",
    "publish:npm": "npm run build && npm publish --access public",
    "release:local": "npm run build && npm run build:binary:all && echo 'Release complete. Binaries in ./binaries/'"
  }
}
```

### 2. `server/binary-entry.ts` (lines 1-60)
**Changes:**
- Add initialization of default server config on first run
- Ensure `~/.hoocowork/.env` is created with sensible defaults

Add after line 47 (after DATABASE_PATH setup):
```typescript
// Initialize default server configuration for standalone binaries
function initServerConfig() {
  const hoocoworkDir = path.join(os.homedir(), '.hoocowork');
  const envPath = path.join(hoocoworkDir, '.env');
  
  if (!fs.existsSync(envPath)) {
    const defaultConfig = `# HooCowork Standalone Configuration
# Generated on first run
SERVER_PORT=3001
HOST=0.0.0.0
CONTEXT_WINDOW=160000
VITE_CONTEXT_WINDOW=160000
DATABASE_PATH=${path.join(hoocoworkDir, 'auth.db')}
`;
    fs.writeFileSync(envPath, defaultConfig, 'utf8');
    console.log(`[init] Created default config: ${envPath}`);
  }
}
initServerConfig();
```

---

## New Files

### 1. `scripts/build-binaries-local.ts`
**Purpose:** Local binary build script for all platforms (mirrors CI but runs locally)

```typescript
#!/usr/bin/env bun
/**
 * Build hoocowork binaries for all platforms locally
 * Mirrors .github/workflows/release.yml binary build
 */

import { $ } from 'bun';
import fs from 'fs';
import path from 'path';

const PLATFORMS = [
  { name: 'darwin-arm64', target: 'bun-darwin-arm64' },
  { name: 'darwin-x64', target: 'bun-darwin-x64' },
  { name: 'linux-x64', target: 'bun-linux-x64' },
  { name: 'linux-arm64', target: 'bun-linux-arm64' },
  { name: 'win-x64', target: 'bun-windows-x64', ext: '.exe', windowsHide: true },
];

async function build() {
  console.log('==> Building client and server...');
  await $`bun run build`;

  console.log('==> Embedding assets...');
  await $`bun run scripts/embed-assets.ts`;

  console.log('==> Building binaries...');
  fs.mkdirSync('binaries', { recursive: true });

  for (const platform of PLATFORMS) {
    const outputName = `hoocowork-${platform.name}${platform.ext || ''}`;
    const outputPath = path.join('binaries', outputName);
    
    console.log(`Building ${outputName}...`);
    
    let args = [
      'build', '--compile',
      '--target', platform.target,
      'server/binary-entry.ts',
      '--outfile', outputPath
    ];
    
    if (platform.windowsHide) {
      args.push('--windows-hide-console');
    }
    
    await $`bun ${args}`;
    
    // Make executable on Unix
    if (!platform.ext) {
      fs.chmodSync(outputPath, 0o755);
    }
    
    console.log(`  ✓ ${outputPath}`);
  }

  console.log('\n==> Build complete!');
  console.log('Binaries in ./binaries/');
  for (const file of fs.readdirSync('binaries')) {
    const stats = fs.statSync(path.join('binaries', file));
    console.log(`  ${file} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  }
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
```

### 2. `scripts/publish-npm.sh`
**Purpose:** NPM publish script with checks

```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Checking npm authentication..."
npm whoami || (echo "Not logged in. Run: npm login" && exit 1)

echo "==> Building project..."
bun run build

echo "==> Running tests..."
bun test

echo "==> Publishing to npm..."
npm publish --access public

echo "==> Published successfully!"
```

---

## Verification Commands

### NPM Publish Verification:
```bash
# Check package
cd ~/github/hoocowork
npm pack --dry-run

# Check current version on npm
npm view @kolisachint/hoocowork version

# Login if needed
npm login

# Publish
npm run publish:npm
```

### Binary Build Verification:
```bash
# Build single local binary
bun run build:binary

# Build all platform binaries
bun run build:binary:all

# Test the binary
./hoocowork status
./hoocowork --port 8080
```

### Standalone Initialization Verification:
```bash
# Remove existing config to test fresh init
rm -rf ~/.hoocowork

# Run binary - should create config
./hoocowork status

# Verify config was created
cat ~/.hoocowork/.env
```

---

## Steps to Execute

1. **NPM Publish:**
   - Ensure logged in: `npm whoami`
   - Build and test: `bun run build && bun test`
   - Publish: `npm run publish:npm`

2. **Binary Build (Local):**
   - Single platform: `bun run build:binary`
   - All platforms: `bun run build:binary:all`

3. **Binary Standalone Initialization:**
   - First run creates `~/.hoocowork/.env` with defaults
   - Server starts with embedded assets (no dist/ needed)
   - Database created at `~/.hoocowork/auth.db`

---

## Notes

- Binary mode detection: checks for `/bunfs/` or `/$bunfs/` in argv[1]
- Embedded assets: Generated by `scripts/embed-assets.ts`, loaded via `globalThis.__EMBEDDED_ASSETS__`
- Config precedence: CLI args > ~/.hoocowork/.env > defaults
- The existing binary at `hoocowork-darwin-arm64` should be rebuilt after these changes
