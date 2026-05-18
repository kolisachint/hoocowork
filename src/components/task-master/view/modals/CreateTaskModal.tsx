import { Sparkles, X } from 'lucide-react';

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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
            <h3>Create AI-Generated Task</h3>
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
            <div className="flex items-start gap-3">
              <div className="bg-[var(--brand-accent)]/10 mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                <Sparkles className="h-4 w-4 text-[var(--brand-accent)]" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-[var(--ink)]">Pro tip: ask Claude Code directly</h4>
                <p className="mb-3 text-sm text-[var(--ink-3)]">
                  Ask for a task in chat with context and requirements. TaskMaster can generate implementation-ready tasks.
                </p>
                <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-3">
                  <p className="mb-1 text-xs font-medium text-[var(--ink-3)]">Example:</p>
                  <p className="font-mono text-sm text-[var(--ink)]">
                    Please add a task for profile image uploads and include best-practice research.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-4 text-center">
            <a
              href="https://github.com/eyaltoledano/claude-task-master/blob/main/docs/examples.md"
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
            className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-3)] hover:bg-[var(--paper-2)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
