import os from 'node:os';
import path from 'node:path';

import { McpProvider } from '@/modules/providers/shared/mcp/mcp.provider.js';
import type { McpScope, ProviderMcpServer, UpsertProviderMcpServerInput } from '@/shared/types.js';
import {
  AppError,
  readJsonConfig,
  readObjectRecord,
  readOptionalString,
  readStringArray,
  readStringRecord,
  writeJsonConfig,
} from '@/shared/utils.js';

/**
 * OpenCode stores MCP servers under `mcp` in its global config.
 *
 * Phase 1: support the user-scope `~/.config/opencode/opencode.json` only.
 * Project-scoped MCP overrides are not yet exposed by the OpenCode CLI in a
 * stable location; revisit when needed.
 */
export class OpenCodeMcpProvider extends McpProvider {
  constructor() {
    super('opencode', ['user'], ['stdio', 'http']);
  }

  protected async readScopedServers(_scope: McpScope, _workspacePath: string): Promise<Record<string, unknown>> {
    const filePath = path.join(os.homedir(), '.config', 'opencode', 'opencode.json');
    const config = await readJsonConfig(filePath);
    return readObjectRecord(config.mcp) ?? {};
  }

  protected async writeScopedServers(
    _scope: McpScope,
    _workspacePath: string,
    servers: Record<string, unknown>,
  ): Promise<void> {
    const filePath = path.join(os.homedir(), '.config', 'opencode', 'opencode.json');
    const config = await readJsonConfig(filePath);
    config.mcp = servers;
    await writeJsonConfig(filePath, config);
  }

  protected buildServerConfig(input: UpsertProviderMcpServerInput): Record<string, unknown> {
    if (input.transport === 'stdio') {
      if (!input.command?.trim()) {
        throw new AppError('command is required for stdio MCP servers.', {
          code: 'MCP_COMMAND_REQUIRED',
          statusCode: 400,
        });
      }

      return {
        type: 'local',
        command: [input.command, ...(input.args ?? [])],
        environment: input.env ?? {},
        enabled: true,
      };
    }

    if (!input.url?.trim()) {
      throw new AppError('url is required for http MCP servers.', {
        code: 'MCP_URL_REQUIRED',
        statusCode: 400,
      });
    }

    return {
      type: 'remote',
      url: input.url,
      headers: input.headers ?? {},
      enabled: true,
    };
  }

  protected normalizeServerConfig(
    scope: McpScope,
    name: string,
    rawConfig: unknown,
  ): ProviderMcpServer | null {
    if (!rawConfig || typeof rawConfig !== 'object') {
      return null;
    }

    const config = rawConfig as Record<string, unknown>;
    const type = readOptionalString(config.type);

    if (type === 'local' || Array.isArray(config.command)) {
      const cmd = config.command;
      const [command, ...args] = Array.isArray(cmd) ? cmd.map(String) : [readOptionalString(cmd) ?? ''];
      return {
        provider: 'opencode',
        name,
        scope,
        transport: 'stdio',
        command,
        args: readStringArray(args),
        env: readStringRecord(config.environment ?? config.env),
      };
    }

    if (type === 'remote' || typeof config.url === 'string') {
      return {
        provider: 'opencode',
        name,
        scope,
        transport: 'http',
        url: readOptionalString(config.url) ?? '',
        headers: readStringRecord(config.headers),
      };
    }

    return null;
  }
}
