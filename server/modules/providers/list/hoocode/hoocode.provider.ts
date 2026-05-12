import { AbstractProvider } from '@/modules/providers/shared/base/abstract.provider.js';
import { HoocodeProviderAuth } from '@/modules/providers/list/hoocode/hoocode-auth.provider.js';
import { HoocodeMcpProvider } from '@/modules/providers/list/hoocode/hoocode-mcp.provider.js';
import { HoocodeSessionSynchronizer } from '@/modules/providers/list/hoocode/hoocode-session-synchronizer.provider.js';
import { HoocodeSessionsProvider } from '@/modules/providers/list/hoocode/hoocode-sessions.provider.js';
import type { IProviderAuth, IProviderSessionSynchronizer, IProviderSessions } from '@/shared/interfaces.js';

export class HoocodeProvider extends AbstractProvider {
  readonly mcp = new HoocodeMcpProvider();
  readonly auth: IProviderAuth = new HoocodeProviderAuth();
  readonly sessions: IProviderSessions = new HoocodeSessionsProvider();
  readonly sessionSynchronizer: IProviderSessionSynchronizer = new HoocodeSessionSynchronizer();
  readonly sessionType = 'tree' as const;

  constructor() {
    super('hoocode');
  }
}
