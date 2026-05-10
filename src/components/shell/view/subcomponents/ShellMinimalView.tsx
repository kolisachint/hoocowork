import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { AuthCopyStatus } from '../../types/types';
import { resolveAuthUrlForDisplay } from '../../utils/auth';

type ShellMinimalViewProps = {
  terminalContainerRef: RefObject<HTMLDivElement>;
  authUrl: string;
  authUrlVersion: number;
  initialCommand: string | null | undefined;
  isConnected: boolean;
  openAuthUrlInBrowser: (url: string) => boolean;
  copyAuthUrlToClipboard: (url: string) => Promise<boolean>;
};

export default function ShellMinimalView({
  terminalContainerRef,
  authUrl,
  authUrlVersion,
  initialCommand,
  isConnected,
  openAuthUrlInBrowser,
  copyAuthUrlToClipboard,
}: ShellMinimalViewProps) {
  const [authUrlCopyStatus, setAuthUrlCopyStatus] = useState<AuthCopyStatus>('idle');
  const [isAuthPanelHidden, setIsAuthPanelHidden] = useState(false);

  const displayAuthUrl = useMemo(
    () => resolveAuthUrlForDisplay(initialCommand, authUrl),
    [authUrl, initialCommand],
  );

  // Keep auth panel UI state local to minimal mode and reset it when connection/url changes.
  useEffect(() => {
    setAuthUrlCopyStatus('idle');
    setIsAuthPanelHidden(false);
  }, [authUrlVersion, displayAuthUrl, isConnected]);

  const hasAuthUrl = Boolean(displayAuthUrl);
  const showMobileAuthPanel = hasAuthUrl && !isAuthPanelHidden;
  const showMobileAuthPanelToggle = hasAuthUrl && isAuthPanelHidden;

  return (
    <div className="relative h-full w-full bg-[var(--paper)]">
      <div
        ref={terminalContainerRef}
        className="h-full w-full focus:outline-none"
        style={{ outline: 'none' }}
      />

      {showMobileAuthPanel && (
        <div className="absolute inset-x-0 bottom-14 z-20 border-t border-border/80 bg-[var(--paper)]/95 p-3 backdrop-blur-sm md:hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Open or copy the login URL:</p>
              <button
                type="button"
                onClick={() => setIsAuthPanelHidden(true)}
                className="rounded bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground hover:bg-muted/80"
              >
                Hide
              </button>
            </div>

            <input
              type="text"
              value={displayAuthUrl}
              readOnly
              onClick={(event) => event.currentTarget.select()}
              className="w-full rounded border border-border bg-muted px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              aria-label="Authentication URL"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  openAuthUrlInBrowser(displayAuthUrl);
                }}
                className="flex-1 rounded bg-[var(--brand-accent)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--brand-accent)]/90"
              >
                Open URL
              </button>

              <button
                type="button"
                onClick={async () => {
                  const copied = await copyAuthUrlToClipboard(displayAuthUrl);
                  setAuthUrlCopyStatus(copied ? 'copied' : 'failed');
                }}
                className="flex-1 rounded bg-muted px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                {authUrlCopyStatus === 'copied' ? 'Copied' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMobileAuthPanelToggle && (
        <div className="absolute bottom-14 right-3 z-20 md:hidden">
          <button
            type="button"
            onClick={() => setIsAuthPanelHidden(false)}
            className="rounded bg-muted/95 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm hover:bg-muted/80"
          >
            Show login URL
          </button>
        </div>
      )}
    </div>
  );
}
