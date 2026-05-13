import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

type MenuProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export default function Menu({ className, children, ...rest }: MenuProps) {
  const cls = ['menu', className].filter(Boolean).join(' ');
  return (
    <div role="menu" className={cls} {...rest}>
      {children}
    </div>
  );
}

type MenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  shortcut?: ReactNode;
  danger?: boolean;
};

export function MenuItem({ shortcut, danger, className, children, ...rest }: MenuItemProps) {
  const cls = ['menu-item', danger ? 'is-danger' : null, className].filter(Boolean).join(' ');
  return (
    <button type="button" role="menuitem" className={cls} {...rest}>
      <span>{children}</span>
      {shortcut != null ? <span className="kbd-inline">{shortcut}</span> : null}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="menu-sep" />;
}

export function MenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['menu-label', className].filter(Boolean).join(' ')}>{children}</div>;
}
