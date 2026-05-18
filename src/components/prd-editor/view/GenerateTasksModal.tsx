import { Sparkles, X } from 'lucide-react';

import { PRD_DOCS_URL } from '../constants';

type GenerateTasksModalProps = {
  isOpen: boolean;
  fileName: string;
  onClose: () => void;
};

export default function GenerateTasksModal({
  isOpen,
  fileName,
  onClose,
}: GenerateTasksModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-shell w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--paper)] shadow-xl">
        <div className="modal-head">
          <div className="modal-head-title">
            <div className="modal-head-icon">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3>
              Generate Tasks from PRD
            </h3>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/5 rounded-lg border p-4">
            <h4 className="mb-2 font-semibold text-[var(--ink)]">
              Ask Claude Code directly
            </h4>
            <p className="mb-3 text-sm text-[var(--ink-3)]">
              Save this PRD, then ask Claude Code in chat to parse the file and create your initial tasks.
            </p>

            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-3">
              <p className="mb-1 text-xs font-medium text-[var(--ink-3)]">Example prompt</p>
              <p className="font-mono text-xs text-[var(--ink)]">
                I have a PRD at .taskmaster/docs/{fileName}. Parse it and create the initial tasks.
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-4 text-center">
            <a
              href={PRD_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--brand-accent)]/80 inline-block text-sm font-medium text-[var(--brand-accent)] underline"
            >
              View TaskMaster documentation
            </a>
          </div>
        </div>

        <div className="modal-foot">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-3)] transition-colors hover:bg-[var(--paper-2)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
