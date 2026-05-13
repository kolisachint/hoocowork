import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, ...rest }: SelectProps) {
  const cls = ['select', className].filter(Boolean).join(' ');
  return (
    <select className={cls} {...rest}>
      {children}
    </select>
  );
}
