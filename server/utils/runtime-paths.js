import path from 'path';
import { fileURLToPath } from 'url';

export function getModuleDir(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}

export function findServerRoot(startDir) {
  // Source files live under /server, while compiled files live under /dist-server/server.
  // Walking up to the nearest "server" folder gives every backend module one stable anchor
  // that works in both layouts instead of relying on fragile "../.." assumptions.
  let currentDir = startDir;

  // In binary mode, if APP_ROOT is set but we can't find server folder,
  // return the current directory as a fallback (binary has different structure)
  if (process.env.BINARY_MODE === 'true' && process.env.APP_ROOT) {
    // Try to find server folder, but don't throw if not found in binary mode
    let searchDir = currentDir;
    for (let i = 0; i < 10; i++) { // Limit search depth
      if (path.basename(searchDir) === 'server') {
        return searchDir;
      }
      const parentDir = path.dirname(searchDir);
      if (parentDir === searchDir) break;
      searchDir = parentDir;
    }
    // Fallback: in binary mode, use current directory as server root
    return currentDir;
  }

  while (path.basename(currentDir) !== 'server') {
    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      throw new Error(`Could not resolve the backend server root from "${startDir}".`);
    }

    currentDir = parentDir;
  }

  return currentDir;
}

export function findAppRoot(startDir) {
  // Allow override via environment variable (used by binary entry point)
  if (process.env.APP_ROOT) {
    // Normalize path separators for cross-platform compatibility
    return process.env.APP_ROOT.replace(/\\/g, '/');
  }

  const serverRoot = findServerRoot(startDir);
  const parentOfServerRoot = path.dirname(serverRoot);

  // Source files live at <app>/server, while compiled files live at <app>/dist-server/server.
  // When the nearest server folder sits inside dist-server we need to hop one extra level up
  // so repo-level files still resolve from the real app root instead of the build directory.
  return path.basename(parentOfServerRoot) === 'dist-server'
    ? path.dirname(parentOfServerRoot)
    : parentOfServerRoot;
}
