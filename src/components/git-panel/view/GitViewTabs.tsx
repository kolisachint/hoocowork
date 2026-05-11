import { FileText, GitBranch, History } from 'lucide-react';

import type { GitPanelView } from '../types/types';

type GitViewTabsProps = {
  activeView: GitPanelView;
  isHidden: boolean;
  changeCount: number;
  onChange: (view: GitPanelView) => void;
};

const TABS: { id: GitPanelView; label: string; Icon: typeof FileText }[] = [
  { id: 'changes', label: 'Changes', Icon: FileText },
  { id: 'history', label: 'Commits', Icon: History },
  { id: 'branches', label: 'Branches', Icon: GitBranch },
];

export default function GitViewTabs({ activeView, isHidden, changeCount, onChange }: GitViewTabsProps) {
  return (
    <div
      className={`git-tabs transition-all duration-300 ease-in-out ${
        isHidden ? 'max-h-0 -translate-y-2 overflow-hidden opacity-0' : 'max-h-16 translate-y-0 opacity-100'
      }`}
    >
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`git-tab flex-1 ${
            activeView === id ? 'active' : ''
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          {id === 'changes' && changeCount > 0 && (
            <span className="rounded-full bg-[var(--brand-accent-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--brand-accent)]">
              {changeCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
