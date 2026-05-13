import type { ReactNode } from 'react';

import StatusDot from './StatusDot';

type StatusTone = 'ok' | 'busy' | 'off' | 'err';

type StatusProps = {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
};

export default function Status({ tone = 'ok', children, className }: StatusProps) {
  const cls = ['status', className].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
