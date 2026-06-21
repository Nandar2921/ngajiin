export default function SkeletonSurah() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto px-4 py-8">
      <div className="h-10 bg-muted rounded w-64 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
