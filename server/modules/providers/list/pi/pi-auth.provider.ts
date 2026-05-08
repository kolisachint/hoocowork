import { execSync } from 'node:child_process';
import type { IProviderAuth } from '@/shared/interfaces.js';
import type { ProviderAuthStatus } from '@/shared/types.js';

export class PiProviderAuth implements IProviderAuth {
  async getStatus(): Promise<ProviderAuthStatus> {
    try {
      execSync('pi --version', { stdio: 'ignore' });
      return {
        installed: true,
        provider: 'pi',
        authenticated: true,
        email: null,
        method: 'cli',
      };
    } catch {
      return {
        installed: false,
        provider: 'pi',
        authenticated: false,
        email: null,
        method: null,
      };
    }
  }
}
