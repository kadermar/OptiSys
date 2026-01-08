'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface PredictiveData {
  procedure_id: string;
  name: string;
  category: string;
  total_work_orders: number;
  compliance_rate: number;
  incident_rate: number;
  avg_quality_score: number;
  avg_duration: number;
  rework_count: number;
  equipment_trip_count: number;
  risk_score: number;
  risk_category: string;
  recommendation: string;
}

interface PredictiveAnalyticsProps {
  dateRange: { start: string; end: string };
}

export function PredictiveAnalytics({ dateRange }: PredictiveAnalyticsProps) {
  const [predictiveData, setPredictiveData] = useState<PredictiveData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPredictiveData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.start,
          endDate: dateRange.end,
        });

        const response = await fetch(`/api/dashboard/predictive?${params}`);
        const data = await response.json();
        setPredictiveData(data);
      } catch (error) {
        console.error('Error fetching predictive data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPredictiveData();
  }, [dateRange]);

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'Critical': return { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-400', bar: '#ef4444' };
      case 'High': return { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-400', bar: '#f97316' };
      case 'Medium': return { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-400', bar: '#eab308' };
      case 'Low': return { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-400', bar: '#22c55e' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-900', border: 'border-gray-400', bar: '#6b7280' };
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'Critical': return '🔴';
      case 'High': return '🟠';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const riskDistribution = [
    { name: 'Critical', count: predictiveData.filter(d => d.risk_category === 'Critical').length },
    { name: 'High', count: predictiveData.filter(d => d.risk_category === 'High').length },
    { name: 'Medium', count: predictiveData.filter(d => d.risk_category === 'Medium').length },
    { name: 'Low', count: predictiveData.filter(d => d.risk_category === 'Low').length },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 border-l-4 border-[#1c2b40]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1c2b40] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff0000] rounded-full flex items-center justify-center text-white text-xl shadow-lg">
              📊
            </div>
            Predictive Analytics & Risk Scoring
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-600 font-medium">Loading predictive analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 border-l-4 border-[#1c2b40]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1c2b40] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff0000] rounded-full flex items-center justify-center text-white text-xl shadow-lg">
              📊
            </div>
            Predictive Analytics & Risk Scoring
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-13">
            AI-powered risk assessment and performance predictions
          </p>
        </div>
      </div>

      {predictiveData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No predictive data available for the selected date range
        </div>
      ) : (
        <>
          {/* Risk Distribution Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 shadow-inner border border-gray-200">
            <h3 className="text-lg font-bold text-[#1c2b40] mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
              Risk Distribution by Procedure
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={predictiveData.slice(0, 10)} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#1c2b40', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  tick={{ fill: '#1c2b40', fontWeight: 600 }}
                  label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#1c2b40', fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #ff0000',
                    borderRadius: '0.75rem',
                    color: '#1c2b40',
                    fontWeight: 600,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="risk_score" radius={[8, 8, 0, 0]}>
                  {predictiveData.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk_category).bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Procedures Table */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#1c2b40] mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
              Detailed Risk Analysis
            </h3>
            <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-lg">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-[#1c2b40] to-[#2d3e54]">
                  <tr>
                    <th className="px-4 py-4 text-left font-bold text-white">
                      Procedure
                    </th>
                    <th className="px-4 py-4 text-center font-bold text-white">
                      Risk Score
                    </th>
                    <th className="px-4 py-4 text-center font-bold text-white hidden sm:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-4 text-center font-bold text-white hidden md:table-cell">
                      Compliance
                    </th>
                    <th className="px-4 py-4 text-center font-bold text-white hidden lg:table-cell">
                      Incidents
                    </th>
                    <th className="px-4 py-4 text-left font-bold text-white hidden xl:table-cell">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {predictiveData.map((item) => {
                    const colors = getRiskColor(item.risk_category);
                    return (
                      <tr
                        key={item.procedure_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Procedure Name */}
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#1c2b40]">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {item.category}
                          </div>
                        </td>

                        {/* Risk Score */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-xl font-bold" style={{ color: colors.bar }}>
                              {item.risk_score}
                            </div>
                            <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${item.risk_score}%`,
                                  backgroundColor: colors.bar
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Risk Category (hidden on mobile) */}
                        <td className="px-4 py-4 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${colors.bg} ${colors.text} border-2 ${colors.border} shadow-sm`}>
                            {getRiskIcon(item.risk_category)} {item.risk_category}
                          </span>
                        </td>

                        {/* Compliance Rate */}
                        <td className="px-4 py-4 text-center hidden md:table-cell">
                          <div className="font-bold text-[#1c2b40] text-base">
                            {item.compliance_rate}%
                          </div>
                        </td>

                        {/* Incident Rate */}
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          <div className="font-bold text-[#1c2b40] text-base">
                            {item.incident_rate}%
                          </div>
                        </td>

                        {/* Recommendation */}
                        <td className="px-4 py-4 hidden xl:table-cell">
                          <div className="text-xs text-gray-700 max-w-xs font-medium">
                            {item.recommendation}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Methodology */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-[#1c2b40] shadow-lg">
            <h4 className="text-base font-bold text-[#1c2b40] mb-3 flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              Risk Score Methodology
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Risk scores are calculated using a weighted algorithm: <span className="text-[#ff0000] font-bold">40% compliance rate</span>, <span className="text-[#ff0000] font-bold">30% incident rate</span>,
              <span className="text-[#ff0000] font-bold"> 20% quality scores</span>, and <span className="text-[#ff0000] font-bold">10% rework frequency</span>. Scores range from 0-100, with higher scores indicating greater risk.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
