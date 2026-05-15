import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';

import { getStatusBadgeClass } from '../../utils/gitPanelUtils';

type FileStatusLegendProps = {
  isMobile: boolean;
};

const LEGEND_ITEMS = [
  { status: 'M', label: 'Modified' },
  { status: 'A', label: 'Added' },
  { status: 'D', label: 'Deleted' },
  { status: 'U', label: 'Untracked' },
] as const;

export default function FileStatusLegend({ isMobile }: FileStatusLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return null;
  }

  return (
    <div className="border-b border-[var(--line)]">
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-center gap-1 bg-[var(--paper)] px-4 py-2 text-sm text-[var(--ink-3)] transition-colors hover:bg-[var(--paper-2)]"
      >
        <Info className="h-3 w-3" />
        <span>File Status Guide</span>
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {isOpen && (
        <div className="bg-[var(--paper)] px-4 py-3 text-sm">
          <div className="flex justify-center gap-6">
            {LEGEND_ITEMS.map((item) => (
              <span key={item.status} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[var(--fs-xs)] font-bold ${getStatusBadgeClass(item.status)}`}
                >
                  {item.status}
                </span>
                <span className="italic text-[var(--ink-3)]">{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
