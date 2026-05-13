import type { HTMLAttributes, ReactNode } from 'react';

type CardDensity = 'dense' | 'default' | 'roomy';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  density?: CardDensity;
  hoverable?: boolean;
  children: ReactNode;
};

export default function Card({
  density = 'default',
  hoverable,
  className,
  children,
  ...rest
}: CardProps) {
  const cls = [
    'card',
    density === 'dense' ? 'card-dense' : null,
    density === 'roomy' ? 'card-roomy' : null,
    hoverable ? 'card-hoverable' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['card-title', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['card-body', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardFoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['card-foot', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardMeta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={['card-meta', className].filter(Boolean).join(' ')}>{children}</span>;
}
