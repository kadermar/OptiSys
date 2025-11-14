export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fadeIn">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Panel 1: Executive Summary Skeleton */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-lg p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panel 2: Correlation Proof Skeleton */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-96 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </section>

        {/* Panel 3: Drilldown Cards Skeleton */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-lg p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border-2 rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-10 w-full bg-gray-200 rounded"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
