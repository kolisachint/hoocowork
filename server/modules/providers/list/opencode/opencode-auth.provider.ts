import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import spawn from 'cross-spawn';

import type { IProviderAuth } from '@/shared/interfaces.js';
import type { ProviderAuthStatus } from '@/shared/types.js';
import { readObjectRecord } from '@/shared/utils.js';

type OpenCodeCredentialsStatus = {
  authenticated: boolean;
  email: string | null;
  method: string | null;
  error?: string;
};

export class OpenCodeProviderAuth implements IProviderAuth {
  /**
   * Checks whether the opencode CLI is available on PATH.
   */
  private checkInstalled(): boolean {
    try {
      const result = spawn.sync('opencode', ['--version'], { stdio: 'ignore', timeout: 5000 });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  /**
   * Returns OpenCode CLI installation and credential status.
   */
  async getStatus(): Promise<ProviderAuthStatus> {
    const installed = this.checkInstalled();

    if (!installed) {
      return {
        installed,
        provider: 'opencode',
        authenticated: false,
        email: null,
        method: null,
        error: 'OpenCode CLI is not installed',
      };
    }

    const credentials = await this.checkCredentials();

    return {
      installed,
      provider: 'opencode',
      authenticated: credentials.authenticated,
      email: credentials.email,
      method: credentials.method,
      error: credentials.authenticated ? undefined : credentials.error || 'No provider credentials configured',
    };
  }

  /**
   * Reads OpenCode auth.json — multi-provider credential store keyed by provider id.
   * A non-empty file means the user has configured at least one upstream provider.
   */
  private async checkCredentials(): Promise<OpenCodeCredentialsStatus> {
    try {
      const authPath = path.join(os.homedir(), '.local', 'share', 'opencode', 'auth.json');
      const content = await readFile(authPath, 'utf8');
      const parsed = readObjectRecord(JSON.parse(content)) ?? {};
      const providerKeys = Object.keys(parsed);

      if (providerKeys.length === 0) {
        return { authenticated: false, email: null, method: null, error: 'No provider credentials configured' };
      }

      const summary = providerKeys.length === 1
        ? `Configured: ${providerKeys[0]}`
        : `Configured: ${providerKeys.length} providers`;
      return { authenticated: true, email: summary, method: 'auth_file' };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      return {
        authenticated: false,
        email: null,
        method: null,
        error: code === 'ENOENT' ? 'OpenCode not configured' : error instanceof Error ? error.message : 'Failed to read OpenCode auth',
      };
    }
  }
}
