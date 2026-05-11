import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  Eye,
  Flag,
  List,
  Play,
  Settings,
  Target,
  Terminal,
  Zap,
} from 'lucide-react';

import { cn } from '../../../lib/utils';
import { useTaskMaster } from '../context/TaskMasterContext';

import TaskDetailModal from './TaskDetailModal';
import TaskMasterSetupModal from './modals/TaskMasterSetupModal';

type NextTaskBannerProps = {
  onShowAllTasks?: (() => void) | null;
  onStartTask?: (() => void) | null;
  className?: string;
};

function PriorityIndicator({ priority }: { priority?: string }) {
  if (priority === 'high') {
    return (
      <div className="bg-[var(--err)]/10 flex h-4 w-4 items-center justify-center rounded" title="High Priority">
        <Zap className="h-2.5 w-2.5 text-[var(--err)]" />
      </div>
    );
  }

  if (priority === 'medium') {
    return (
      <div className="bg-[var(--warn)]/10 flex h-4 w-4 items-center justify-center rounded" title="Medium Priority">
        <Flag className="h-2.5 w-2.5 text-[var(--warn)]" />
      </div>
    );
  }

  return (
    <div className="flex h-4 w-4 items-center justify-center rounded bg-muted" title="Low Priority">
      <Circle className="h-2.5 w-2.5 text-muted-foreground" />
    </div>
  );
}

export default function NextTaskBanner({ onShowAllTasks = null, onStartTask = null, className = '' }: NextTaskBannerProps) {
  const {
    nextTask,
    tasks,
    currentProject,
    isLoadingTasks,
    projectTaskMaster,
    refreshTasks,
    refreshProjects,
    setCurrentProject,
  } = useTaskMaster();

  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showSetupDetails, setShowSetupDetails] = useState(false);

  if (!currentProject || isLoadingTasks) {
    return null;
  }

  const hasTasks = Array.isArray(tasks) && tasks.length > 0;
  const hasTaskMaster = Boolean(projectTaskMaster?.hasTaskmaster || currentProject.taskmaster?.hasTaskmaster);

  const handleSetupRefresh = () => {
    void refreshProjects();
    setCurrentProject(currentProject);
    void refreshTasks();
  };

  if (!hasTasks && !hasTaskMaster) {
    return (
      <>
        <div className={cn('bg-[var(--brand-accent)]/5 border border-[var(--brand-accent)]/20 rounded-lg p-3 mb-4', className)}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <List className="h-4 w-4 text-[var(--brand-accent)]" />
              <p className="text-sm font-medium text-foreground">TaskMaster AI is not configured</p>
            </div>

            <button
              onClick={() => setShowSetupModal(true)}
              className="hover:bg-[var(--brand-accent)]/90 flex items-center gap-1 rounded bg-[var(--brand-accent)] px-2 py-1 text-xs text-white transition-colors"
            >
              <Terminal className="h-3 w-3" />
              Initialize
            </button>
          </div>

          <button
            onClick={() => setShowSetupDetails((current) => !current)}
            className="mt-2 flex items-center gap-1 text-xs text-[var(--brand-accent)] hover:underline"
          >
            <Settings className="h-3 w-3" />
            {showSetupDetails ? 'Hide details' : 'What is TaskMaster?'}
          </button>

          {showSetupDetails && (
            <div className="mt-3 space-y-1 text-xs text-foreground">
              <p>- AI-powered task management with dependencies and subtasks.</p>
              <p>- PRD-driven task generation for faster project bootstrapping.</p>
              <p>- Kanban and list views for day-to-day execution.</p>
            </div>
          )}
        </div>

        <TaskMasterSetupModal
          isOpen={showSetupModal}
          project={currentProject}
          onClose={() => setShowSetupModal(false)}
          onAfterClose={handleSetupRefresh}
        />
      </>
    );
  }

  if (nextTask) {
    return (
      <>
        <div className={cn('bg-muted/50 border border-border rounded-lg p-3 mb-4', className)}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="bg-[var(--brand-accent)]/10 flex h-5 w-5 items-center justify-center rounded-full">
                  <Target className="h-3 w-3 text-[var(--brand-accent)]" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Task {nextTask.id}</span>
                <PriorityIndicator priority={nextTask.priority} />
              </div>
              <p className="line-clamp-1 text-sm font-medium text-foreground">{nextTask.title}</p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                onClick={() => onStartTask?.()}
                className="hover:bg-[var(--brand-accent)]/90 flex items-center gap-1 rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-medium text-white"
              >
                <Play className="h-3 w-3" />
                Start Task
              </button>

              <button
                onClick={() => setShowTaskDetail(true)}
                className="rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                title="View task details"
              >
                <Eye className="h-3 w-3" />
              </button>

              {onShowAllTasks && (
                <button
                  onClick={onShowAllTasks}
                  className="rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                  title="View all tasks"
                >
                  <List className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <TaskDetailModal
          task={nextTask}
          isOpen={showTaskDetail}
          onClose={() => setShowTaskDetail(false)}
          onStatusChange={() => {
            void refreshTasks();
          }}
        />
      </>
    );
  }

  if (hasTasks) {
    const completedTasks = tasks.filter((task) => task.status === 'done').length;

    return (
      <div className={cn('bg-[var(--brand-accent)]/5 border border-[var(--brand-accent)]/20 rounded-lg p-3 mb-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[var(--brand-accent)]" />
            <span className="text-sm font-medium text-foreground">
              {completedTasks === tasks.length ? 'All tasks complete' : 'No pending tasks'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedTasks}/{tasks.length}
            </span>
            {onShowAllTasks && (
              <button
                onClick={onShowAllTasks}
                className="hover:bg-[var(--brand-accent)]/90 rounded bg-[var(--brand-accent)] px-2 py-1 text-xs text-white transition-colors"
              >
                Review
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
