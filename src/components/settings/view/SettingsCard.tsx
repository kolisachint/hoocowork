import type { ReactNode } from 'react';

import { cn } from '../../../lib/utils';

type SettingsCardProps = {
  children: ReactNode;
  className?: string;
  divided?: boolean;
};

export default function SettingsCard({ children, className, divided }: SettingsCardProps) {
  return (
    <div
      className={cn(
        'border border-[var(--line)] bg-[var(--paper-2)]',
        divided && 'divide-y divide-[var(--line)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
