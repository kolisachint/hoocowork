import type { ReactNode } from 'react';

type BadgeTone = 'default' | 'ok' | 'warn' | 'err' | 'info' | 'accent' | 'outline';

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

export default function Badge({ tone = 'default', children, className }: BadgeProps) {
  const cls = ['badge', `badge-${tone}`, className].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
