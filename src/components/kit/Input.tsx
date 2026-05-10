import type { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  prefix?: ReactNode;
};

export default function Input({ prefix, className, ...rest }: InputProps) {
  if (!prefix) {
    const cls = ['input', className].filter(Boolean).join(' ');
    return <input className={cls} {...rest} />;
  }
  const cls = ['input', 'with-prefix', className].filter(Boolean).join(' ');
  return (
    <div className="input-wrap">
      <span className="input-prefix">{prefix}</span>
      <input className={cls} {...rest} />
    </div>
  );
}
