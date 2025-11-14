'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DrilldownCards } from '@/components/dashboard/DrilldownCards';
import { ProcedureStepAnalysis } from '@/components/dashboard/ProcedureStepAnalysis';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ProcedureDrilldownPage() {
  const params = useParams();
  const procedureId = params.id as string;

  const [procedures, setProcedures] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proceduresRes, workOrdersRes] = await Promise.all([
          fetch('/api/dashboard/procedures'),
          fetch('/api/dashboard/work-orders'),
        ]);

        if (!proceduresRes.ok || !workOrdersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        setProcedures(await proceduresRes.json());
        setWorkOrders(await workOrdersRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load procedure data. Please try again.');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  const procedure = procedures.find(p => p.procedure_id === procedureId);
  const filteredWorkOrders = workOrders.filter(wo => wo.procedure_id === procedureId);

  if (!procedure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-yellow-600 dark:text-yellow-400 text-xl mb-4">⚠️ Not Found</div>
          <p className="text-gray-700 dark:text-gray-300">Procedure not found</p>
          <Link href="/procedures" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
            Return to Procedures
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {procedure.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {procedure.category} • {procedure.procedure_id}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Procedure Statistics */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Procedure Statistics</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Compliance Rate */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Compliance Rate</div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {procedure.compliance_rate}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {procedure.compliant_count}/{procedure.total_work_orders} compliant
              </div>
            </div>

            {/* Incident Rate */}
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Incident Rate</div>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {procedure.incident_rate}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {procedure.incident_count} incidents
              </div>
            </div>

            {/* Quality Score */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Avg Quality Score</div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {procedure.avg_quality_score ? Number(procedure.avg_quality_score).toFixed(1) : 'N/A'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                out of 5.0
              </div>
            </div>

            {/* Rework Rate */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Rework Rate</div>
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {procedure.rework_rate}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {procedure.rework_count} reworks
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Work Orders</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {procedure.total_work_orders}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Duration</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {procedure.avg_duration ? Number(procedure.avg_duration).toFixed(1) : 'N/A'}h
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Downtime</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {procedure.avg_downtime ? Number(procedure.avg_downtime).toFixed(1) : 'N/A'}h
              </div>
            </div>
          </div>
        </section>

        {/* Work Order Details */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6">
          <DrilldownCards
            workOrders={filteredWorkOrders}
            selectedProcedureId={procedureId}
          />
        </section>

        {/* Step-by-Step Analysis */}
        <section>
          <ProcedureStepAnalysis
            procedures={[procedure]}
            dateRange={{ start: '2024-01-01', end: '2024-09-30' }}
          />
        </section>
      </main>
    </div>
  );
}
