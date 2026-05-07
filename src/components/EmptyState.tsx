type EmptyStateProps = {
  message: string;
  title?: string;
  className?: string;
};

export default function EmptyState({
  message,
  title,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted ${className}`}
    >
      {title ? (
        <p className="mb-1 text-sm font-bold text-text-primary">{title}</p>
      ) : null}
      <p>{message}</p>
    </div>
  );
}
