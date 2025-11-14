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
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 animate-fadeIn">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Worker Performance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Detailed performance analysis and training recommendations for {workers.length} workers
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Total Workers</div>
              <div className="text-2xl font-bold text-[#1c2b40]">{workers.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Avg Compliance</div>
              <div className="text-2xl font-bold text-[#1c2b40]">
                {workers.length > 0 ? (workers.reduce((sum, w) => sum + parseFloat(w.compliance_rate.toString()), 0) / workers.length).toFixed(1) : 0}%
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Total Incidents</div>
              <div className="text-2xl font-bold text-[#1c2b40]">
                {workers.reduce((sum, w) => sum + (Number(w.incident_count) || 0), 0)}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Rework Cases</div>
              <div className="text-2xl font-bold text-[#1c2b40]">
                {workers.reduce((sum, w) => sum + (Number(w.rework_count) || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkerPerformanceDetailed workerData={workers} />
      </main>
    </div>
  );
}
