import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  subValue?: ReactNode;
  tone?: "default" | "red";
};

export default function StatCard({
  label,
  value,
  subValue,
  tone = "default",
}: StatCardProps) {
  const valueClassName = tone === "red" ? "text-f1-red" : "text-text-primary";

  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-base font-bold ${valueClassName}`}>{value}</p>
      {subValue ? <p className="mt-0.5 text-xs text-text-subtle">{subValue}</p> : null}
    </div>
  );
}
