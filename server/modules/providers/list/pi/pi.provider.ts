import { AbstractProvider } from '@/modules/providers/shared/base/abstract.provider.js';
import { PiProviderAuth } from '@/modules/providers/list/pi/pi-auth.provider.js';
import { PiMcpProvider } from '@/modules/providers/list/pi/pi-mcp.provider.js';
import { PiSessionSynchronizer } from '@/modules/providers/list/pi/pi-session-synchronizer.provider.js';
import { PiSessionsProvider } from '@/modules/providers/list/pi/pi-sessions.provider.js';
import type { IProviderAuth, IProviderSessionSynchronizer, IProviderSessions } from '@/shared/interfaces.js';

export class PiProvider extends AbstractProvider {
  readonly mcp = new PiMcpProvider();
  readonly auth: IProviderAuth = new PiProviderAuth();
  readonly sessions: IProviderSessions = new PiSessionsProvider();
  readonly sessionSynchronizer: IProviderSessionSynchronizer = new PiSessionSynchronizer();
  readonly sessionType = 'tree' as const;

  constructor() {
    super('pi');
  }
}
