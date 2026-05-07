type PositionBadgeProps = {
  position: string;
  value?: string;
};

export default function PositionBadge({ position, value = position }: PositionBadgeProps) {
  const toneClass =
    position === "1"
      ? "bg-yellow-500/20 text-yellow-300"
      : position === "2"
        ? "bg-slate-300/15 text-slate-200"
        : position === "3"
          ? "bg-orange-500/20 text-orange-300"
          : "bg-surface-muted text-text-secondary";

  return (
    <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${toneClass}`}>
      {value}
    </span>
  );
}
