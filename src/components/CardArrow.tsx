type CardArrowProps = {
  className?: string;
};

export default function CardArrow({ className = "" }: CardArrowProps) {
  return (
    <svg
      className={`h-4 w-4 text-text-muted transition-colors group-hover:text-f1-red ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
