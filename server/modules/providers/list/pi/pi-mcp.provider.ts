import type { IProviderMcp } from '@/shared/interfaces.js';
import type { McpScope, ProviderMcpServer, UpsertProviderMcpServerInput } from '@/shared/types.js';

export class PiMcpProvider implements IProviderMcp {
  async listServers(_options?: { workspacePath?: string }): Promise<Record<McpScope, ProviderMcpServer[]>> {
    return { user: [], local: [], project: [] };
  }

  async listServersForScope(_scope: McpScope, _options?: { workspacePath?: string }): Promise<ProviderMcpServer[]> {
    return [];
  }

  async upsertServer(_input: UpsertProviderMcpServerInput): Promise<ProviderMcpServer> {
    throw new Error('Pi MCP servers are not yet supported.');
  }

  async removeServer(_input: { name: string; scope?: McpScope; workspacePath?: string }): Promise<{ removed: boolean; provider: 'pi'; name: string; scope: McpScope }> {
    return { removed: false, provider: 'pi', name: _input.name, scope: _input.scope ?? 'user' };
  }
}
