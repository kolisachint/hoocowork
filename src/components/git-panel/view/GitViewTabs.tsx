import type { GitPanelView } from '../types/types';

type GitViewTabsProps = {
  activeView: GitPanelView;
  isHidden: boolean;
  changeCount: number;
  branchCount: number;
  onChange: (view: GitPanelView) => void;
};

const TABS: { id: GitPanelView; label: string }[] = [
  { id: 'changes', label: 'Changes' },
  { id: 'history', label: 'History' },
  { id: 'branches', label: 'Branches' },
];

export default function GitViewTabs({ activeView, isHidden, changeCount, branchCount, onChange }: GitViewTabsProps) {
  return (
    <div
      className={`git-tabs px-1 transition-all duration-300 ease-in-out ${
        isHidden ? 'max-h-0 -translate-y-2 overflow-hidden opacity-0' : 'max-h-16 translate-y-0 opacity-100'
      }`}
    >
      {TABS.map(({ id, label }) => {
        const showCount =
          (id === 'changes' && changeCount > 0) || (id === 'branches' && branchCount > 0);
        const count = id === 'changes' ? changeCount : branchCount;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`git-tab ${activeView === id ? 'active' : ''}`}
          >
            <span>{label}</span>
            {showCount && <span className="git-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
