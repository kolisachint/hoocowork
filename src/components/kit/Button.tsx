import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonKind = 'solid' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: ReactNode;
  children?: ReactNode;
};

export default function Button({
  kind = 'outline',
  size = 'md',
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const cls = ['btn', `btn-${kind}`, `btn-${size}`, className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon ? <span className="btn-icon">{icon}</span> : null}
      {children}
    </button>
  );
}
