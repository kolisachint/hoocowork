type ShellConnectionOverlayProps = {
  mode: 'loading' | 'connect' | 'connecting';
  description: string;
  loadingLabel: string;
  connectLabel: string;
  connectTitle: string;
  connectingLabel: string;
  onConnect: () => void;
};

export default function ShellConnectionOverlay({
  mode,
  description,
  loadingLabel,
  connectLabel,
  connectTitle,
  connectingLabel,
  onConnect,
}: ShellConnectionOverlayProps) {
  if (mode === 'loading') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0E0E0C]/90">
        <div className="font-term text-[#ECECE6]">{loadingLabel}</div>
      </div>
    );
  }

  if (mode === 'connect') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0E0E0C]/90 p-4">
        <div className="w-full max-w-sm text-center">
          <button
            onClick={onConnect}
            className="flex w-full items-center justify-center space-x-2 rounded bg-[#6FA98A] px-6 py-3 text-base font-medium text-[#0E0E0C] transition-colors hover:opacity-90 sm:w-auto font-term"
            title={connectTitle}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{connectLabel}</span>
          </button>
          <p className="mt-3 px-2 text-sm text-[#8A8A82] font-term">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0E0E0C]/90 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center space-x-3 text-[#D9788A]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D9788A] border-t-transparent"></div>
          <span className="text-base font-medium font-term">{connectingLabel}</span>
        </div>
        <p className="mt-3 px-2 text-sm text-[#8A8A82] font-term">{description}</p>
      </div>
    </div>
  );
}
