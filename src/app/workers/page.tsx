'use client';

import { useEffect, useState } from 'react';
import { WorkerPerformanceDetailed } from '@/components/dashboard/WorkerPerformanceDetailed';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const workersRes = await fetch('/api/dashboard/workers');

        if (!workersRes.ok) {
          throw new Error('Failed to fetch worker data');
        }

        setWorkers(await workersRes.json());
      } catch (error) {
        console.error('Error fetching worker data:', error);
        setError('Failed to load worker data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-[#ff0000] text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Worker Performance</h1>
              <p className="text-sm text-gray-600 mt-1">
                {workers.length} workers tracked
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <WorkerPerformanceDetailed workerData={workers} />
        </div>
      </main>
    </div>
  );
}
