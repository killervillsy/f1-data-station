export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <div className="animate-pulse">
        <div className="mb-2 h-6 w-1/4 rounded bg-skeleton"></div>

        <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-md border border-border bg-surface p-2">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-skeleton"></div>
                <div className="flex-1">
                  <div className="mb-1.5 h-4 w-3/4 rounded bg-skeleton"></div>
                  <div className="h-3 w-1/2 rounded bg-skeleton"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
