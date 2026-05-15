import type { ReactNode } from 'react';

type QuickSettingsSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function QuickSettingsSection({
  title,
  children,
  className = '',
}: QuickSettingsSectionProps) {
  return (
    <div className={`qs-section ${className}`}>
      <h4 className="qs-section-title">
        {title}
      </h4>
      {children}
    </div>
  );
}
