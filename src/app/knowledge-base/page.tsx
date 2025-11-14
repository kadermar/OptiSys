'use client';

import { useEffect, useState } from 'react';

export default function KnowledgeBasePage() {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'procedures' | 'work-orders' | 'facilities' | 'workers'>('procedures');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [procedureCategory, setProcedureCategory] = useState<string>('all');
  const [woComplianceFilter, setWoComplianceFilter] = useState<string>('all');
  const [woIncidentFilter, setWoIncidentFilter] = useState<string>('all');
  const [woProcedureFilter, setWoProcedureFilter] = useState<string>('all');
  const [facilityTierFilter, setFacilityTierFilter] = useState<string>('all');
  const [workerExperienceFilter, setWorkerExperienceFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [proceduresRes, workOrdersRes, facilitiesRes, workersRes] = await Promise.all([
          fetch('/api/dashboard/procedures'),
          fetch('/api/dashboard/work-orders'),
          fetch('/api/dashboard/facilities'),
          fetch('/api/dashboard/workers'),
        ]);

        if (!proceduresRes.ok || !workOrdersRes.ok || !facilitiesRes.ok || !workersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        setProcedures(await proceduresRes.json());
        setWorkOrders(await workOrdersRes.json());
        setFacilities(await facilitiesRes.json());
        setWorkers(await workersRes.json());
      } catch (error) {
        console.error('Error fetching knowledge base data:', error);
        setError('Failed to load knowledge base data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0000]"></div>
          <p className="mt-4 text-[#1c2b40]">Loading knowledge base...</p>
        </div>
      </div>
    );
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

  const totalIncidents = workOrders.filter(wo => wo.safety_incident).length;
  const totalCompliant = workOrders.filter(wo => wo.compliant).length;
  const totalRework = workOrders.filter(wo => wo.rework_required).length;

  // Get unique values for filters
  const platforms = Array.from(new Set(workers.map(w => w.platform).filter(Boolean)));
  const categories = Array.from(new Set(procedures.map(p => p.category).filter(Boolean)));
  const experienceLevels = Array.from(new Set(workers.map(w => w.experience_level).filter(Boolean)));
  const performanceTiers = Array.from(new Set(facilities.map(f => f.performance_tier).filter(Boolean)));

  // Filter procedures
  const filteredProcedures = procedures.filter(p => {
    if (procedureCategory !== 'all' && p.category !== procedureCategory) return false;
    return true;
  });

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(wo => {
    if (woComplianceFilter === 'compliant' && !wo.compliant) return false;
    if (woComplianceFilter === 'non-compliant' && wo.compliant) return false;
    if (woIncidentFilter === 'with-incident' && !wo.safety_incident) return false;
    if (woIncidentFilter === 'no-incident' && wo.safety_incident) return false;
    if (woProcedureFilter !== 'all' && wo.procedure_id !== woProcedureFilter) return false;
    return true;
  });

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    if (facilityTierFilter !== 'all' && f.performance_tier !== facilityTierFilter) return false;
    return true;
  });

  // Filter workers
  const filteredWorkers = workers.filter(w => {
    if (selectedPlatform !== 'all' && w.platform !== selectedPlatform) return false;
    if (workerExperienceFilter !== 'all' && w.experience_level !== workerExperienceFilter) return false;
    return true;
  });

  const handleRowClick = async (item: any, type: string) => {
    if (type === 'procedure') {
      // Fetch full procedure details including steps
      try {
        const response = await fetch(`/api/procedures/${item.procedure_id}`);
        if (response.ok) {
          const fullProcedure = await response.json();
          setSelectedItem({ ...fullProcedure, type });
        } else {
          setSelectedItem({ ...item, type });
        }
      } catch (error) {
        console.error('Error fetching procedure details:', error);
        setSelectedItem({ ...item, type });
      }
    } else {
      setSelectedItem({ ...item, type });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Knowledge Base</h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete data repository for the OptiSys POC
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Procedures</div>
              <div className="text-2xl font-bold text-[#1c2b40]">{procedures.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Work Orders</div>
              <div className="text-2xl font-bold text-[#1c2b40]">{workOrders.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Facilities</div>
              <div className="text-2xl font-bold text-[#1c2b40]">{facilities.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-[#ff0000] font-medium">Workers</div>
              <div className="text-2xl font-bold text-[#1c2b40]">{workers.length}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('procedures')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'procedures'
                    ? 'border-[#ff0000] text-[#ff0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Procedures ({procedures.length})
              </button>
              <button
                onClick={() => setActiveTab('work-orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'work-orders'
                    ? 'border-[#ff0000] text-[#ff0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Work Orders ({workOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('facilities')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'facilities'
                    ? 'border-[#ff0000] text-[#ff0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Facilities ({facilities.length})
              </button>
              <button
                onClick={() => setActiveTab('workers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'workers'
                    ? 'border-[#ff0000] text-[#ff0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Workers ({workers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Procedures Tab */}
            {activeTab === 'procedures' && (
              <div>
                {/* Procedure Filters */}
                <div className="mb-4 flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
                  <select
                    value={procedureCategory}
                    onChange={(e) => setProcedureCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Categories ({procedures.length})</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({procedures.filter(p => p.category === cat).length})
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">
                    Showing {filteredProcedures.length} procedure{filteredProcedures.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Work Orders</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Compliance</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Incidents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProcedures.map((proc) => (
                      <tr
                        key={proc.procedure_id}
                        onClick={() => handleRowClick(proc, 'procedure')}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{proc.procedure_id}</td>
                        <td className="px-4 py-3 font-medium">{proc.name}</td>
                        <td className="px-4 py-3 text-gray-600">{proc.category}</td>
                        <td className="px-4 py-3 text-center">{proc.total_work_orders}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            parseFloat(proc.compliance_rate) >= 80 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {proc.compliance_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{proc.incident_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* Work Orders Tab */}
            {activeTab === 'work-orders' && (
              <div>
                {/* Work Order Filters */}
                <div className="mb-4 flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Filters:</label>
                  <select
                    value={woComplianceFilter}
                    onChange={(e) => setWoComplianceFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Compliance</option>
                    <option value="compliant">Compliant Only</option>
                    <option value="non-compliant">Non-Compliant Only</option>
                  </select>
                  <select
                    value={woIncidentFilter}
                    onChange={(e) => setWoIncidentFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Incidents</option>
                    <option value="with-incident">With Incident</option>
                    <option value="no-incident">No Incident</option>
                  </select>
                  <select
                    value={woProcedureFilter}
                    onChange={(e) => setWoProcedureFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Procedures</option>
                    {procedures.map((proc) => (
                      <option key={proc.procedure_id} value={proc.procedure_id}>
                        {proc.procedure_id}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">
                    Showing {filteredWorkOrders.length} work order{filteredWorkOrders.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-medium">Compliant</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{totalCompliant}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {((totalCompliant / workOrders.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-600 font-medium">Incidents</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{totalIncidents}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {((totalIncidents / workOrders.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Rework Required</div>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{totalRework}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {((totalRework / workOrders.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">WO ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Procedure</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Worker</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Compliant</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Incident</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredWorkOrders.slice(0, 100).map((wo) => (
                        <tr
                          key={wo.wo_id}
                          onClick={() => handleRowClick(wo, 'work-order')}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{wo.wo_id}</td>
                          <td className="px-4 py-3 text-xs">{wo.procedure_id}</td>
                          <td className="px-4 py-3 text-xs">{wo.worker_id}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {new Date(wo.scheduled_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              wo.compliant ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {wo.safety_incident && <span className="text-red-600">⚠️</span>}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {wo.quality_score ? Number(wo.quality_score).toFixed(1) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredWorkOrders.length > 100 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Showing first 100 of {filteredWorkOrders.length} work orders
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
              <div>
                {/* Facility Filters */}
                <div className="mb-4 flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Filter by Tier:</label>
                  <select
                    value={facilityTierFilter}
                    onChange={(e) => setFacilityTierFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Tiers ({facilities.length})</option>
                    {performanceTiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier} ({facilities.filter(f => f.performance_tier === tier).length})
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">
                    Showing {filteredFacilities.length} facilit{filteredFacilities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Work Orders</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Compliance</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Incidents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFacilities.map((facility) => (
                      <tr
                        key={facility.facility_id}
                        onClick={() => handleRowClick(facility, 'facility')}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{facility.facility_id}</td>
                        <td className="px-4 py-3 font-medium">{facility.name}</td>
                        <td className="px-4 py-3 text-center">{facility.work_order_count}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            parseFloat(facility.compliance_rate) >= 80 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {facility.compliance_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{facility.total_incidents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* Workers Tab */}
            {activeTab === 'workers' && (
              <div>
                {/* Worker Filters */}
                <div className="mb-4 flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Filters:</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Platforms</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform} ({workers.filter(w => w.platform === platform).length})
                      </option>
                    ))}
                  </select>
                  <select
                    value={workerExperienceFilter}
                    onChange={(e) => setWorkerExperienceFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
                  >
                    <option value="all">All Experience Levels</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level} ({workers.filter(w => w.experience_level === level).length})
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">
                    Showing {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Platform</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Work Orders</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Compliance</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Quality</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Incidents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkers.map((worker) => (
                      <tr
                        key={worker.worker_id}
                        onClick={() => handleRowClick(worker, 'worker')}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{worker.worker_id}</td>
                        <td className="px-4 py-3 font-medium">{worker.worker_name}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{worker.platform || 'N/A'}</td>
                        <td className="px-4 py-3 text-center">{worker.work_order_count}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            parseFloat(worker.compliance_rate) >= 80 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {worker.compliance_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {worker.avg_quality_score ? Number(worker.avg_quality_score).toFixed(1) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={worker.incident_count > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {worker.incident_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50" onClick={closeModal}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            {/* Modal panel */}
            <div
              className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#ff0000] px-6 py-4 border-b border-[#ff0000]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {selectedItem.type === 'procedure' && 'Procedure Details'}
                    {selectedItem.type === 'work-order' && 'Work Order Details'}
                    {selectedItem.type === 'facility' && 'Facility Details'}
                    {selectedItem.type === 'worker' && 'Worker Details'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto bg-gray-50">
                {selectedItem.type === 'procedure' && (
                  <div className="space-y-6">
                    {/* Document Header */}
                    <div className="border-b border-gray-300 pb-4 bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.name}</h2>
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedItem.procedure_id}</span>
                            <span>•</span>
                            <span className="font-medium">{selectedItem.category}</span>
                            {selectedItem.regulatory_requirement && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                  ⚠️ Regulatory Required
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {selectedItem.version && (
                          <div className="text-right bg-blue-50 px-3 py-2 rounded border border-blue-200">
                            <div className="text-xs text-gray-600 font-medium">Version</div>
                            <div className="text-lg font-bold text-blue-600">{selectedItem.version}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Target Metric</div>
                        <div className="text-lg font-bold text-blue-600">{selectedItem.target_metric || 'N/A'}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Total Steps</div>
                        <div className="text-lg font-bold text-green-600">{selectedItem.total_steps || 0}</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Avg Duration</div>
                        <div className="text-lg font-bold text-purple-600">{selectedItem.avg_duration_minutes || 0} min</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Last Updated</div>
                        <div className="text-sm font-bold text-orange-600">
                          {selectedItem.last_updated ? new Date(selectedItem.last_updated).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedItem.description && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                          <span className="mr-2">📋</span> Description
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
                      </div>
                    )}

                    {/* Procedure Steps */}
                    {selectedItem.steps && selectedItem.steps.length > 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">📝</span> Procedure Steps ({selectedItem.steps.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedItem.steps.map((step: any) => (
                            <div
                              key={step.step_id}
                              className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-red-200 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#ff0000] text-white text-base font-bold shadow">
                                    {step.step_number}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2 gap-3">
                                    <h4 className="text-base font-bold text-gray-900">{step.step_name}</h4>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {step.verification_required && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                          ✓ Verify
                                        </span>
                                      )}
                                      {step.criticality && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${
                                          step.criticality === 'Critical'
                                            ? 'bg-red-100 text-red-800 border-red-300'
                                            : step.criticality === 'High'
                                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                                            : step.criticality === 'Medium'
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            : 'bg-green-100 text-green-800 border-green-300'
                                        }`}>
                                          {step.criticality}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {step.description && (
                                    <p className="text-sm text-gray-700 mt-2 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">{step.description}</p>
                                  )}
                                  {step.typical_duration_minutes && (
                                    <div className="mt-3 flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full inline-flex border border-blue-200">
                                      <span className="mr-1">⏱️</span>
                                      <span className="font-semibold">{step.typical_duration_minutes} minutes</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {(selectedItem.total_work_orders || selectedItem.compliance_rate || selectedItem.incident_count) && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">📊</span> Performance Metrics
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {selectedItem.total_work_orders && (
                            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
                              <div className="text-3xl font-bold text-blue-600">{selectedItem.total_work_orders}</div>
                              <div className="text-sm text-gray-700 mt-2 font-medium">Work Orders</div>
                            </div>
                          )}
                          {selectedItem.compliance_rate && (
                            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors">
                              <div className={`text-3xl font-bold ${parseFloat(selectedItem.compliance_rate) >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedItem.compliance_rate}%
                              </div>
                              <div className="text-sm text-gray-700 mt-2 font-medium">Compliance Rate</div>
                            </div>
                          )}
                          {selectedItem.incident_count !== undefined && (
                            <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-400 transition-colors">
                              <div className="text-3xl font-bold text-red-600">{selectedItem.incident_count}</div>
                              <div className="text-sm text-gray-700 mt-2 font-medium">Incidents</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedItem.type === 'work-order' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Work Order ID</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedItem.wo_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedItem.scheduled_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Procedure</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedItem.procedure_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Worker</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedItem.worker_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Compliant</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedItem.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedItem.compliant ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Safety Incident</label>
                        <p className="mt-1">
                          {selectedItem.safety_incident ? <span className="text-red-600 text-xl">⚠️</span> : <span className="text-green-600">✓</span>}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Quality Score</label>
                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {selectedItem.quality_score ? Number(selectedItem.quality_score).toFixed(1) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'facility' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Facility ID</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedItem.facility_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="mt-1 text-base font-semibold text-gray-900">{selectedItem.name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Work Orders</label>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{selectedItem.work_order_count}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Compliance Rate</label>
                        <p className={`mt-1 text-2xl font-bold ${parseFloat(selectedItem.compliance_rate) >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedItem.compliance_rate}%
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Incidents</label>
                        <p className="mt-1 text-2xl font-bold text-red-600">{selectedItem.total_incidents}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'worker' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Worker ID</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedItem.worker_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Platform</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.platform || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="mt-1 text-base font-semibold text-gray-900">{selectedItem.worker_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Experience Level</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                            selectedItem.experience_level === 'Expert'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedItem.experience_level === 'Senior'
                              ? 'bg-green-100 text-green-800'
                              : selectedItem.experience_level === 'Mid'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedItem.experience_level}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Work Orders</label>
                        <p className="mt-1 text-xl font-bold text-gray-900">{selectedItem.work_order_count}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Compliance Rate</label>
                        <p className={`mt-1 text-2xl font-bold ${parseFloat(selectedItem.compliance_rate) >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedItem.compliance_rate}%
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Quality Score</label>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                          {selectedItem.avg_quality_score ? Number(selectedItem.avg_quality_score).toFixed(1) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Incidents</label>
                        <p className={`mt-1 text-2xl font-bold ${selectedItem.incident_count > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {selectedItem.incident_count}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-4 py-2 bg-[#ff0000] hover:bg-[#ff0000]/90 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
