'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { CorrelationScatterPlot } from '@/components/compliance/CorrelationScatterPlot';
import { PredictiveAnalytics } from '@/components/dashboard/PredictiveAnalytics';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useTourSafe } from '@/components/tour';

export default function DashboardPage() {
  const tour = useTourSafe();
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

      {/* Tour Step 6 Guidance - Analytics Impact */}
      {tour?.isActive && tour?.currentStep === 6 && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 bg-gradient-to-r from-[#1c2b40] to-[#2d3e54] rounded-lg border-2 border-[#ff0000]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white font-bold flex-shrink-0">6</div>
              <div className="flex-1">
                <p className="text-white font-medium">Analytics Engine - See Your Data in Action</p>
                <p className="text-gray-300 text-sm">
                  The Analytics Engine correlates procedure adherence with operational outcomes. Your completed task
                  contributes to these metrics - demonstrating the measurable link between process compliance and business results.
                </p>
              </div>
            </div>
            {tour.completedWorkOrderId && (
              <div className="mt-3 p-3 bg-green-500/20 rounded border border-green-500/40">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <p className="text-green-300 text-sm">
                    Work Order #{tour.completedWorkOrderId} is now reflected in these analytics
                  </p>
                </div>
              </div>
            )}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-white/10 rounded border border-white/20">
                <p className="text-[#ff0000] font-medium">Correlation Analysis</p>
                <p className="text-gray-300 text-xs">Shows relationship between compliance and operational outcomes</p>
              </div>
              <div className="p-2 bg-white/10 rounded border border-white/20">
                <p className="text-[#ff0000] font-medium">Predictive Analytics</p>
                <p className="text-gray-300 text-xs">Risk scoring based on historical patterns</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tour Step 8 Guidance - Feedback Loop */}
      {tour?.isActive && tour?.currentStep === 8 && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 bg-gradient-to-r from-[#1c2b40] to-[#2d3e54] rounded-lg border-2 border-[#ff0000]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white font-bold flex-shrink-0">8</div>
              <div className="flex-1">
                <p className="text-white font-medium">Feedback Loop - Continuous Improvement</p>
                <p className="text-gray-300 text-sm">
                  Finally, the Feedback Loop closes the circle. Insights generated from analytics inform procedure updates.
                  When a procedure shows poor outcomes, the system flags it for review - creating continuous improvement without manual monitoring.
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-500/20 rounded border border-blue-500/40">
              <p className="text-blue-300 text-sm font-medium">Tour Complete!</p>
              <p className="text-gray-300 text-xs mt-1">
                You&apos;ve seen how OptiSys connects governance to operations. The Key Insights panel on the right
                shows AI-generated recommendations based on data patterns - explore freely or restart the tour anytime.
              </p>
            </div>
          </div>
        </div>
      )}

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
