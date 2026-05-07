import type { ReactNode } from "react";

type TableHeaderProps = {
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

export default function TableHeader({
  children,
  align = "left",
  className = "",
}: TableHeaderProps) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <th
      className={`px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-subtle ${alignClass} ${className}`}
    >
      {children}
    </th>
  );
}
