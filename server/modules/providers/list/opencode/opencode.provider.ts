import { AbstractProvider } from '@/modules/providers/shared/base/abstract.provider.js';
import { OpenCodeProviderAuth } from '@/modules/providers/list/opencode/opencode-auth.provider.js';
import { OpenCodeMcpProvider } from '@/modules/providers/list/opencode/opencode-mcp.provider.js';
import { OpenCodeSessionSynchronizer } from '@/modules/providers/list/opencode/opencode-session-synchronizer.provider.js';
import { OpenCodeSessionsProvider } from '@/modules/providers/list/opencode/opencode-sessions.provider.js';
import type { IProviderAuth, IProviderSessionSynchronizer, IProviderSessions } from '@/shared/interfaces.js';

export class OpenCodeProvider extends AbstractProvider {
  readonly mcp = new OpenCodeMcpProvider();
  readonly auth: IProviderAuth = new OpenCodeProviderAuth();
  readonly sessions: IProviderSessions = new OpenCodeSessionsProvider();
  readonly sessionSynchronizer: IProviderSessionSynchronizer = new OpenCodeSessionSynchronizer();

  constructor() {
    super('opencode');
  }
}
