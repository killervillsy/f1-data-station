export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-10 bg-skeleton rounded-lg w-1/4 mb-8"></div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-skeleton"></div>
                <div className="flex-1">
                  <div className="h-4 bg-skeleton rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-skeleton rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
