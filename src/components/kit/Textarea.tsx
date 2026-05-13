import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...rest }: TextareaProps) {
  const cls = ['textarea', className].filter(Boolean).join(' ');
  return <textarea className={cls} {...rest} />;
}
