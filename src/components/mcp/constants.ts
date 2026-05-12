import type { McpFormState, McpProvider, McpScope, McpTransport } from './types';

export const MCP_PROVIDER_NAMES: Record<McpProvider, string> = {
  claude: 'Claude',
  cursor: 'Cursor',
  codex: 'Codex',
  gemini: 'Gemini',
  hoocode: 'Hoocode',
  opencode: 'OpenCode',
};

export const MCP_SUPPORTED_SCOPES: Record<McpProvider, McpScope[]> = {
  claude: ['user', 'project', 'local'],
  cursor: ['user', 'project'],
  codex: ['user', 'project'],
  gemini: ['user', 'project'],
  hoocode: ['user'],
  opencode: ['user'],
};

export const MCP_SUPPORTED_TRANSPORTS: Record<McpProvider, McpTransport[]> = {
  claude: ['stdio', 'http', 'sse'],
  cursor: ['stdio', 'http'],
  codex: ['stdio', 'http'],
  gemini: ['stdio', 'http', 'sse'],
  hoocode: ['stdio', 'http'],
  opencode: ['stdio', 'http'],
};

export const MCP_GLOBAL_SUPPORTED_SCOPES: McpScope[] = ['user', 'project'];

export const MCP_GLOBAL_SUPPORTED_TRANSPORTS: McpTransport[] = ['stdio', 'http'];

export const MCP_PROVIDER_BUTTON_CLASSES: Record<McpProvider, string> = {
  claude: 'bg-[var(--brand-accent)] text-[var(--brand-accent-ink)] hover:opacity-90',
  cursor: 'bg-[var(--brand-accent)] text-[var(--brand-accent-ink)] hover:opacity-90',
  codex: 'bg-[var(--ink)] text-[var(--paper)] hover:opacity-90',
  gemini: 'bg-[var(--brand-accent)] text-[var(--brand-accent-ink)] hover:opacity-90',
  hoocode: 'bg-[var(--ok)] text-[var(--paper)] hover:opacity-90',
  opencode: 'bg-[var(--warn)] text-[var(--paper)] hover:opacity-90',
};

export const MCP_SUPPORTS_WORKING_DIRECTORY: Record<McpProvider, boolean> = {
  claude: false,
  cursor: false,
  codex: true,
  gemini: true,
  hoocode: false,
  opencode: false,
};

export const DEFAULT_MCP_FORM: McpFormState = {
  name: '',
  scope: 'user',
  workspacePath: '',
  transport: 'stdio',
  command: '',
  args: [],
  env: {},
  cwd: '',
  url: '',
  headers: {},
  envVars: [],
  bearerTokenEnvVar: '',
  envHttpHeaders: {},
  importMode: 'form',
  jsonInput: '',
};
