type ShellEmptyStateProps = {
  title: string;
  description: string;
};

export default function ShellEmptyState({ title, description }: ShellEmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-[#8A8A82]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A1A17]">
          <svg className="h-8 w-8 text-[#5C5C56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[#ECECE6]">{title}</h3>
        <p className="text-[#8A8A82]">{description}</p>
      </div>
    </div>
  );
}
