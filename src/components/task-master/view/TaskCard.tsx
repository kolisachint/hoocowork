import { memo } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronUp,
  Circle,
  Clock,
  Minus,
  Pause,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Tooltip } from '../../../shared/view/ui';
import type { TaskMasterTask } from '../types';

type TaskCardProps = {
  task: TaskMasterTask;
  onClick?: (() => void) | null;
  showParent?: boolean;
  className?: string;
};

type TaskStatusStyle = {
  icon: typeof Circle;
  statusText: string;
  iconColor: string;
  textColor: string;
};

function getStatusStyle(status?: string): TaskStatusStyle {
  if (status === 'done') {
    return {
      icon: CheckCircle,
      statusText: 'Done',
      iconColor: 'text-[var(--ok)]',
      textColor: 'text-[var(--ink)]',
    };
  }

  if (status === 'in-progress') {
    return {
      icon: Clock,
      statusText: 'In Progress',
      iconColor: 'text-[var(--brand-accent)]',
      textColor: 'text-[var(--ink)]',
    };
  }

  if (status === 'review') {
    return {
      icon: AlertCircle,
      statusText: 'Review',
      iconColor: 'text-[var(--warn)]',
      textColor: 'text-[var(--ink)]',
    };
  }

  if (status === 'deferred') {
    return {
      icon: Pause,
      statusText: 'Deferred',
      iconColor: 'text-[var(--ink-4)]',
      textColor: 'text-[var(--ink-3)]',
    };
  }

  if (status === 'cancelled') {
    return {
      icon: X,
      statusText: 'Cancelled',
      iconColor: 'text-[var(--err)]',
      textColor: 'text-[var(--ink-3)]',
    };
  }

  return {
    icon: Circle,
    statusText: 'Pending',
    iconColor: 'text-[var(--ink-4)]',
    textColor: 'text-[var(--ink)]',
  };
}

function renderPriorityIcon(priority?: string) {
  if (priority === 'high') {
    return (
      <Tooltip content="High priority">
        <span className="tm-prio tm-prio-high inline-flex h-4 w-4 items-center justify-center rounded">
          <ChevronUp className="h-2.5 w-2.5" />
        </span>
      </Tooltip>
    );
  }

  if (priority === 'medium') {
    return (
      <Tooltip content="Medium priority">
        <span className="tm-prio tm-prio-med inline-flex h-4 w-4 items-center justify-center rounded">
          <Minus className="h-2.5 w-2.5" />
        </span>
      </Tooltip>
    );
  }

  if (priority === 'low') {
    return (
      <Tooltip content="Low priority">
        <span className="tm-prio tm-prio-low inline-flex h-4 w-4 items-center justify-center rounded">
          <Circle className="h-1.5 w-1.5 fill-current" />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content="No priority set">
      <span className="tm-prio tm-prio-low inline-flex h-4 w-4 items-center justify-center rounded">
        <Circle className="h-1.5 w-1.5" />
      </span>
    </Tooltip>
  );
}

function getSubtaskProgress(task: TaskMasterTask): { completed: number; total: number; percentage: number } {
  const subtasks = task.subtasks ?? [];
  const total = subtasks.length;
  const completed = subtasks.filter((subtask) => subtask.status === 'done').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

function TaskCard({ task, onClick = null, showParent = false, className = '' }: TaskCardProps) {
  const statusStyle = getStatusStyle(task.status);
  const progress = getSubtaskProgress(task);

  return (
    <div
      className={cn(
        'tm-card',
        'hover:shadow-[var(--shadow-2)] hover:border-[var(--brand-accent)]/40 transition-all duration-200',
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default',
        className,
      )}
      onClick={onClick ?? undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Tooltip content={`Task ID: ${task.id}`}>
              <span className="tm-id rounded bg-[var(--paper-3)] px-2 py-0.5">
                {task.id}
              </span>
            </Tooltip>
          </div>

          <h3 className="tm-title line-clamp-2">
            {task.title}
          </h3>

          {showParent && task.parentId && (
            <span className="tm-meta">Task {task.parentId}</span>
          )}
        </div>

        <div className="flex-shrink-0">{renderPriorityIcon(task.priority)}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {Array.isArray(task.dependencies) && task.dependencies.length > 0 && (
            <Tooltip content={`Depends on: ${task.dependencies.map((dependency) => `Task ${dependency}`).join(', ')}`}>
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <ArrowRight className="h-3 w-3" />
                <span>Depends on: {task.dependencies.join(', ')}</span>
              </div>
            </Tooltip>
          )}
        </div>

        <Tooltip content={`Status: ${statusStyle.statusText}`}>
          <div className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-full', statusStyle.iconColor.replace('text-', 'bg-'))} />
            <span className={cn('text-xs font-medium', statusStyle.textColor)}>{statusStyle.statusText}</span>
          </div>
        </Tooltip>
      </div>

      {progress.total > 0 && (
        <div className="ml-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs text-[var(--ink-3)]">Progress:</span>
            <div className="h-1.5 flex-1 rounded-full bg-[var(--paper-3)]" title={`${progress.completed} of ${progress.total} subtasks completed`}>
              <div
                className={cn('h-full rounded-full transition-all duration-300', task.status === 'done' ? 'bg-[var(--ok)]' : 'bg-[var(--brand-accent)]')}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-xs text-[var(--ink-3)]">
              {progress.completed}/{progress.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TaskCard);
