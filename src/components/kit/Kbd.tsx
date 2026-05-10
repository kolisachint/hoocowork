import type { ReactNode } from 'react';

type KbdProps = { children: ReactNode; inline?: boolean; className?: string };

export default function Kbd({ children, inline, className }: KbdProps) {
  const cls = [inline ? 'kbd kbd-inline' : 'kbd', className].filter(Boolean).join(' ');
  return <kbd className={cls}>{children}</kbd>;
}
