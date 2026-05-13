import type { HTMLAttributes, ReactNode } from 'react';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  dashed?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  children: ReactNode;
};

export default function Chip({
  dashed,
  onRemove,
  removeLabel = 'Remove',
  className,
  children,
  ...rest
}: ChipProps) {
  const cls = ['chip', dashed ? 'chip-dashed' : null, className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
      {onRemove ? (
        <button
          type="button"
          className="chip-close"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
