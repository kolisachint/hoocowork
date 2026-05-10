import type { ReactNode } from 'react';

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Field({ label, hint, children, className }: FieldProps) {
  const cls = ['field', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {label ? <div className="field-label">{label}</div> : null}
      {children}
      {hint ? <div className="field-hint">{hint}</div> : null}
    </div>
  );
}
