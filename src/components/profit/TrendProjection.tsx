'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/costConstants';

interface HistoricalData {
  month: string;
  totalCost: number;
  complianceRate: number;
  incidentCount: number;
  isProjection: boolean;
}

interface ProjectedData {
  month: string;
  totalCost: number;
  complianceRate: number;
  confidenceMin: number;
  confidenceMax: number;
  isProjection: boolean;
}

interface TrendProjectionProps {
  data: {
    historical: HistoricalData[];
    projected: ProjectedData[];
    analysis: {
      costTrend: string;
      complianceTrend: string;
      totalHistoricalCost: number;
      totalProjectedCost: number;
      avgMonthlyCost: number;
      projectedSavingsAt95Compliance: number;
    };
  } | null;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  const isProjection = data?.isProjection;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-800 mb-2">
        {label} {isProjection && <span className="text-xs text-purple-600">(Projected)</span>}
      </p>
      <div className="space-y-1 text-sm">
        <p className="text-red-600">
          Cost: <span className="font-medium">{formatCurrency(data?.totalCost || 0)}</span>
        </p>
        <p className="text-blue-600">
          Compliance: <span className="font-medium">{data?.complianceRate?.toFixed(1)}%</span>
        </p>
        {isProjection && data?.confidenceMin !== undefined && (
          <p className="text-gray-500 text-xs">
            Range: {formatCurrency(data.confidenceMin)} - {formatCurrency(data.confidenceMax)}
          </p>
        )}
      </div>
    </div>
  );
};

export function TrendProjection({ data }: TrendProjectionProps) {
  const [viewMode, setViewMode] = useState<'cost' | 'compliance'>('cost');
  const [projectionMonths] = useState(6);

  if (!data) return null;

  // Combine historical and projected data
  const chartData = [
    ...data.historical.map(h => ({
      ...h,
      projectedCost: null,
      confidenceMin: null,
      confidenceMax: null,
    })),
    ...data.projected.map(p => ({
      month: p.month,
      totalCost: null,
      projectedCost: p.totalCost,
      complianceRate: p.complianceRate,
      confidenceMin: p.confidenceMin,
      confidenceMax: p.confidenceMax,
      isProjection: true,
    })),
  ];

  // Get the last historical point to connect with projection
  const lastHistorical = data.historical[data.historical.length - 1];
  if (lastHistorical && data.projected.length > 0) {
    chartData[data.historical.length - 1] = {
      ...chartData[data.historical.length - 1],
      projectedCost: lastHistorical.totalCost,
    };
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'decreasing' || trend === 'improving') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    if (trend === 'increasing' || trend === 'declining') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1c2b40] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Trend Analysis & Projections
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Historical data with {projectionMonths}-month forward projection
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cost')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'cost'
                ? 'bg-white text-[#1c2b40] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Cost View
          </button>
          <button
            onClick={() => setViewMode('compliance')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'compliance'
                ? 'bg-white text-[#1c2b40] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Compliance View
          </button>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-medium">Cost Trend</span>
            {getTrendIcon(data.analysis.costTrend)}
          </div>
          <p className="text-sm font-semibold text-gray-800 capitalize">{data.analysis.costTrend}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-medium">Compliance Trend</span>
            {getTrendIcon(data.analysis.complianceTrend)}
          </div>
          <p className="text-sm font-semibold text-gray-800 capitalize">{data.analysis.complianceTrend}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Avg Monthly Cost</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(data.analysis.avgMonthlyCost)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-green-600 font-medium mb-1">Projected Savings</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(data.analysis.projectedSavingsAt95Compliance)}
          </p>
          <p className="text-xs text-green-600">at 95% compliance</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const date = new Date(value + '-01');
                return date.toLocaleDateString('en-US', { month: 'short' });
              }}
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
            />
            <YAxis
              tickFormatter={(value) => viewMode === 'cost' ? formatCurrency(value) : `${value}%`}
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
              domain={viewMode === 'compliance' ? [0, 100] : ['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />

            {viewMode === 'cost' ? (
              <>
                {/* Confidence interval for projections */}
                <Area
                  type="monotone"
                  dataKey="confidenceMax"
                  stroke="transparent"
                  fill="#8B5CF6"
                  fillOpacity={0.1}
                  name="Confidence Range"
                />
                <Area
                  type="monotone"
                  dataKey="confidenceMin"
                  stroke="transparent"
                  fill="#ffffff"
                  name=" "
                />
                {/* Historical cost */}
                <Area
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fill="url(#colorHistorical)"
                  name="Historical Cost"
                  connectNulls={false}
                />
                {/* Projected cost */}
                <Area
                  type="monotone"
                  dataKey="projectedCost"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorProjected)"
                  name="Projected Cost"
                  connectNulls
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="complianceRate"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorCompliance)"
                name="Compliance Rate"
                connectNulls
              />
            )}

            {/* Reference line for projection start */}
            {data.historical.length > 0 && (
              <ReferenceLine
                x={data.historical[data.historical.length - 1].month}
                stroke="#9CA3AF"
                strokeDasharray="3 3"
                label={{
                  value: 'Projection Start',
                  position: 'top',
                  fontSize: 10,
                  fill: '#6B7280',
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500 rounded"></div>
          <span>Historical Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-purple-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8B5CF6, #8B5CF6 4px, transparent 4px, transparent 8px)' }}></div>
          <span>Projected (with confidence interval)</span>
        </div>
      </div>
    </motion.div>
  );
}
