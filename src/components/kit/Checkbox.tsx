import type { InputHTMLAttributes, ReactNode } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
};

export default function Checkbox({ label, className, disabled, ...rest }: CheckboxProps) {
  const cls = ['checkbox', disabled ? 'is-disabled' : null, className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input type="checkbox" disabled={disabled} {...rest} />
      {label != null ? <span>{label}</span> : null}
    </label>
  );
}
