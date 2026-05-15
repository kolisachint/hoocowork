import type { ConfirmActionType, FileStatusCode, GitStatusGroupEntry } from '../types/types';

export const DEFAULT_BRANCH = 'main';
export const RECENT_COMMITS_LIMIT = 10;

export const FILE_STATUS_GROUPS: GitStatusGroupEntry[] = [
  { key: 'modified', status: 'M' },
  { key: 'added', status: 'A' },
  { key: 'deleted', status: 'D' },
  { key: 'untracked', status: 'U' },
];

export const FILE_STATUS_LABELS: Record<FileStatusCode, string> = {
  M: 'Modified',
  A: 'Added',
  D: 'Deleted',
  U: 'Untracked',
};

export const FILE_STATUS_BADGE_CLASSES: Record<FileStatusCode, string> = {
  M: 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]/30',
  A: 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]/30',
  D: 'bg-[var(--err-soft)] text-[var(--err)] border-[var(--err)]/30',
  U: 'bg-[var(--paper-3)] text-[var(--ink-3)] border-[var(--line)]',
};

export const CONFIRMATION_TITLES: Record<ConfirmActionType, string> = {
  discard: 'Discard Changes',
  delete: 'Delete File',
  commit: 'Confirm Action',
  pull: 'Confirm Pull',
  push: 'Confirm Push',
  publish: 'Publish Branch',
  revertLocalCommit: 'Revert Local Commit',
  deleteBranch: 'Delete Branch',
};

export const CONFIRMATION_ACTION_LABELS: Record<ConfirmActionType, string> = {
  discard: 'Discard',
  delete: 'Delete',
  commit: 'Confirm',
  pull: 'Pull',
  push: 'Push',
  publish: 'Publish',
  revertLocalCommit: 'Revert Commit',
  deleteBranch: 'Delete',
};

export const CONFIRMATION_BUTTON_CLASSES: Record<ConfirmActionType, string> = {
  discard: 'bg-[var(--err)] hover:bg-[var(--err)] hover:opacity-90 text-[var(--paper)]',
  delete: 'bg-[var(--err)] hover:bg-[var(--err)] hover:opacity-90 text-[var(--paper)]',
  commit: 'bg-[var(--ink)] hover:opacity-90 text-[var(--paper)]',
  pull: 'bg-[var(--ok)] hover:bg-[var(--ok)] hover:opacity-90 text-[var(--paper)]',
  push: 'bg-[var(--warn)] hover:bg-[var(--warn)] hover:opacity-90 text-[var(--paper)]',
  publish: 'bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-2)] text-[var(--brand-accent-ink)]',
  revertLocalCommit: 'bg-[var(--warn)] hover:bg-[var(--warn)] hover:opacity-90 text-[var(--paper)]',
  deleteBranch: 'bg-[var(--err)] hover:bg-[var(--err)] hover:opacity-90 text-[var(--paper)]',
};

export const CONFIRMATION_ICON_CONTAINER_CLASSES: Record<ConfirmActionType, string> = {
  discard: 'bg-[var(--err-soft)]',
  delete: 'bg-[var(--err-soft)]',
  commit: 'bg-[var(--warn-soft)]',
  pull: 'bg-[var(--warn-soft)]',
  push: 'bg-[var(--warn-soft)]',
  publish: 'bg-[var(--warn-soft)]',
  revertLocalCommit: 'bg-[var(--warn-soft)]',
  deleteBranch: 'bg-[var(--err-soft)]',
};

export const CONFIRMATION_ICON_CLASSES: Record<ConfirmActionType, string> = {
  discard: 'text-[var(--err)]',
  delete: 'text-[var(--err)]',
  commit: 'text-[var(--warn)]',
  pull: 'text-[var(--warn)]',
  push: 'text-[var(--warn)]',
  publish: 'text-[var(--warn)]',
  revertLocalCommit: 'text-[var(--warn)]',
  deleteBranch: 'text-[var(--err)]',
};
