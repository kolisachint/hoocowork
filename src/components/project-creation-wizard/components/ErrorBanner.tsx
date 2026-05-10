import { AlertCircle } from 'lucide-react';

type ErrorBannerProps = {
  message: string;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-2)] border border-[var(--err)]/30 bg-[var(--err-soft)] p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--err)]" />
      <p className="text-sm text-[var(--err)]">{message}</p>
    </div>
  );
}
