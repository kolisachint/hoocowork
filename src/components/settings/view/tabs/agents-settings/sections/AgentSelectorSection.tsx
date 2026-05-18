import type { AgentProvider } from '../../../../types/types';
import type { AgentSelectorSectionProps } from '../types';

const AGENT_NAMES: Record<AgentProvider, string> = {
  claude: 'Claude Code',
  cursor: 'Cursor CLI',
  codex: 'Codex',
  gemini: 'Gemini CLI',
  hoocode: 'Hoocode',
  opencode: 'OpenCode',
};

const AGENT_GLYPHS: Record<AgentProvider, string> = {
  claude: '◆',
  cursor: '◇',
  codex: '○',
  gemini: '△',
  hoocode: '●',
  opencode: '◎',
};

export default function AgentSelectorSection({
  agents,
  selectedAgent,
  onSelectAgent,
  agentContextById,
}: AgentSelectorSectionProps) {
  const gridClass = agents.length >= 6 ? 'agent-selector x6' : 'agent-selector';
  return (
    <div className={gridClass}>
      {agents.map((agent) => {
        const authStatus = agentContextById[agent].authStatus;
        const isAuthed = authStatus.authenticated;
        return (
          <button
            key={agent}
            type="button"
            className={`agent-tile ${selectedAgent === agent ? 'active' : ''}`}
            onClick={() => onSelectAgent(agent)}
          >
            <span className="agent-glyph">{AGENT_GLYPHS[agent]}</span>
            <span className="agent-name truncate">{AGENT_NAMES[agent]}</span>
            <span className={`status-dot ${isAuthed ? 'dot-ok' : 'dot-off'}`} />
          </button>
        );
      })}
    </div>
  );
}
