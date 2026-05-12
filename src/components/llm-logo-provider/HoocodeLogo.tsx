type HoocodeLogoProps = {
  className?: string;
};

export default function HoocodeLogo({ className = 'w-5 h-5' }: HoocodeLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        H
      </text>
    </svg>
  );
}
