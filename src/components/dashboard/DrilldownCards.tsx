'use client';

import { useState } from 'react';

interface WorkOrder {
  wo_id: string;
  procedure_id: string;
  procedure_name: string;
  procedure_category: string;
  facility_name: string;
  worker_name: string;
  experience_level: string;
  scheduled_date: string;
  duration_hours: number;
  compliant: boolean;
  completion_percentage: number;
  safety_incident: boolean;
  rework_required: boolean;
  quality_score: number;
  downtime_hours: number;
}

interface DrilldownCardsProps {
  workOrders: WorkOrder[];
  selectedProcedureId?: string | null;
  onClearFilter?: () => void;
}

export function DrilldownCards({ workOrders, selectedProcedureId, onClearFilter }: DrilldownCardsProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'incidents' | 'rework'>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const CARDS_PER_PAGE = 3;

  const filteredWorkOrders = workOrders.filter(wo => {
    // First filter by selected procedure if applicable
    if (selectedProcedureId && wo.procedure_id !== selectedProcedureId) {
      return false;
    }
    // Then apply the filter type
    if (filterType === 'incidents') return wo.safety_incident;
    if (filterType === 'rework') return wo.rework_required;
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredWorkOrders.length / CARDS_PER_PAGE);
  const startIndex = currentPage * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const visibleWorkOrders = filteredWorkOrders.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  const handleFilterChange = (newFilter: 'all' | 'incidents' | 'rework') => {
    setFilterType(newFilter);
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Safety: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      Maintenance: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700',
      Operations: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
      Integrity: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
  };

  // Get the selected procedure name if applicable
  const selectedProcedure = selectedProcedureId
    ? workOrders.find(wo => wo.procedure_id === selectedProcedureId)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Work Order Drilldown</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {selectedProcedure ? (
              <>
                <span className="hidden sm:inline">Showing: </span>
                <strong className="dark:text-white">{selectedProcedure.procedure_name}</strong>
                {onClearFilter && (
                  <button
                    onClick={onClearFilter}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-sm"
                  >
                    Clear
                  </button>
                )}
              </>
            ) : (
              <span className="text-xs sm:text-base">Click any card to see full details and traceability</span>
            )}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({workOrders.length})
          </button>
          <button
            onClick={() => handleFilterChange('incidents')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filterType === 'incidents'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Incidents ({workOrders.filter(wo => wo.safety_incident).length})
          </button>
          <button
            onClick={() => handleFilterChange('rework')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filterType === 'rework'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Rework ({workOrders.filter(wo => wo.rework_required).length})
          </button>
        </div>
      </div>

      {/* Work Order Cards Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleWorkOrders.map((wo) => (
          <div
            key={wo.wo_id}
            onClick={() => setSelectedWorkOrder(wo)}
            className="bg-white dark:bg-gray-700 border-2 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-500"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{wo.wo_id}</span>
                <h3 className="font-semibold text-sm mt-1 dark:text-white">{wo.procedure_name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(wo.procedure_category)}`}>
                {wo.procedure_category}
              </span>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                wo.compliant
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {wo.compliant ? '✓ Compliant' : '✗ Non-Compliant'}
              </span>
              {wo.safety_incident && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                  ⚠️ Incident
                </span>
              )}
              {wo.rework_required && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  🔧 Rework
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Facility:</span>
                <span className="font-medium dark:text-white">{wo.facility_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Worker:</span>
                <span className="font-medium dark:text-white">{wo.worker_name} ({wo.experience_level})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium dark:text-white">{new Date(wo.scheduled_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                <span className="font-medium dark:text-white">{wo.quality_score}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium dark:text-white">{wo.duration_hours}h</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Completion</span>
                <span>{wo.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    wo.completion_percentage === 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                  style={{ width: `${wo.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {filteredWorkOrders.length > CARDS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentPage === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-[#ff0000] text-white hover:bg-[#ff0000]/90 shadow-lg'
            }`}
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages - 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-[#ff0000] text-white hover:bg-[#ff0000]/90 shadow-lg'
            }`}
          >
            Next →
          </button>
        </div>
      )}

      {filteredWorkOrders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No work orders match the selected filter</p>
        </div>
      )}

      {/* Modal for detailed view */}
      {selectedWorkOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWorkOrder(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold dark:text-white">{selectedWorkOrder.wo_id}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedWorkOrder.procedure_name}</p>
              </div>
              <button
                onClick={() => setSelectedWorkOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Full Details */}
            <div className="space-y-6">
              {/* Status Section */}
              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Status & Compliance</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Compliance Status:</span>
                    <span className={`font-semibold ${
                      selectedWorkOrder.compliant ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {selectedWorkOrder.compliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Completion:</span>
                    <span className="font-semibold dark:text-white">{selectedWorkOrder.completion_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quality Score:</span>
                    <span className="font-semibold dark:text-white">{selectedWorkOrder.quality_score}/10</span>
                  </div>
                </div>
              </div>

              {/* Execution Details */}
              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Execution Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Facility:</span>
                    <span className="font-semibold dark:text-white">{selectedWorkOrder.facility_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Worker:</span>
                    <span className="font-semibold dark:text-white">
                      {selectedWorkOrder.worker_name} ({selectedWorkOrder.experience_level})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Scheduled Date:</span>
                    <span className="font-semibold dark:text-white">
                      {new Date(selectedWorkOrder.scheduled_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-semibold dark:text-white">{selectedWorkOrder.duration_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Downtime:</span>
                    <span className="font-semibold dark:text-white">{selectedWorkOrder.downtime_hours} hours</span>
                  </div>
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Outcomes & Issues</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Safety Incident:</span>
                    <span className={`font-semibold ${
                      selectedWorkOrder.safety_incident ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {selectedWorkOrder.safety_incident ? '⚠️ Yes' : '✓ No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Rework Required:</span>
                    <span className={`font-semibold ${
                      selectedWorkOrder.rework_required ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {selectedWorkOrder.rework_required ? '🔧 Yes' : '✓ No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Traceability Info */}
              <div className="border-t dark:border-gray-600 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="dark:text-white">Full Traceability:</strong> This work order can be traced from the executive insight
                  card → correlation analysis → individual work order → compliance checkpoints → specific
                  procedure steps that were missed or executed incorrectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
