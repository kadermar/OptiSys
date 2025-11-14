export function KnowledgeBaseSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Summary Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs Skeleton */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="px-6 py-4 border-b-2 border-transparent"
                >
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </nav>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 border-l-4 border-[#ff0000]">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-[#ff0000] rounded"></div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Filters Skeleton */}
            <div className="mb-4 flex items-center gap-3 flex-wrap">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Table Skeleton */}
            <div className="overflow-x-auto">
              <div className="space-y-3">
                {/* Table Header */}
                <div className="bg-gray-50 border-y border-gray-200 p-4">
                  <div className="grid grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                  <div key={row} className="border-b border-gray-200 p-4">
                    <div className="grid grid-cols-6 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((col) => (
                        <div key={col} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
