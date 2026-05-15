#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import os from 'os';

import packageJson from '../package.json' with { type: 'json' };
import embeddedAssets from './generated/embedded-assets.js';
import { applyEmbeddedConfig } from './generated/embedded-config.js';

const hasBunfsPath = (p: string) => p.includes('/bunfs/') || p.includes('/$bunfs/');
// @ts-expect-error — Bun global is available only at runtime
const isBinaryMode = typeof Bun !== 'undefined' && process.argv[1] && hasBunfsPath(process.argv[1]);

if (isBinaryMode) {
  process.env.BINARY_MODE = 'true';
}

if (isBinaryMode && process.argv[1]) {
  const arg1 = process.argv[1];
  if (arg1.includes('/$bunfs/')) {
    process.env.APP_ROOT = '/$bunfs/root';
  } else if (arg1.includes('/bunfs/')) {
    process.env.APP_ROOT = arg1.split('/bunfs/')[0] + '/bunfs/root';
  }
}

function loadEnvFromHomedir() {
  try {
    const hoocoworkDir = path.join(os.homedir(), '.hoocowork');
    const envPath = path.join(hoocoworkDir, '.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const eqIndex = trimmedLine.indexOf('=');
          if (eqIndex > 0) {
            const key = trimmedLine.slice(0, eqIndex).trim();
            const value = trimmedLine.slice(eqIndex + 1).trim();
            if (key && !process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
    }
  } catch (e) {
  }
}

loadEnvFromHomedir();

// Apply embedded config defaults (lowest priority)
applyEmbeddedConfig();

if (isBinaryMode) {
  const hoocoworkDir = path.join(os.homedir(), '.hoocowork');
  try {
    if (!fs.existsSync(hoocoworkDir)) {
      fs.mkdirSync(hoocoworkDir, { recursive: true, mode: 0o700 });
    }
  } catch (e) {
  }
  if (!process.env.DATABASE_PATH) {
    process.env.DATABASE_PATH = path.join(hoocoworkDir, 'auth.db');
  }
}

(globalThis as any).__BINARY_PACKAGE_JSON__ = packageJson;
(globalThis as any).__EMBEDDED_ASSETS__ = embeddedAssets;

await import('./cli.js');
