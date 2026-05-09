import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import spawn from 'cross-spawn';

const KEYCHAIN_SERVICE = 'Claude Code-credentials';

/**
 * On macOS, recent Claude Code versions store OAuth credentials in the login
 * Keychain instead of `~/.claude/.credentials.json`. Try to read them.
 */
function readClaudeCredentialsFromKeychain(): unknown | null {
  if (process.platform !== 'darwin') {
    return null;
  }
  try {
    const result = spawn.sync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'], {
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 3000,
    });
    if (result.status !== 0) {
      return null;
    }
    const raw = result.stdout?.toString().trim();
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

import { resolveClaudeCodeExecutablePath } from '@/shared/claude-cli-path.js';
import type { IProviderAuth } from '@/shared/interfaces.js';
import type { ProviderAuthStatus } from '@/shared/types.js';
import { readObjectRecord, readOptionalString } from '@/shared/utils.js';

type ClaudeCredentialsStatus = {
  authenticated: boolean;
  email: string | null;
  method: string | null;
  error?: string;
};

export class ClaudeProviderAuth implements IProviderAuth {
  /**
   * Checks whether the Claude Code CLI is available on this host.
   */
  private checkInstalled(): boolean {
    const cliPath = resolveClaudeCodeExecutablePath(process.env.CLAUDE_CLI_PATH);
    try {
      spawn.sync(cliPath, ['--version'], { stdio: 'ignore', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns Claude installation and credential status using Claude Code's auth priority.
   */
  async getStatus(): Promise<ProviderAuthStatus> {
    const installed = this.checkInstalled();

    if (!installed) {
      return {
        installed,
        provider: 'claude',
        authenticated: false,
        email: null,
        method: null,
        error: 'Claude Code CLI is not installed',
      };
    }

    const credentials = await this.checkCredentials();

    return {
      installed,
      provider: 'claude',
      authenticated: credentials.authenticated,
      email: credentials.authenticated ? credentials.email || 'Authenticated' : credentials.email,
      method: credentials.method,
      error: credentials.authenticated ? undefined : credentials.error || 'Not authenticated',
    };
  }

  /**
   * Reads Claude settings env values that the CLI can use even when the server process env is empty.
   */
  private async loadSettingsEnv(): Promise<Record<string, unknown>> {
    try {
      const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
      const content = await readFile(settingsPath, 'utf8');
      const settings = readObjectRecord(JSON.parse(content));
      return readObjectRecord(settings?.env) ?? {};
    } catch {
      return {};
    }
  }

  /**
   * Checks Claude credentials in the same priority order used by Claude Code.
   */
  private async checkCredentials(): Promise<ClaudeCredentialsStatus> {
    if (process.env.ANTHROPIC_API_KEY?.trim()) {
      return { authenticated: true, email: 'API Key Auth', method: 'api_key' };
    }

    const settingsEnv = await this.loadSettingsEnv();
    if (readOptionalString(settingsEnv.ANTHROPIC_API_KEY)) {
      return { authenticated: true, email: 'API Key Auth', method: 'api_key' };
    }

    if (readOptionalString(settingsEnv.ANTHROPIC_AUTH_TOKEN)) {
      return { authenticated: true, email: 'Configured via settings.json', method: 'api_key' };
    }

    const fromFile = await this.readCredentialsFile();
    if (fromFile) {
      return fromFile;
    }

    const keychainCreds = readClaudeCredentialsFromKeychain();
    if (keychainCreds) {
      const fromKeychain = this.evaluateOauthBlob(keychainCreds, 'keychain');
      if (fromKeychain) {
        return fromKeychain;
      }
    }

    return { authenticated: false, email: null, method: null };
  }

  private async readCredentialsFile(): Promise<ClaudeCredentialsStatus | null> {
    try {
      const credPath = path.join(os.homedir(), '.claude', '.credentials.json');
      const content = await readFile(credPath, 'utf8');
      return this.evaluateOauthBlob(JSON.parse(content), 'credentials_file');
    } catch {
      return null;
    }
  }

  private evaluateOauthBlob(blob: unknown, method: string): ClaudeCredentialsStatus | null {
    const creds = readObjectRecord(blob) ?? {};
    const oauth = readObjectRecord(creds.claudeAiOauth);
    const accessToken = readOptionalString(oauth?.accessToken);
    if (!accessToken) {
      return null;
    }
    const expiresAt = typeof oauth?.expiresAt === 'number' ? oauth.expiresAt : undefined;
    const email = readOptionalString(creds.email) ?? readOptionalString(creds.user) ?? null;
    if (!expiresAt || Date.now() < expiresAt) {
      return { authenticated: true, email, method };
    }
    return {
      authenticated: false,
      email,
      method,
      error: 'OAuth token has expired. Please re-authenticate with claude login',
    };
  }
}
