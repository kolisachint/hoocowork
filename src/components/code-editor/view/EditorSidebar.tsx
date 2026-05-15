import { useState, useEffect, useRef } from 'react';
import type { MouseEvent, MutableRefObject } from 'react';

import type { CodeEditorFile } from '../types/types';

import CodeEditor from './CodeEditor';

type EditorSidebarProps = {
  editingFile: CodeEditorFile | null;
  isMobile: boolean;
  editorExpanded: boolean;
  editorWidth: number;
  resizeHandleRef: MutableRefObject<HTMLDivElement | null>;
  onResizeStart: (event: MouseEvent<HTMLDivElement>) => void;
  onCloseEditor: () => void;
  onToggleEditorExpand: () => void;
  projectPath?: string;
};

// Minimum width for the left content (file tree, chat, etc.)
const MIN_LEFT_CONTENT_WIDTH = 200;
// Minimum width for the editor sidebar
const MIN_EDITOR_WIDTH = 280;

export default function EditorSidebar({
  editingFile,
  isMobile,
  editorExpanded,
  editorWidth,
  resizeHandleRef,
  onResizeStart,
  onCloseEditor,
  onToggleEditorExpand,
  projectPath,
}: EditorSidebarProps) {
  const [poppedOut, setPoppedOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveWidth, setEffectiveWidth] = useState(editorWidth);

  // Adjust editor width when container size changes to ensure buttons are always visible
  useEffect(() => {
    if (!editingFile || isMobile || poppedOut) return;

    const updateWidth = () => {
      if (!containerRef.current) return;
      const parentElement = containerRef.current.parentElement;
      if (!parentElement) return;

      const containerWidth = parentElement.clientWidth;

      // Calculate maximum allowed editor width
      const maxEditorWidth = containerWidth - MIN_LEFT_CONTENT_WIDTH;

      if (maxEditorWidth < MIN_EDITOR_WIDTH) {
        // Not enough space - pop out the editor so user can still see everything
        setPoppedOut(true);
      } else if (editorWidth > maxEditorWidth) {
        // Editor is too wide - constrain it to ensure left content has space
        setEffectiveWidth(maxEditorWidth);
      } else {
        setEffectiveWidth(editorWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    // Also use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(updateWidth);
    const parentEl = containerRef.current?.parentElement;
    if (parentEl) {
      resizeObserver.observe(parentEl);
    }

    return () => {
      window.removeEventListener('resize', updateWidth);
      resizeObserver.disconnect();
    };
  }, [editingFile, isMobile, poppedOut, editorWidth]);

  if (!editingFile) {
    return null;
  }

  if (isMobile || poppedOut) {
    return (
      <CodeEditor
        file={editingFile}
        onClose={() => {
          setPoppedOut(false);
          onCloseEditor();
        }}
        projectPath={projectPath}
        isSidebar={false}
      />
    );
  }

  // Editor uses a fixed pixel width across every tab so the split feels
  // consistent whether you opened the file from chat, files, git, etc.
  // `editorExpanded` is the only mode that takes the full pane.
  const useFlexLayout = editorExpanded;

  return (
    // The outer container also needs flex-1 whenever the inner is flex-1.
    // Otherwise the inner's `flex-1` resolves against a zero-width parent and
    // the editor (header buttons included) collapses off-screen — the symptom
    // is "save/close buttons missing until you click another tab".
    <div ref={containerRef} className={`flex h-full min-w-0 ${useFlexLayout ? 'flex-1' : 'flex-shrink-0'}`}>
      {!editorExpanded && (
        <div
          ref={resizeHandleRef}
          onMouseDown={onResizeStart}
          className="group relative w-3 flex-shrink-0 cursor-col-resize bg-[var(--line)]/30 hover:bg-[var(--line)]/50"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--line)] transition-colors group-hover:bg-[var(--brand-accent)]" />
          <div className="absolute inset-y-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-0.5">
            <div className="h-1 w-1 rounded-full bg-[var(--muted-foreground)]/40 transition-colors group-hover:bg-[var(--brand-accent)]" />
            <div className="h-1 w-1 rounded-full bg-[var(--muted-foreground)]/40 transition-colors group-hover:bg-[var(--brand-accent)]" />
            <div className="h-1 w-1 rounded-full bg-[var(--muted-foreground)]/40 transition-colors group-hover:bg-[var(--brand-accent)]" />
          </div>
        </div>
      )}

      <div
        className={`h-full overflow-hidden ${useFlexLayout ? 'min-w-0 flex-1' : 'flex-shrink-0'}`}
        style={useFlexLayout ? undefined : { width: `${effectiveWidth}px`, minWidth: `${MIN_EDITOR_WIDTH}px` }}
      >
        <CodeEditor
          file={editingFile}
          onClose={onCloseEditor}
          projectPath={projectPath}
          isSidebar
          isExpanded={editorExpanded}
          onToggleExpand={onToggleEditorExpand}
          onPopOut={() => setPoppedOut(true)}
        />
      </div>
    </div>
  );
}
