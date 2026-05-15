import { cn } from '../../../../lib/utils';

export type ToolStatus = 'running' | 'completed' | 'error' | 'denied';

const STATUS_CONFIG: Record<ToolStatus, { label: string; className: string }> = {
  running: {
    label: 'Running',
    className: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]',
  },
  completed: {
    label: 'Completed',
    className: 'bg-[var(--ok-soft)] text-[var(--ok)]',
  },
  error: {
    label: 'Error',
    className: 'bg-[var(--err-soft)] text-[var(--err)]',
  },
  denied: {
    label: 'Denied',
    className: 'bg-[var(--warn-soft)] text-[var(--warn)]',
  },
};

interface ToolStatusBadgeProps {
  status: ToolStatus;
  className?: string;
}

export function ToolStatusBadge({ status, className }: ToolStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-px text-[var(--fs-xs)] font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
