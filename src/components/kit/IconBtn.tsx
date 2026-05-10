import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export default function IconBtn({ children, className, ...rest }: IconBtnProps) {
  const cls = ['icon-btn', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
