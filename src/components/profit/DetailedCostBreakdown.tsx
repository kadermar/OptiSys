'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/costConstants';

interface CategoryData {
  total: number;
  percentOfTotal: number;
  details: Record<string, number>;
}

interface BreakdownData {
  totalProfitImpact: number;
  categories: {
    labor: CategoryData;
    material: CategoryData;
    safety: CategoryData;
    downtime: CategoryData;
    quality: CategoryData;
  };
}

interface DetailedCostBreakdownProps {
  data: BreakdownData | null;
}

const CATEGORY_CONFIG = {
  labor: {
    name: 'Labor & Rework',
    color: '#3B82F6',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Overtime labor costs from rework and extended task duration',
  },
  material: {
    name: 'Material & Equipment',
    color: '#8B5CF6',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    description: 'Equipment damage and material waste from non-compliant work',
  },
  safety: {
    name: 'Safety Incidents',
    color: '#EF4444',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    description: 'Direct and indirect costs including OSHA multiplier',
  },
  downtime: {
    name: 'Production Downtime',
    color: '#F59E0B',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Lost production revenue from equipment downtime',
  },
  quality: {
    name: 'Quality Impact',
    color: '#10B981',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    description: 'Customer satisfaction and warranty costs from quality issues',
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function DetailedCostBreakdown({ data }: DetailedCostBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!data) return null;

  // Prepare chart data
  const pieData = Object.entries(data.categories).map(([key, value]) => ({
    name: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG].name,
    value: value.total,
    color: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG].color,
    key,
  }));

  const barData = Object.entries(data.categories).map(([key, value]) => ({
    name: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG].name.split(' ')[0],
    fullName: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG].name,
    value: value.total,
    percent: value.percentOfTotal,
    fill: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG].color,
    key,
  }));

  // Sort by value descending for bar chart
  barData.sort((a, b) => b.value - a.value);

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
      <h2 className="text-xl font-bold text-[#1c2b40] mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
        Cost Breakdown by Category
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stacked Bar Chart */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Distribution by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Cost']}
                  labelFormatter={(label) => barData.find(d => d.name === label)?.fullName || label}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Proportion of Total Cost</h3>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-[#1c2b40]">{formatCurrency(data.totalProfitImpact)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(data.categories).map(([key, value]) => {
          const config = CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG];
          const isExpanded = expandedCategory === key;

          return (
            <motion.div
              key={key}
              className={`rounded-xl p-4 cursor-pointer transition-all duration-300 border-2 ${
                isExpanded ? 'border-gray-300 shadow-lg' : 'border-transparent'
              }`}
              style={{ backgroundColor: `${config.color}10` }}
              onClick={() => setExpandedCategory(isExpanded ? null : key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: config.color }}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{config.name}</p>
                  <p className="text-lg font-bold" style={{ color: config.color }}>
                    {formatCurrency(value.total)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{value.percentOfTotal}% of total</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                    <div className="space-y-1">
                      {Object.entries(value.details).map(([detailKey, detailValue]) => (
                        <div key={detailKey} className="flex justify-between text-xs">
                          <span className="text-gray-500 capitalize">
                            {detailKey.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="font-medium text-gray-700">
                            {typeof detailValue === 'number' && detailKey.toLowerCase().includes('cost')
                              ? formatCurrency(detailValue)
                              : detailValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
