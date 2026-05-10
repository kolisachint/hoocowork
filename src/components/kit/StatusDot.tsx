type StatusTone = 'ok' | 'busy' | 'off' | 'err';

type StatusDotProps = { tone?: StatusTone; className?: string };

export default function StatusDot({ tone = 'ok', className }: StatusDotProps) {
  const cls = ['status-dot', `dot-${tone}`, className].filter(Boolean).join(' ');
  return <span className={cls} />;
}
