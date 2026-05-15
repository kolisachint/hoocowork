import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { LLMProvider } from '../../types/app';

type CliOption = {
  id: LLMProvider;
  name: string;
  vendor: string;
  glyph: string;
  desc: string;
};

const CLI_OPTIONS: CliOption[] = [
  { id: 'claude',  name: 'Claude Code',  vendor: 'Anthropic', glyph: '◆', desc: "Anthropic's official CLI for coding agents." },
  { id: 'cursor',  name: 'Cursor CLI',   vendor: 'Cursor',    glyph: '◇', desc: "Cursor's command-line interface." },
  { id: 'codex',   name: 'Codex',        vendor: 'OpenAI',    glyph: '○', desc: "OpenAI's Codex CLI." },
  { id: 'gemini',  name: 'Gemini CLI',   vendor: 'Google',    glyph: '△', desc: "Google's Gemini command-line interface." },
  { id: 'hoocode', name: 'HooCode', vendor: 'HooCowork', glyph: '▽', desc: "HooCowork's own coding agent." },
  { id: 'opencode', name: 'OpenCode',    vendor: 'OpenCode',  glyph: '□', desc: "OpenCode's command-line coding agent." },
];

type CliSelectionProps = {
  /** Called when user continues with a provider. Defaults to setting localStorage + navigating to chat. */
  onPick?: (provider: LLMProvider) => void;
  /** Optional override for the Skip button. When omitted, falls back to writing localStorage + navigating home. */
  onSkip?: () => void;
};

const VALID_PROVIDERS: ReadonlyArray<LLMProvider> = [
  'claude',
  'cursor',
  'codex',
  'gemini',
  'hoocode',
  'opencode',
];

const readPersistedProvider = (): LLMProvider => {
  try {
    const stored = localStorage.getItem('selected-provider') as LLMProvider | null;
    if (stored && VALID_PROVIDERS.includes(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return 'claude';
};

export default function CliSelection({ onPick, onSkip }: CliSelectionProps) {
  const [picked, setPicked] = useState<LLMProvider>(readPersistedProvider);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onPick) {
      onPick(picked);
      return;
    }

    try {
      localStorage.setItem('selected-provider', picked);
    } catch {
      // Silently ignore — localStorage may be unavailable
    }

    navigate('/');
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }

    try {
      localStorage.setItem('selected-provider', 'claude');
    } catch {
      // Silently ignore — localStorage may be unavailable
    }

    navigate('/');
  };

  const pickedName = CLI_OPTIONS.find((c) => c.id === picked)?.name ?? '';

  return (
    <section className="cli-select">
      <div className="cli-head">
        <div className="cli-eyebrow">Coding agent</div>
        <div className="cli-title">Pick a CLI.</div>
        <div className="cli-sub">
          You can switch later. Sessions live in your project&apos;s working directory regardless.
        </div>
      </div>

      <div className="cli-grid">
        {CLI_OPTIONS.map((cli) => (
          <button
            key={cli.id}
            type="button"
            className={`cli-card ${picked === cli.id ? 'picked' : ''}`}
            onClick={() => setPicked(cli.id)}
          >
            <div className="cli-glyph">{cli.glyph}</div>
            <div className="cli-name">{cli.name}</div>
            <div className="cli-vendor">{cli.vendor}</div>
            <div className="cli-desc">{cli.desc}</div>
            <div className="cli-mark">{picked === cli.id ? '✓ selected' : 'select'}</div>
          </button>
        ))}
      </div>

      <div className="cli-foot">
        <button type="button" className="btn btn-ghost" onClick={handleSkip}>
          Skip
        </button>
        <button type="button" className="btn btn-accent" onClick={handleContinue}>
          Continue with {pickedName} →
        </button>
      </div>
    </section>
  );
}
