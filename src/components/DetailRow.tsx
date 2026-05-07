import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value?: ReactNode;
  fallback?: ReactNode;
};

export default function DetailRow({
  label,
  value,
  fallback = "暂无可靠资料",
}: DetailRowProps) {
  return (
    <div className="rounded border border-border bg-surface-elevated px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-text-subtle">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-text-primary">
        {value || fallback}
      </p>
    </div>
  );
}
