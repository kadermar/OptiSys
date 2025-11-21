'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { CorrelationScatterPlot } from '@/components/compliance/CorrelationScatterPlot';
import { PredictiveAnalytics } from '@/components/dashboard/PredictiveAnalytics';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
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

        const [summaryRes, proceduresRes, scatterRes, facilitiesRes, workOrdersRes, workersRes] = await Promise.all([
          fetch(`/api/dashboard/summary?${params}`),
          fetch(`/api/dashboard/procedures?${params}`),
          fetch('/api/compliance/scatter'),
          fetch(`/api/dashboard/facilities?${params}`),
          fetch(`/api/dashboard/work-orders?${params}`),
          fetch(`/api/dashboard/workers?${params}`),
        ]);

        if (!summaryRes.ok || !proceduresRes.ok || !scatterRes.ok || !facilitiesRes.ok || !workOrdersRes.ok || !workersRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        setSummary(await summaryRes.json());
        setProcedures(await proceduresRes.json());
        setScatterData(await scatterRes.json());
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
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 animate-fadeIn">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Operational intelligence and performance analytics for compliance monitoring
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Link href="/procedures" className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer group">
              <div className="text-xs text-[#ff0000] font-medium mb-1">Procedure Analysis</div>
              <div className="text-sm text-[#1c2b40] group-hover:text-[#ff0000] transition-colors">Analyze procedures →</div>
            </Link>
            <Link href="/compliance-analysis" className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer group">
              <div className="text-xs text-[#ff0000] font-medium mb-1">Compliance</div>
              <div className="text-sm text-[#1c2b40] group-hover:text-[#ff0000] transition-colors">View analysis →</div>
            </Link>
            <Link href="/workers" className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer group">
              <div className="text-xs text-[#ff0000] font-medium mb-1">Worker Performance</div>
              <div className="text-sm text-[#1c2b40] group-hover:text-[#ff0000] transition-colors">View workers →</div>
            </Link>
            <Link href="/knowledge-base" className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer group">
              <div className="text-xs text-[#ff0000] font-medium mb-1">Knowledge Base</div>
              <div className="text-sm text-[#1c2b40] group-hover:text-[#ff0000] transition-colors">Browse data →</div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - 70% */}
          <div className="flex-1 lg:w-[70%] space-y-8">
            {/* Statistical Analysis */}
            <section className="animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              {scatterData.length > 0 && <CorrelationScatterPlot data={scatterData} />}
            </section>

            {/* Predictive Analytics */}
            <section className="animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <PredictiveAnalytics dateRange={dateRange} />
            </section>
          </div>

          {/* Right Column - 30% */}
          <div className="lg:w-[30%] space-y-6">
            {/* Key Insights & Recommendations */}
            <section className="animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <ExecutiveSummary procedureData={procedures} workerData={workers} />
            </section>

            {/* Compliance by Facility */}
            <section className="bg-white rounded-lg shadow-lg border-l-4 border-[#ff0000] p-6 animate-slideUp transition-colors duration-300" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <h3 className="text-lg font-bold mb-2 text-[#1c2b40] flex items-center gap-2">
                <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
                Compliance by Facility
              </h3>
              <p className="text-xs text-gray-600 mb-4">Cultural patterns across platforms</p>

              <div className="space-y-4">
                {facilities?.map((facility: any) => (
                  <div key={facility.facility_id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#1c2b40]">{facility.name}</p>
                        <p className="text-sm text-gray-600">{facility.performance_tier} Performer</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#1c2b40]">{facility.compliance_rate}%</p>
                        <p className="text-xs text-gray-600">
                          {facility.work_order_count} WOs, {facility.total_incidents} incidents
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1c2b40] h-2 rounded-full transition-all"
                        style={{ width: `${facility.compliance_rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-600 py-8 font-medium mt-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#ff0000] rounded-full"></div>
            <p>OptiSys - Management System Performance Intelligence</p>
            <div className="w-2 h-2 bg-[#ff0000] rounded-full"></div>
          </div>
        </footer>
      </main>
    </div>
  );
}
