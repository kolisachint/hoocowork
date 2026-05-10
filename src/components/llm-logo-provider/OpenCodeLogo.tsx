type OpenCodeLogoProps = {
  className?: string;
};

export default function OpenCodeLogo({ className = 'w-5 h-5' }: OpenCodeLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M7 9l-3 3 3 3M17 9l3 3-3 3M14 7l-4 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
