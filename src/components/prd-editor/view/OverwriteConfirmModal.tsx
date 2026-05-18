import { AlertTriangle, Save } from 'lucide-react';

type OverwriteConfirmModalProps = {
  isOpen: boolean;
  fileName: string;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function OverwriteConfirmModal({
  isOpen,
  fileName,
  saving,
  onCancel,
  onConfirm,
}: OverwriteConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="modal-shell relative w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--paper)] shadow-xl">
        <div className="modal-head">
          <div className="modal-head-title">
            <div className="modal-head-icon bg-[var(--warn-soft)] text-[var(--warn)]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3>File Already Exists</h3>
          </div>
        </div>

        <div className="modal-body">
          <p className="text-sm text-[var(--ink-3)]">
            A PRD named "{fileName}" already exists. Do you want to overwrite it?
          </p>
        </div>

        <div className="modal-foot">
          <button
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm text-[var(--ink-3)] transition-colors hover:bg-[var(--paper-2)]/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="hover:bg-[var(--warn)]/90 flex items-center gap-2 rounded-md bg-[var(--warn)] px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Overwrite'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
