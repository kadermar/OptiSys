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
  const [view, setView] = useState<'table' | 'chart'>('table');

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
      case 'Critical': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', border: 'border-red-300 dark:border-red-700', bar: '#ef4444' };
      case 'High': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-300 dark:border-orange-700', bar: '#f97316' };
      case 'Medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-300 dark:border-yellow-700', bar: '#eab308' };
      case 'Low': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', border: 'border-green-300 dark:border-green-700', bar: '#22c55e' };
      default: return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-300 dark:border-gray-600', bar: '#6b7280' };
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
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Predictive Analytics & Risk Scoring
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading predictive analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Predictive Analytics & Risk Scoring
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered risk assessment and performance predictions
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView('chart')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'chart'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {predictiveData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No predictive data available for the selected date range
        </div>
      ) : (
        <>
          {/* Risk Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {riskDistribution.map((risk) => {
              const colors = getRiskColor(risk.name);
              return (
                <div
                  key={risk.name}
                  className={`p-3 sm:p-4 rounded-lg border ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      {risk.name} Risk
                    </span>
                    <span className="text-lg">{getRiskIcon(risk.name)}</span>
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold ${colors.text}`}>
                    {risk.count}
                  </div>
                </div>
              );
            })}
          </div>

          {view === 'chart' ? (
            /* Chart View */
            <div className="space-y-6">
              {/* Risk Distribution Chart */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Risk Distribution by Procedure
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={predictiveData.slice(0, 10)} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: '#9CA3AF' }} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#F3F4F6'
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
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Procedure
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                      Risk Score
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">
                      Compliance
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                      Incidents
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 hidden xl:table-cell">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {predictiveData.map((item) => {
                    const colors = getRiskColor(item.risk_category);
                    return (
                      <tr
                        key={item.procedure_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        {/* Procedure Name */}
                        <td className="px-2 sm:px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.category}
                          </div>
                        </td>

                        {/* Risk Score */}
                        <td className="px-2 sm:px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-lg font-bold" style={{ color: colors.bar }}>
                              {item.risk_score}
                            </div>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${item.risk_score}%`,
                                  backgroundColor: colors.bar
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Risk Category (hidden on mobile) */}
                        <td className="px-2 sm:px-4 py-3 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {getRiskIcon(item.risk_category)} {item.risk_category}
                          </span>
                        </td>

                        {/* Compliance Rate */}
                        <td className="px-2 sm:px-4 py-3 text-center hidden md:table-cell">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.compliance_rate}%
                          </div>
                        </td>

                        {/* Incident Rate */}
                        <td className="px-2 sm:px-4 py-3 text-center hidden lg:table-cell">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.incident_rate}%
                          </div>
                        </td>

                        {/* Recommendation */}
                        <td className="px-2 sm:px-4 py-3 hidden xl:table-cell">
                          <div className="text-xs text-gray-600 dark:text-gray-400 max-w-xs">
                            {item.recommendation}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Risk Methodology */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Risk Score Methodology
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Risk scores are calculated using a weighted algorithm: 40% compliance rate, 30% incident rate,
              20% quality scores, and 10% rework frequency. Scores range from 0-100, with higher scores indicating greater risk.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
