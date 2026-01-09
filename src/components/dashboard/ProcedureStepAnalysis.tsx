'use client';

import { useState, useEffect } from 'react';

interface StepData {
  step_id: string;
  procedure_id: string;
  procedure_name: string;
  step_number: number;
  step_name: string;
  criticality: string;
  typical_duration_minutes: number;
  verification_required: boolean;
  total_work_orders: number;
  checkpoint_count: number;
  completed_count: number;
  completion_rate: number;
  deviation_count: number;
  deviation_rate: number;
  quality_issue_count: number;
  quality_rate: number;
  avg_duration_minutes: number;
  duration_variance: number;
}

interface Procedure {
  procedure_id: string;
  name: string;
}

interface ProcedureStepAnalysisProps {
  procedures: Procedure[];
  dateRange: { start: string; end: string };
  fixedProcedureId?: string; // Optional: if provided, locks to this procedure
}

export function ProcedureStepAnalysis({ procedures, dateRange, fixedProcedureId }: ProcedureStepAnalysisProps) {
  // Initialize with fixedProcedureId to prevent fetching all data on first render
  const [selectedProcedure, setSelectedProcedure] = useState<string>(fixedProcedureId || 'all');
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);

  // Update selected procedure when fixedProcedureId changes
  useEffect(() => {
    if (fixedProcedureId) {
      setSelectedProcedure(fixedProcedureId);
    } else if (procedures.length === 1) {
      setSelectedProcedure(procedures[0].procedure_id);
    } else {
      setSelectedProcedure('all');
    }
  }, [fixedProcedureId, procedures]);

  useEffect(() => {
    async function fetchStepData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.start,
          endDate: dateRange.end,
        });

        if (selectedProcedure !== 'all') {
          params.append('procedureId', selectedProcedure);
        }

        const response = await fetch(`/api/dashboard/procedure-steps?${params}`);
        const data = await response.json();
        setStepData(data);
      } catch (error) {
        console.error('Error fetching step data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedProcedure) {
      fetchStepData();
    }
  }, [selectedProcedure, dateRange]);

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-yellow-500';
    if (rate >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-yellow-500';
    if (rate >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-l-4 border-[#1c2b40]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c2b40] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Procedure Step Analysis
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-500">Loading step analysis...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-l-4 border-[#1c2b40]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c2b40] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Procedure Step Analysis
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Step-by-step compliance and performance metrics
          </p>
        </div>

        {/* Procedure Selector - hide if fixedProcedureId is set */}
        {!fixedProcedureId && (
          <select
            value={selectedProcedure}
            onChange={(e) => setSelectedProcedure(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-[#1c2b40] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
          >
            <option value="all">All Procedures</option>
            {procedures.map((proc) => (
              <option key={proc.procedure_id} value={proc.procedure_id}>
                {proc.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {stepData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No step data available for the selected criteria
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">Good (&gt;90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-700">Fair (75-90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-700">Poor (60-75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700">Critical (&lt;60%)</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold text-gray-700">
                    Step
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">
                    Name
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">
                    Criticality
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700">
                    Adherence
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                    Quality
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 hidden xl:table-cell">
                    Avg Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stepData.map((step) => (
                  <tr
                    key={step.step_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Step Number */}
                    <td className="px-2 sm:px-4 py-3">
                      <div className="font-semibold text-[#1c2b40]">
                        #{step.step_number}
                      </div>
                      <div className="text-xs text-gray-500 md:hidden">
                        {step.step_name.substring(0, 20)}...
                      </div>
                    </td>

                    {/* Step Name (hidden on mobile) */}
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                      <div className="text-[#1c2b40] max-w-xs truncate">
                        {step.step_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.procedure_name}
                      </div>
                    </td>

                    {/* Criticality (hidden on mobile) */}
                    <td className="px-2 sm:px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCriticalityColor(step.criticality)}`}>
                        {step.criticality}
                      </span>
                    </td>

                    {/* Adherence Rate */}
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getAdherenceColor(step.completion_rate)}`}
                            style={{ width: `${step.completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {step.completion_rate}%
                        </span>
                      </div>
                    </td>

                    {/* Quality Rate (hidden on smaller screens) */}
                    <td className="px-2 sm:px-4 py-3 text-center hidden lg:table-cell">
                      <div className="font-medium text-[#1c2b40]">
                        {step.quality_rate}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.quality_issue_count} issues
                      </div>
                    </td>

                    {/* Average Duration (hidden on smaller screens) */}
                    <td className="px-2 sm:px-4 py-3 text-center hidden xl:table-cell">
                      <div className="font-medium text-[#1c2b40]">
                        {step.avg_duration_minutes} min
                      </div>
                      <div className={`text-xs ${step.duration_variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {step.duration_variance > 0 ? '+' : ''}{step.duration_variance} min
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">Total Steps</div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900">
                {stepData.length}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 font-medium">Avg Adherence</div>
              <div className="text-lg sm:text-2xl font-bold text-green-900">
                {stepData.length > 0
                  ? (stepData.reduce((sum, s) => sum + (Number(s.completion_rate) || 0), 0) / stepData.length).toFixed(1)
                  : '0.0'}%
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-medium">Critical Steps</div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900">
                {stepData.filter(s => s.criticality === 'Critical').length}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
