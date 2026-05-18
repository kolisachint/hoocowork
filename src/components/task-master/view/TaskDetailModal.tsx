import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  Edit,
  Pause,
  Save,
  X,
} from 'lucide-react';

import { cn } from '../../../lib/utils';
import { copyTextToClipboard } from '../../../utils/clipboard';
import { api } from '../../../utils/api';
import { useTaskMaster } from '../context/TaskMasterContext';
import type { TaskId, TaskMasterTask, TaskReference } from '../types';

type TaskDetailModalProps = {
  task: TaskMasterTask | null;
  isOpen?: boolean;
  className?: string;
  onClose: () => void;
  onEdit?: ((task: TaskMasterTask) => void) | null;
  onStatusChange?: ((taskId: TaskId, status: string) => void) | null;
  onTaskClick?: ((task: TaskReference) => void) | null;
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getStatusIcon(status?: string) {
  if (status === 'done') return CheckCircle;
  if (status === 'in-progress') return Clock;
  if (status === 'review') return AlertCircle;
  if (status === 'deferred') return Pause;
  if (status === 'cancelled') return X;
  return Circle;
}

function getPriorityBadgeClass(priority?: string): string {
  if (priority === 'high') return 'text-[var(--err)] bg-[var(--err)]/10';
  if (priority === 'medium') return 'text-[var(--warn)] bg-[var(--warn)]/10';
  if (priority === 'low') return 'text-[var(--brand-accent)] bg-[var(--brand-accent)]/10';
  return 'text-[var(--ink-3)] bg-[var(--paper-2)]';
}

export default function TaskDetailModal({
  task,
  isOpen = true,
  className = '',
  onClose,
  onEdit = null,
  onStatusChange = null,
  onTaskClick = null,
}: TaskDetailModalProps) {
  const { currentProject, refreshTasks } = useTaskMaster();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTestStrategy, setShowTestStrategy] = useState(false);
  const [editableTask, setEditableTask] = useState<TaskMasterTask | null>(task);

  useEffect(() => {
    setEditableTask(task);
    setIsEditMode(false);
  }, [task]);

  const StatusIcon = useMemo(() => getStatusIcon(task?.status), [task?.status]);

  if (!isOpen || !task || !editableTask) {
    return null;
  }

  const handleSaveChanges = async () => {
    if (!currentProject?.name) {
      return;
    }

    const updates: Record<string, string> = {};

    if (editableTask.title !== task.title) {
      updates.title = editableTask.title;
    }

    if (editableTask.description !== task.description) {
      updates.description = editableTask.description ?? '';
    }

    if (editableTask.details !== task.details) {
      updates.details = editableTask.details ?? '';
    }

    if (Object.keys(updates).length === 0) {
      setIsEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.taskmaster.updateTask(currentProject.name, task.id, updates);
      if (!response.ok) {
        const errorPayload = (await response.json()) as { message?: string };
        throw new Error(errorPayload.message ?? 'Failed to update task');
      }

      setIsEditMode(false);
      await refreshTasks();
      onEdit?.(editableTask);
    } catch (error) {
      console.error('Failed to save task changes:', error);
      alert(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusSelect = async (nextStatus: string) => {
    if (!currentProject?.name || nextStatus === task.status) {
      return;
    }

    try {
      const response = await api.taskmaster.updateTask(currentProject.name, task.id, { status: nextStatus });
      if (!response.ok) {
        const errorPayload = (await response.json()) as { message?: string };
        throw new Error(errorPayload.message ?? 'Failed to update task status');
      }

      await refreshTasks();
      onStatusChange?.(task.id, nextStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update task status');
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/50 md:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'modal-shell w-full md:max-w-4xl h-full md:h-[90vh] bg-[var(--paper)] border border-[var(--line)] md:rounded-lg shadow-xl flex flex-col',
          className,
        )}
      >
        <div className="modal-head p-4 md:p-6">
          <div className="modal-head-title flex min-w-0 flex-1 items-center gap-3">
            <StatusIcon className="h-6 w-6 text-[var(--brand-accent)]" />
            <div className="min-w-0 flex-1">
              <button
                onClick={() => copyTextToClipboard(String(task.id))}
                className="mb-2 inline-flex items-center gap-1 rounded bg-[var(--paper-2)] px-2 py-1 text-xs text-[var(--ink-3)] hover:bg-[var(--paper-3)]"
                title="Copy task ID"
              >
                <span>Task {task.id}</span>
                <Copy className="h-3 w-3" />
              </button>

              {isEditMode ? (
                <input
                  type="text"
                  value={editableTask.title}
                  onChange={(event) => setEditableTask({ ...editableTask, title: event.target.value })}
                  className="w-full border-b-2 border-[var(--brand-accent)] bg-transparent text-lg font-semibold text-[var(--ink)] focus:outline-none"
                />
              ) : (
                <h1 className="line-clamp-2 text-lg font-semibold text-[var(--ink)] md:text-xl">{task.title}</h1>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="icon-btn text-[var(--ok)] disabled:opacity-50"
                  title="Save"
                >
                  <Save className={cn('w-5 h-5', isSaving && 'animate-spin')} />
                </button>
                <button
                  onClick={() => {
                    setEditableTask(task);
                    setIsEditMode(false);
                  }}
                  disabled={isSaving}
                  className="icon-btn"
                  title="Cancel editing"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="icon-btn"
                title="Edit task"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button onClick={onClose} className="icon-btn" title="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink-3)]">Status</label>
              <select
                value={task.status ?? 'pending'}
                onChange={(event) => {
                  void handleStatusSelect(event.target.value);
                }}
                className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink-3)]">Priority</label>
              <div className={cn('px-3 py-2 rounded-md text-sm font-medium capitalize', getPriorityBadgeClass(task.priority))}>
                {task.priority ?? 'Not set'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink-3)]">Dependencies</label>
              {Array.isArray(task.dependencies) && task.dependencies.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {task.dependencies.map((dependency) => (
                    <button
                      key={String(dependency)}
                      onClick={() => onTaskClick?.({ id: dependency })}
                      className="bg-[var(--brand-accent)]/10 hover:bg-[var(--brand-accent)]/20 rounded px-2 py-1 text-sm text-[var(--brand-accent)]"
                    >
                      <ArrowRight className="mr-1 inline h-3 w-3" />
                      {dependency}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-[var(--ink-3)]">No dependencies</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--ink-3)]">Description</label>
            {isEditMode ? (
              <textarea
                rows={4}
                value={editableTask.description ?? ''}
                onChange={(event) => setEditableTask({ ...editableTask, description: event.target.value })}
                className="w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2"
              />
            ) : (
              <p className="whitespace-pre-wrap text-[var(--ink-3)]">{task.description || 'No description provided'}</p>
            )}
          </div>

          {task.details && (
            <div className="rounded-lg border border-[var(--line)]">
              <button
                onClick={() => setShowDetails((current) => !current)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-[var(--paper-2)]"
              >
                <span className="text-sm font-medium text-[var(--ink-3)]">Implementation Details</span>
                {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {showDetails && (
                <div className="border-t border-[var(--line)] p-4">
                  <p className="whitespace-pre-wrap text-[var(--ink-3)]">{task.details}</p>
                </div>
              )}
            </div>
          )}

          {task.testStrategy && (
            <div className="rounded-lg border border-[var(--line)]">
              <button
                onClick={() => setShowTestStrategy((current) => !current)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-[var(--paper-2)]"
              >
                <span className="text-sm font-medium text-[var(--ink-3)]">Test Strategy</span>
                {showTestStrategy ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {showTestStrategy && (
                <div className="bg-[var(--brand-accent)]/5 border-t border-[var(--line)] p-4">
                  <p className="whitespace-pre-wrap text-[var(--ink-3)]">{task.testStrategy}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
