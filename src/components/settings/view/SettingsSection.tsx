import type { ReactNode } from 'react';

import { cn } from '../../../lib/utils';

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <h3 className="t-eyebrow">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--ink-3)]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
