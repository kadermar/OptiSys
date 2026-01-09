'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/costConstants';

interface FacilityData {
  facility_id: string;
  name: string;
  performance_tier: string;
  compliance_rate: number;
  work_order_count: number;
  incident_count: number;
  rework_count: number;
  downtime_hours: number;
  profitImpact: number;
  potentialSavings: number;
  costBreakdown: {
    labor: number;
    material: number;
    safety: number;
    downtime: number;
    quality: number;
  };
  rank: number;
}

interface FacilityProfitAnalysisProps {
  data: {
    facilities: FacilityData[];
    summary: {
      totalFacilities: number;
      totalProfitImpact: number;
      totalPotentialSavings: number;
      avgComplianceRate: number;
    };
  } | null;
}

const TIER_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  Premium: { color: '#10B981', bgColor: 'bg-green-100', label: 'Premium' },
  Standard: { color: '#3B82F6', bgColor: 'bg-blue-100', label: 'Standard' },
  Basic: { color: '#F59E0B', bgColor: 'bg-amber-100', label: 'Basic' },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function FacilityProfitAnalysis({ data }: FacilityProfitAnalysisProps) {
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'profitImpact' | 'compliance_rate' | 'incident_count'>('profitImpact');

  if (!data) return null;

  const sortedFacilities = [...data.facilities].sort((a, b) => {
    if (sortBy === 'profitImpact') return b.profitImpact - a.profitImpact;
    if (sortBy === 'compliance_rate') return a.compliance_rate - b.compliance_rate;
    return b.incident_count - a.incident_count;
  });

  // Chart data (top 10)
  const chartData = sortedFacilities.slice(0, 10).map((f) => ({
    name: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
    fullName: f.name,
    value: f.profitImpact,
    compliance: f.compliance_rate,
    tier: f.performance_tier,
  }));

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1c2b40] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Facility Profit Impact
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Cost distribution across {data.summary.totalFacilities} facilities
          </p>
        </div>

        {/* Sort selector */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b40]"
        >
          <option value="profitImpact">Sort by Cost Impact</option>
          <option value="compliance_rate">Sort by Compliance (Low to High)</option>
          <option value="incident_count">Sort by Incidents</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-red-600 font-medium">Total Cost Impact</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(data.summary.totalProfitImpact)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium">Potential Savings</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(data.summary.totalPotentialSavings)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">Avg Compliance</p>
          <p className="text-xl font-bold text-blue-700">{data.summary.avgComplianceRate}%</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-purple-600 font-medium">Facilities</p>
          <p className="text-xl font-bold text-purple-700">{data.summary.totalFacilities}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Top Facilities by Cost Impact</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={11}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                fontSize={11}
                tick={{ fill: '#374151' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Cost Impact']}
                labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value > maxValue * 0.7 ? '#EF4444' : entry.value > maxValue * 0.4 ? '#F59E0B' : '#10B981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Facility List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600">All Facilities</h3>
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {sortedFacilities.map((facility) => {
            const isExpanded = expandedFacility === facility.facility_id;
            const tierConfig = TIER_CONFIG[facility.performance_tier] || TIER_CONFIG.Basic;

            return (
              <motion.div
                key={facility.facility_id}
                className={`rounded-xl border-2 transition-all cursor-pointer ${
                  isExpanded ? 'border-gray-300 shadow-md' : 'border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => setExpandedFacility(isExpanded ? null : facility.facility_id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">
                        #{facility.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#1c2b40]">{facility.name}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierConfig.bgColor}`}
                            style={{ color: tierConfig.color }}
                          >
                            {tierConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{facility.work_order_count} work orders</span>
                          <span>{facility.compliance_rate}% compliant</span>
                          <span>{facility.incident_count} incidents</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{formatCurrency(facility.profitImpact)}</p>
                        <p className="text-xs text-green-600">Save {formatCurrency(facility.potentialSavings)}</p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-600">Labor</p>
                            <p className="text-sm font-bold text-blue-700">{formatCurrency(facility.costBreakdown.labor)}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-purple-600">Material</p>
                            <p className="text-sm font-bold text-purple-700">{formatCurrency(facility.costBreakdown.material)}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-red-600">Safety</p>
                            <p className="text-sm font-bold text-red-700">{formatCurrency(facility.costBreakdown.safety)}</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3">
                            <p className="text-xs text-amber-600">Downtime</p>
                            <p className="text-sm font-bold text-amber-700">{formatCurrency(facility.costBreakdown.downtime)}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-green-600">Quality</p>
                            <p className="text-sm font-bold text-green-700">{formatCurrency(facility.costBreakdown.quality)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                          <span>{facility.rework_count} rework cases</span>
                          <span>{facility.downtime_hours.toFixed(1)} hrs downtime</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
