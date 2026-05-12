import { ExternalLink, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

const CLOUDCLI_URL = 'https://cloudcli.ai';

type PremiumFeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  ctaText?: string;
};

export default function PremiumFeatureCard({
  icon,
  title,
  description,
  ctaText = 'Available with CloudCLI Pro',
}: PremiumFeatureCardProps) {
  return (
    <div className="p-5 border border-dashed" style={{ borderColor: 'var(--line)', background: 'var(--paper-2)' }}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--paper-3)', color: 'var(--ink-3)' }}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">{title}</h4>
            <Lock className="h-3 w-3" style={{ color: 'var(--ink-3)' }} />
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--ink-3)' }}>
            {description}
          </p>
          <a
            href={CLOUDCLI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline" style={{ color: 'var(--accent)' }}
          >
            {ctaText}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
