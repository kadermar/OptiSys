'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DrilldownCards } from '@/components/dashboard/DrilldownCards';
import { ProcedureStepAnalysis } from '@/components/dashboard/ProcedureStepAnalysis';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useTourSafe } from '@/components/tour';

function ProceduresContent() {
  const searchParams = useSearchParams();
  const tour = useTourSafe();
  const [procedures, setProcedures] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);
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

        const proceduresData = await proceduresRes.json();
        setProcedures(proceduresData);
        setWorkOrders(await workOrdersRes.json());

        // Check if there's a selected parameter in the URL
        const selectedFromUrl = searchParams.get('selected');

        // If tour is active and has a selected procedure, use that
        if (tour?.isActive && tour?.selectedProcedureId && (tour?.currentStep === 3 || tour?.currentStep === 7)) {
          if (proceduresData.some((p: any) => p.procedure_id === tour.selectedProcedureId)) {
            setSelectedProcedureId(tour.selectedProcedureId);
          } else if (proceduresData.length > 0) {
            setSelectedProcedureId(proceduresData[0].procedure_id);
          }
        } else if (selectedFromUrl && proceduresData.some((p: any) => p.procedure_id === selectedFromUrl)) {
          // If there's a selected parameter and it exists in procedures, use it
          setSelectedProcedureId(selectedFromUrl);
        } else if (proceduresData.length > 0) {
          // Otherwise select first procedure by default
          setSelectedProcedureId(proceduresData[0].procedure_id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load procedure data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams, tour?.isActive, tour?.selectedProcedureId, tour?.currentStep]);

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

  const selectedProcedure = procedures.find(p => p.procedure_id === selectedProcedureId);
  const filteredWorkOrders = workOrders.filter(wo => wo.procedure_id === selectedProcedureId);

  if (!selectedProcedure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-yellow-600 text-xl mb-4">⚠️ No Procedures</div>
          <p className="text-gray-700">No procedures available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Procedures</h1>
              <p className="text-sm text-gray-600 mt-1">
                {procedures.length} total procedures
              </p>
            </div>
            {/* Procedure Selector */}
            <div className="flex-1 max-w-md">
              <select
                value={selectedProcedureId}
                onChange={(e) => setSelectedProcedureId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-[#1c2b40] font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
              >
                {procedures.map((procedure) => (
                  <option key={procedure.procedure_id} value={procedure.procedure_id}>
                    {procedure.name} ({procedure.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                {selectedProcedure.procedure_id}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tour Step 3 Guidance - View Procedure Details */}
      {tour?.isActive && tour?.currentStep === 3 && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 bg-gradient-to-r from-[#1c2b40] to-[#2d3e54] rounded-lg border-2 border-[#ff0000]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="text-white font-medium">Procedure Analysis - View Details & Metrics</p>
                <p className="text-gray-300 text-sm">
                  Now we drill into {tour.selectedProcedureName ? `"${tour.selectedProcedureName}"` : 'the selected procedure'}.
                  This view shows procedure-level analytics: compliance rates, incident correlation, and step-by-step adherence data.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-white/10 rounded border border-white/20">
                <p className="text-[#ff0000] font-medium">Procedure Statistics</p>
                <p className="text-gray-300 text-xs">Real-time metrics including compliance rate, incidents, and quality scores</p>
              </div>
              <div className="p-2 bg-white/10 rounded border border-white/20">
                <p className="text-[#ff0000] font-medium">Work Order History</p>
                <p className="text-gray-300 text-xs">Historical execution records with detailed outcomes</p>
              </div>
              <div className="p-2 bg-white/10 rounded border border-white/20">
                <p className="text-[#ff0000] font-medium">Step Analysis</p>
                <p className="text-gray-300 text-xs">Step-level adherence and quality metrics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tour Step 7 Guidance - View Work Order Impact */}
      {tour?.isActive && tour?.currentStep === 7 && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 bg-gradient-to-r from-[#1c2b40] to-[#2d3e54] rounded-lg border-2 border-[#ff0000]">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white font-bold flex-shrink-0">7</div>
              <div className="flex-1">
                <p className="text-white font-medium">Work Order Impact - See Your Task in the System</p>
                <p className="text-gray-300 text-sm">
                  Let&apos;s return to {tour.selectedProcedureName ? `"${tour.selectedProcedureName}"` : 'the procedure you worked on'}.
                  Your completed work order now appears in the history below. Notice how the compliance rate, quality scores, and step adherence metrics have been updated.
                </p>
              </div>
            </div>
            {tour.completedWorkOrderId && (
              <div className="mt-3 p-3 bg-green-500/20 rounded border border-green-500/40">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <p className="text-green-300 text-sm font-medium">
                    Your work order ({tour.completedWorkOrderId}) is now recorded in the system
                  </p>
                </div>
                <p className="text-gray-300 text-xs mt-1">
                  Scroll down to the Work Order Details section to see your task and its impact on metrics
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Procedure Statistics */}
        <section className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#ff0000]">
          <h2 className="text-xl font-bold text-[#1c2b40] mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Procedure Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Compliance Rate */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Compliance Rate</div>
              <div className="text-3xl font-bold text-green-700">
                {selectedProcedure.compliance_rate}%
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {selectedProcedure.compliant_count}/{selectedProcedure.total_work_orders} compliant
              </div>
            </div>

            {/* Incident Rate */}
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Incident Rate</div>
              <div className="text-3xl font-bold text-red-700">
                {selectedProcedure.incident_rate}%
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {selectedProcedure.incident_count} incidents
              </div>
            </div>

            {/* Quality Score */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Avg Quality Score</div>
              <div className="text-3xl font-bold text-blue-700">
                {selectedProcedure.avg_quality_score ? Number(selectedProcedure.avg_quality_score).toFixed(1) : 'N/A'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                out of 5.0
              </div>
            </div>

            {/* Rework Rate */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Rework Rate</div>
              <div className="text-3xl font-bold text-yellow-700">
                {selectedProcedure.rework_rate}%
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {selectedProcedure.rework_count} reworks
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600">Total Work Orders</div>
              <div className="text-xl font-bold text-[#1c2b40] mt-1">
                {selectedProcedure.total_work_orders}
              </div>
            </div>

            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600">Avg Duration</div>
              <div className="text-xl font-bold text-[#1c2b40] mt-1">
                {selectedProcedure.avg_duration ? Number(selectedProcedure.avg_duration).toFixed(1) : 'N/A'}h
              </div>
            </div>

            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600">Avg Downtime</div>
              <div className="text-xl font-bold text-[#1c2b40] mt-1">
                {selectedProcedure.avg_downtime ? Number(selectedProcedure.avg_downtime).toFixed(1) : 'N/A'}h
              </div>
            </div>
          </div>
        </section>

        {/* Work Order Details */}
        <section className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#ff0000]">
          <DrilldownCards
            workOrders={filteredWorkOrders}
            selectedProcedureId={selectedProcedureId}
          />
        </section>

        {/* Step-by-Step Analysis */}
        <section>
          <ProcedureStepAnalysis
            procedures={procedures}
            dateRange={{ start: '2024-01-01', end: '2024-09-30' }}
            fixedProcedureId={selectedProcedureId}
          />
        </section>
      </main>
    </div>
  );
}

export default function ProceduresPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProceduresContent />
    </Suspense>
  );
}
