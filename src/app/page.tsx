'use client';

import { useEffect, useState } from 'react';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { CorrelationProof } from '@/components/dashboard/CorrelationProof';
import { WorkerPerformance } from '@/components/dashboard/WorkerPerformance';
import { PredictiveAnalytics } from '@/components/dashboard/PredictiveAnalytics';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [correlation, setCorrelation] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-09-30' });


  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate });
    setLoading(true);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams({
          startDate: dateRange.start,
          endDate: dateRange.end,
        });

        const [summaryRes, proceduresRes, correlationRes, facilitiesRes, workOrdersRes, workersRes] = await Promise.all([
          fetch(`/api/dashboard/summary?${params}`),
          fetch(`/api/dashboard/procedures?${params}`),
          fetch(`/api/dashboard/correlation?${params}`),
          fetch(`/api/dashboard/facilities?${params}`),
          fetch(`/api/dashboard/work-orders?${params}`),
          fetch(`/api/dashboard/workers?${params}`),
        ]);

        if (!summaryRes.ok || !proceduresRes.ok || !correlationRes.ok || !facilitiesRes.ok || !workOrdersRes.ok || !workersRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        setSummary(await summaryRes.json());
        setProcedures(await proceduresRes.json());
        setCorrelation(await correlationRes.json());
        setFacilities(await facilitiesRes.json());
        setWorkOrders(await workOrdersRes.json());
        setWorkers(await workersRes.json());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please check your database connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-[#ff0000] text-xl mb-4">⚠️ Error</div>
          <p className="text-[#1c2b40]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn transition-colors duration-300">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 animate-slideUp sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Dashboard Overview</h1>
              <p className="text-sm text-gray-600 mt-1">
                {summary?.totalWorkOrders || 0} Work Orders | {summary?.overallCompliance || 0}% Compliant
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <DateRangePicker onDateRangeChange={handleDateRangeChange} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Executive Summary Cards */}
        <section className="animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <ExecutiveSummary procedureData={procedures} />
        </section>

        {/* Key Insights */}
        <section className="animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <WorkerPerformance workerData={workers} />
        </section>

        {/* Correlation Proof */}
        <section className="bg-white rounded-lg shadow-lg p-6 animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <CorrelationProof
            correlationData={correlation}
            procedureData={procedures}
            facilityData={facilities}
          />
        </section>

        {/* Predictive Analytics */}
        <section className="animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <PredictiveAnalytics dateRange={dateRange} />
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-8">
          <p>OptiSys - Management System Performance Intelligence</p>
        </footer>
      </main>
    </div>
  );
}
