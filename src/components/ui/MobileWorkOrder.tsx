'use client';

import { useState, useEffect } from 'react';
import { Camera, ChevronDown, Check, AlertCircle, Upload, X, CheckCircle, FileText } from 'lucide-react';

export function MobileWorkOrder() {
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [procedureSteps, setProcedureSteps] = useState<any[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [hasIncident, setHasIncident] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [procedureDetails, setProcedureDetails] = useState<any>(null);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proceduresRes, facilitiesRes, workersRes] = await Promise.all([
          fetch('/api/dashboard/procedures'),
          fetch('/api/dashboard/facilities'),
          fetch('/api/dashboard/workers'),
        ]);

        if (proceduresRes.ok) {
          const proceduresData = await proceduresRes.json();
          setProcedures(proceduresData);
        }

        if (facilitiesRes.ok) {
          const facilitiesData = await facilitiesRes.json();
          setFacilities(facilitiesData);
        }

        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData);

          // Randomly assign a worker and their facility
          if (workersData.length > 0) {
            const randomIndex = Math.floor(Math.random() * workersData.length);
            const selectedWorkerData = workersData[randomIndex];
            setSelectedWorker(selectedWorkerData.worker_id);
            setSelectedFacility(selectedWorkerData.facility_id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fetch procedure steps when a procedure is selected
  useEffect(() => {
    async function fetchProcedureSteps() {
      if (!selectedProcedure) {
        setProcedureSteps([]);
        setCompletedSteps(new Set());
        return;
      }

      try {
        const response = await fetch(`/api/dashboard/procedure-steps?procedureId=${selectedProcedure}`);
        if (response.ok) {
          const steps = await response.json();
          setProcedureSteps(steps);
          setCompletedSteps(new Set());
        }
      } catch (error) {
        console.error('Error fetching procedure steps:', error);
      }
    }

    fetchProcedureSteps();
  }, [selectedProcedure]);

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewProcedure = async () => {
    if (!selectedProcedure) return;

    try {
      const response = await fetch(`/api/procedures/${selectedProcedure}`);
      if (response.ok) {
        const data = await response.json();
        setProcedureDetails(data);
        setShowProcedureModal(true);
      }
    } catch (error) {
      console.error('Error fetching procedure details:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate compliance: all steps must be completed
      const totalSteps = procedureSteps.length;
      const completedCount = completedSteps.size;
      const isCompliant = totalSteps > 0 && completedCount === totalSteps;

      // Calculate quality score (0-10 scale) based on completion percentage
      const completionPercentage = totalSteps > 0 ? completedCount / totalSteps : 0;
      const qualityScore = completionPercentage * 10;

      // Fetch procedure details to get average duration
      let durationHours = 0;
      try {
        const procedureResponse = await fetch(`/api/procedures/${selectedProcedure}`);
        if (procedureResponse.ok) {
          const procedureData = await procedureResponse.json();
          const avgDurationMinutes = procedureData.avg_duration_minutes || 0;

          // Generate random duration: avg ± 50 minutes
          const variance = (Math.random() * 100) - 50; // Random between -50 and +50
          const actualDurationMinutes = Math.max(1, avgDurationMinutes + variance);
          durationHours = actualDurationMinutes / 60;
        }
      } catch (error) {
        console.error('Error fetching procedure duration:', error);
      }

      const response = await fetch('/api/dashboard/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedure_id: selectedProcedure,
          facility_id: selectedFacility,
          worker_id: selectedWorker,
          completedSteps: Array.from(completedSteps),
          totalSteps: totalSteps,
          hasIncident: hasIncident,
          isCompliant: isCompliant,
          qualityScore: qualityScore,
          durationHours: durationHours,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToast({
          message: `Work Order #${data.wo_id} submitted successfully! Quality Score: ${qualityScore.toFixed(1)}/10.0 | ${isCompliant ? 'Compliant' : 'Non-Compliant'}`,
          type: 'success'
        });

        // Reset form
        setSelectedProcedure('');
        setSelectedFacility('');
        setProcedureSteps([]);
        setCompletedSteps(new Set());
        setUploadedFiles([]);
        setHasIncident(false);
      } else {
        const error = await response.json();
        setToast({
          message: `Failed to submit work order: ${error.error}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting work order:', error);
      setToast({
        message: 'Failed to submit work order. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[90%] w-full animate-in slide-in-from-top duration-300 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3`}>
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#ff0000] text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">OptiSys Mobile</h1>
            <p className="text-sm text-white/80 mt-1">Create Work Order</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg font-bold">OS</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
        {/* Worker Assignment */}
        <div>
          <label className="block text-sm font-semibold text-[#1c2b40] mb-2">
            Assigned Worker *
          </label>
          <div className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-[#1c2b40] font-medium">
            {loading ? 'Loading...' : workers.find(w => w.worker_id === selectedWorker)?.worker_name || 'Assigning worker...'}
          </div>
        </div>

        {/* Facility Assignment */}
        <div>
          <label className="block text-sm font-semibold text-[#1c2b40] mb-2">
            Assigned Facility *
          </label>
          <div className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-[#1c2b40] font-medium">
            {loading ? 'Loading...' : facilities.find(f => f.facility_id === selectedFacility)?.name || 'Assigning facility...'}
          </div>
        </div>

        {/* Procedure Selection */}
        <div>
          <label className="block text-sm font-semibold text-[#1c2b40] mb-2">
            Select Procedure *
          </label>
          <div className="relative">
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg appearance-none focus:border-[#ff0000] focus:outline-none text-[#1c2b40] font-medium"
              disabled={loading}
            >
              <option value="">{loading ? 'Loading...' : 'Choose a procedure...'}</option>
              {procedures.map((proc) => (
                <option key={proc.procedure_id} value={proc.procedure_id}>
                  {proc.procedure_id} - {proc.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Procedure Steps Checklist - Always visible */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#1c2b40]">
              Procedure Steps
            </label>
            {selectedProcedure && (
              <button
                onClick={handleViewProcedure}
                className="text-xs font-semibold text-[#ff0000] hover:text-[#cc0000] transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                View More →
              </button>
            )}
          </div>
          {!selectedProcedure ? (
            <div className="w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 rounded-lg text-center text-gray-500">
              Please select a procedure to view steps
            </div>
          ) : procedureSteps.length === 0 ? (
            <div className="w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 rounded-lg text-center text-gray-500">
              No steps available for this procedure
            </div>
          ) : (
            <>
              <div className="bg-white border-2 border-gray-300 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {procedureSteps.map((step) => (
                  <label
                    key={step.step_id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={completedSteps.has(step.step_id)}
                      onChange={() => toggleStep(step.step_id)}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-[#ff0000] focus:ring-[#ff0000] focus:ring-2 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1c2b40]">
                          Step {step.step_number}
                        </span>
                        {step.criticality === 'critical' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            Critical
                          </span>
                        )}
                        {step.verification_required && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            Important
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${completedSteps.has(step.step_id) ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {step.step_name}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {completedSteps.size} of {procedureSteps.length} steps completed
              </div>
            </>
          )}
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-semibold text-[#1c2b40] mb-2">
            Media
          </label>
          <label className="w-full px-4 py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 hover:border-[#ff0000] hover:bg-red-50 transition-all cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Upload Media</span>
            <span className="text-xs text-gray-500">Images, videos, documents, etc.</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Upload className="w-4 h-4 text-[#ff0000] flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              <div className="text-xs text-gray-600 text-center">
                {uploadedFiles.length} file(s) uploaded
              </div>
            </div>
          )}
        </div>

        {/* Incident Field */}
        <div>
          <label className="block text-sm font-semibold text-[#1c2b40] mb-2">
            Safety/Quality Incident? *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setHasIncident(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                !hasIncident
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-green-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span>No</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setHasIncident(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                hasIncident
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-red-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Yes</span>
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Report any safety incidents or quality issues encountered during this work order
          </p>
        </div>

        {/* Comments/Notes */}
        <div>
          <label className="block text-sm font-semibold text-[#1c2b40] mb-2">
            Comments
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes or observations..."
            rows={4}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-[#ff0000] focus:outline-none text-[#1c2b40] resize-none"
          />
          <p className="text-xs text-gray-600 mt-2">
            Optional notes about the work performed, observations, or recommendations
          </p>
        </div>

        {/* Compliance & Quality Summary */}
        {selectedProcedure && procedureSteps.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1c2b40]">Work Order Summary</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Compliance Status:</span>
                <span className={`text-sm font-bold ${
                  completedSteps.size === procedureSteps.length
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {completedSteps.size === procedureSteps.length ? 'Compliant' : 'Non-Compliant'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Quality Score:</span>
                <span className="text-sm font-bold text-blue-600">
                  {((completedSteps.size / procedureSteps.length) * 10).toFixed(1)}/10.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Steps Completed:</span>
                <span className="text-sm font-bold text-gray-700">
                  {completedSteps.size}/{procedureSteps.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Validation Alert */}
        {(!selectedProcedure || !selectedFacility || !selectedWorker) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Required Fields</p>
              <p className="text-xs text-yellow-700 mt-1">
                Please fill in all required fields before submitting
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-white border-t-2 border-gray-200 px-6 py-6 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!selectedProcedure || !selectedFacility || !selectedWorker}
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
            selectedProcedure && selectedFacility && selectedWorker
              ? 'bg-[#ff0000] text-white shadow-lg hover:bg-[#ff0000]/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Check className="w-6 h-6" />
          <span>Submit Work Order</span>
        </button>
        <button className="w-full py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all">
          Save as Draft
        </button>
        </div>
        </div>
      </div>

      {/* Procedure Details Modal */}
      {showProcedureModal && procedureDetails && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-[calc(100%-6rem)] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#ff0000] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <div>
                  <h2 className="text-lg font-bold">{procedureDetails.name}</h2>
                  <p className="text-xs text-white/80">{procedureDetails.procedure_id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProcedureModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Procedure Info */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-0.5">Category</div>
                    <div className="text-xs font-semibold text-[#1c2b40]">{procedureDetails.category}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-0.5">Safety Critical</div>
                    <div className="text-xs font-semibold text-[#1c2b40]">
                      {procedureDetails.safety_critical ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                {procedureDetails.description && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                    <div className="text-xs text-blue-700 font-semibold mb-0.5">Description</div>
                    <p className="text-xs text-blue-900">{procedureDetails.description}</p>
                  </div>
                )}
              </div>

              {/* Procedure Steps */}
              {procedureDetails.steps && procedureDetails.steps.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#1c2b40] mb-3">
                    Procedure Steps ({procedureDetails.steps.length})
                  </h3>
                  <div className="space-y-2">
                    {procedureDetails.steps.map((step: any) => (
                      <div
                        key={step.step_id}
                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-7 h-7 bg-[#ff0000] text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {step.step_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#1c2b40] leading-relaxed mb-1.5">
                              {step.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {step.criticality && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                    step.criticality === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : step.criticality === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {step.criticality}
                                </span>
                              )}
                              {step.expected_duration_minutes && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  ~{step.expected_duration_minutes}m
                                </span>
                              )}
                            </div>
                            {step.safety_requirements && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-0.5 font-semibold">
                                  Safety Requirements
                                </div>
                                <div className="text-xs text-gray-700 bg-yellow-50 p-1.5 rounded">
                                  {step.safety_requirements}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-4 py-3">
              <button
                onClick={() => setShowProcedureModal(false)}
                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-[#1c2b40] font-semibold rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
