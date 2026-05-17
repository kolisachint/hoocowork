 
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { Terminal } from '@xterm/xterm';

import type { Project } from '../../../types/app';
import {
  CODEX_DEVICE_AUTH_URL,
  TERMINAL_DEFAULT_FONT_SIZE,
  TERMINAL_INIT_DELAY_MS,
  TERMINAL_MIN_COLS,
  TERMINAL_MIN_FONT_SIZE,
  TERMINAL_OPTIONS,
  TERMINAL_RESIZE_DELAY_MS,
} from '../constants/constants';
import { copyTextToClipboard } from '../../../utils/clipboard';
import { isCodexLoginCommand } from '../utils/auth';
import { sendSocketMessage } from '../utils/socket';
import { ensureXtermFocusStyles } from '../utils/terminalStyles';

type UseShellTerminalOptions = {
  terminalContainerRef: RefObject<HTMLDivElement>;
  terminalRef: MutableRefObject<Terminal | null>;
  fitAddonRef: MutableRefObject<FitAddon | null>;
  wsRef: MutableRefObject<WebSocket | null>;
  selectedProject: Project | null | undefined;
  minimal: boolean;
  isRestarting: boolean;
  initialCommandRef: MutableRefObject<string | null | undefined>;
  isPlainShellRef: MutableRefObject<boolean>;
  authUrlRef: MutableRefObject<string>;
  copyAuthUrlToClipboard: (url?: string) => Promise<boolean>;
  closeSocket: () => void;
};

type UseShellTerminalResult = {
  isInitialized: boolean;
  clearTerminalScreen: () => void;
  disposeTerminal: () => void;
};

export function useShellTerminal({
  terminalContainerRef,
  terminalRef,
  fitAddonRef,
  wsRef,
  selectedProject,
  minimal,
  isRestarting,
  initialCommandRef,
  isPlainShellRef,
  authUrlRef,
  copyAuthUrlToClipboard,
  closeSocket,
}: UseShellTerminalOptions): UseShellTerminalResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const resizeTimeoutRef = useRef<number | null>(null);
  const selectedProjectKey = selectedProject?.fullPath || selectedProject?.path || '';
  const hasSelectedProject = Boolean(selectedProject);

  useEffect(() => {
    ensureXtermFocusStyles();
  }, []);

  const clearTerminalScreen = useCallback(() => {
    if (!terminalRef.current) {
      return;
    }

    terminalRef.current.clear();
    terminalRef.current.write('\x1b[2J\x1b[H');
  }, [terminalRef]);

  // Scale font down on narrow viewports so the PTY still reports at least
  // TERMINAL_MIN_COLS columns. TUIs assume desktop-ish widths and wrap
  // garbage when the column count drops below ~80.
  const fitWithResponsiveFont = useCallback(() => {
    const term = terminalRef.current;
    const fit = fitAddonRef.current;
    if (!term || !fit) {
      return;
    }

    // Reset to the default font so proposeDimensions reflects max-sized cols
    // for the current container, then shrink only if we'd fall below the floor.
    if (term.options.fontSize !== TERMINAL_DEFAULT_FONT_SIZE) {
      term.options.fontSize = TERMINAL_DEFAULT_FONT_SIZE;
    }

    const proposed = fit.proposeDimensions();
    if (proposed && proposed.cols > 0 && proposed.cols < TERMINAL_MIN_COLS) {
      const scaled = Math.floor(
        (TERMINAL_DEFAULT_FONT_SIZE * proposed.cols) / TERMINAL_MIN_COLS,
      );
      const nextFontSize = Math.max(TERMINAL_MIN_FONT_SIZE, scaled);
      if (nextFontSize !== term.options.fontSize) {
        term.options.fontSize = nextFontSize;
      }
    }

    fit.fit();
  }, [fitAddonRef, terminalRef]);

  const disposeTerminal = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.dispose();
      terminalRef.current = null;
    }

    fitAddonRef.current = null;
    setIsInitialized(false);
  }, [fitAddonRef, terminalRef]);

  useEffect(() => {
    if (!terminalContainerRef.current || !hasSelectedProject || isRestarting || terminalRef.current) {
      return;
    }

    const nextTerminal = new Terminal(TERMINAL_OPTIONS);
    terminalRef.current = nextTerminal;

    const nextFitAddon = new FitAddon();
    fitAddonRef.current = nextFitAddon;
    nextTerminal.loadAddon(nextFitAddon);

    // Avoid wrapped partial links in compact login flows.
    if (!minimal) {
      nextTerminal.loadAddon(new WebLinksAddon());
    }

    try {
      nextTerminal.loadAddon(new WebglAddon());
    } catch {
      console.warn('[Shell] WebGL renderer unavailable, using Canvas fallback');
    }

    nextTerminal.open(terminalContainerRef.current);

    const copyTerminalSelection = async () => {
      const selection = nextTerminal.getSelection();
      if (!selection) {
        return false;
      }

      return copyTextToClipboard(selection);
    };

    const handleTerminalCopy = (event: ClipboardEvent) => {
      if (!nextTerminal.hasSelection()) {
        return;
      }

      const selection = nextTerminal.getSelection();
      if (!selection) {
        return;
      }

      event.preventDefault();

      if (event.clipboardData) {
        event.clipboardData.setData('text/plain', selection);
        return;
      }

      void copyTextToClipboard(selection);
    };

    terminalContainerRef.current.addEventListener('copy', handleTerminalCopy);

    nextTerminal.attachCustomKeyEventHandler((event) => {
      const activeAuthUrl = isCodexLoginCommand(initialCommandRef.current)
        ? CODEX_DEVICE_AUTH_URL
        : authUrlRef.current;

      if (
        event.type === 'keydown' &&
        minimal &&
        isPlainShellRef.current &&
        activeAuthUrl &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key?.toLowerCase() === 'c'
      ) {
        event.preventDefault();
        event.stopPropagation();
        void copyAuthUrlToClipboard(activeAuthUrl);
        return false;
      }

      if (
        event.type === 'keydown' &&
        (event.ctrlKey || event.metaKey) &&
        event.key?.toLowerCase() === 'c' &&
        nextTerminal.hasSelection()
      ) {
        event.preventDefault();
        event.stopPropagation();
        void copyTerminalSelection();
        return false;
      }

      if (
        event.type === 'keydown' &&
        (event.ctrlKey || event.metaKey) &&
        event.key?.toLowerCase() === 'v'
      ) {
        // Block native paste so data is only injected after clipboard-read resolves.
        event.preventDefault();
        event.stopPropagation();

        if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
          navigator.clipboard
            .readText()
            .then((text) => {
              sendSocketMessage(wsRef.current, {
                type: 'input',
                data: text,
              });
            })
            .catch(() => {});
        }

        return false;
      }

      return true;
    });

    window.setTimeout(() => {
      const currentTerminal = terminalRef.current;
      if (!currentTerminal) {
        return;
      }

      fitWithResponsiveFont();
      sendSocketMessage(wsRef.current, {
        type: 'resize',
        cols: currentTerminal.cols,
        rows: currentTerminal.rows,
      });
    }, TERMINAL_INIT_DELAY_MS);

    setIsInitialized(true);

    const dataSubscription = nextTerminal.onData((data) => {
      sendSocketMessage(wsRef.current, {
        type: 'input',
        data,
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        const currentTerminal = terminalRef.current;
        if (!currentTerminal) {
          return;
        }

        fitWithResponsiveFont();
        sendSocketMessage(wsRef.current, {
          type: 'resize',
          cols: currentTerminal.cols,
          rows: currentTerminal.rows,
        });
      }, TERMINAL_RESIZE_DELAY_MS);
    });

    resizeObserver.observe(terminalContainerRef.current);

    return () => {
      terminalContainerRef.current?.removeEventListener('copy', handleTerminalCopy);
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      dataSubscription.dispose();
      closeSocket();
      disposeTerminal();
    };
  }, [
    authUrlRef,
    closeSocket,
    copyAuthUrlToClipboard,
    disposeTerminal,
    fitAddonRef,
    fitWithResponsiveFont,
    initialCommandRef,
    isPlainShellRef,
    isRestarting,
    minimal,
    hasSelectedProject,
    selectedProjectKey,
    terminalContainerRef,
    terminalRef,
    wsRef,
  ]);

  return {
    isInitialized,
    clearTerminalScreen,
    disposeTerminal,
  };
}
