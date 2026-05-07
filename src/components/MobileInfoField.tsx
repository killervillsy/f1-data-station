import type { ReactNode } from "react";

type MobileInfoFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export default function MobileInfoField({
  label,
  value,
  className = "",
}: MobileInfoFieldProps) {
  return (
    <div className={`rounded border border-border bg-surface-elevated px-2 py-1 ${className}`}>
      <p className="text-[10px] text-text-subtle">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
