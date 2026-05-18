import { useEffect } from 'react';
import { Check, Download, RotateCcw, Trash2, Upload } from 'lucide-react';

import {
  CONFIRMATION_ACTION_LABELS,
  CONFIRMATION_BUTTON_CLASSES,
  CONFIRMATION_ICON_CONTAINER_CLASSES,
  CONFIRMATION_TITLES,
} from '../../constants/constants';
import type { ConfirmationRequest } from '../../types/types';

type ConfirmActionModalProps = {
  action: ConfirmationRequest | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function renderConfirmActionIcon(actionType: ConfirmationRequest['type']) {
  if (actionType === 'discard' || actionType === 'delete') {
    return <Trash2 className="h-4 w-4" />;
  }

  if (actionType === 'commit') {
    return <Check className="h-4 w-4" />;
  }

  if (actionType === 'pull') {
    return <Download className="h-4 w-4" />;
  }

  if (actionType === 'revertLocalCommit') {
    return <RotateCcw className="h-4 w-4" />;
  }

  return <Upload className="h-4 w-4" />;
}

export default function ConfirmActionModal({ action, onCancel, onConfirm }: ConfirmActionModalProps) {
  const titleId = action ? `confirmation-title-${action.type}` : undefined;

  useEffect(() => {
    if (!action) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [action, onCancel]);

  if (!action) {
    return null;
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="modal-shell relative w-full max-w-md overflow-hidden rounded-[var(--radius-2)] border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-head">
          <div className="modal-head-title">
            <div className={`modal-head-icon ${CONFIRMATION_ICON_CONTAINER_CLASSES[action.type]}`}>
              {renderConfirmActionIcon(action.type)}
            </div>
            <h3 id={titleId}>
              {CONFIRMATION_TITLES[action.type]}
            </h3>
          </div>
        </div>

        <div className="modal-body">
          <p className="text-[var(--fs-base)] text-[var(--ink-3)]">{action.message}</p>
        </div>

        <div className="modal-foot">
          <button
            onClick={onCancel}
            className="rounded-[var(--radius-1)] px-4 py-2 text-[var(--fs-sm)] text-[var(--ink-3)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex items-center gap-2 rounded-[var(--radius-1)] px-4 py-2 text-[var(--fs-sm)] text-white transition-colors ${CONFIRMATION_BUTTON_CLASSES[action.type]}`}
          >
            {renderConfirmActionIcon(action.type)}
            <span>{CONFIRMATION_ACTION_LABELS[action.type]}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
