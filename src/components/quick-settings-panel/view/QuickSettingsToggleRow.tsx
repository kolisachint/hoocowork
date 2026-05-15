import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

type QuickSettingsToggleRowProps = {
  label: string;
  icon: LucideIcon;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function QuickSettingsToggleRow({
  label,
  icon: Icon,
  checked,
  onCheckedChange,
}: QuickSettingsToggleRowProps) {
  return (
    <label className="qs-row">
      <span className="qs-row-label">
        <Icon style={{ width: 16, height: 16, color: 'var(--ink-3)' }} />
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="checkbox"
      />
    </label>
  );
}

export default memo(QuickSettingsToggleRow);
