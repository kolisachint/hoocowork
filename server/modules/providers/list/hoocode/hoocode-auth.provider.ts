import { execSync } from 'node:child_process';

import type { IProviderAuth } from '@/shared/interfaces.js';
import type { ProviderAuthStatus } from '@/shared/types.js';

export class HoocodeProviderAuth implements IProviderAuth {
  async getStatus(): Promise<ProviderAuthStatus> {
    try {
      execSync('pi --version', { stdio: 'ignore' });
      return {
        installed: true,
        provider: 'hoocode',
        authenticated: true,
        email: null,
        method: 'cli',
      };
    } catch {
      return {
        installed: false,
        provider: 'hoocode',
        authenticated: false,
        email: null,
        method: null,
      };
    }
  }
}
