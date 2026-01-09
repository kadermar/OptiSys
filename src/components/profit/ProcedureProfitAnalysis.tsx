'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/costConstants';

interface ProcedureData {
  procedure_id: string;
  name: string;
  category: string;
  compliance_rate: number;
  work_order_count: number;
  laborCost: number;
  incidentCost: number;
  materialCost: number;
  downtimeCost: number;
  qualityCost: number;
  totalProfitImpact: number;
  contributionPercent: number;
}

interface CategoryData {
  category: string;
  totalCost: number;
  procedureCount: number;
  avgCompliance: number;
}

interface ProcedureProfitAnalysisProps {
  data: {
    procedures: ProcedureData[];
    categories: CategoryData[];
    summary: {
      totalProcedures: number;
      totalProfitImpact: number;
      topCostProcedure: string;
      topCategory: string;
      avgComplianceRate: number;
    };
  } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Maintenance: '#3B82F6',
  Safety: '#EF4444',
  Quality: '#10B981',
  Operations: '#F59E0B',
  Training: '#8B5CF6',
  Calibration: '#EC4899',
  Inspection: '#06B6D4',
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Custom content for treemap cells
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value, color } = props;

  if (width < 50 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      {width > 80 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
            fontWeight="bold"
          >
            {name?.length > 12 ? name.substring(0, 12) + '...' : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            opacity={0.9}
          >
            {formatCurrency(value)}
          </text>
        </>
      )}
    </g>
  );
};

export function ProcedureProfitAnalysis({ data }: ProcedureProfitAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'totalProfitImpact' | 'compliance_rate' | 'work_order_count'>('totalProfitImpact');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!data) return null;

  // Filter and sort procedures
  const filteredProcedures = useMemo(() => {
    let procedures = [...data.procedures];

    if (selectedCategory !== 'all') {
      procedures = procedures.filter(p => p.category === selectedCategory);
    }

    procedures.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return procedures;
  }, [data.procedures, selectedCategory, sortBy, sortOrder]);

  // Prepare treemap data
  const treemapData = data.categories.map(cat => ({
    name: cat.category,
    size: cat.totalCost,
    color: CATEGORY_COLORS[cat.category] || '#6B7280',
  }));

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => (
    <svg
      className={`w-4 h-4 inline-block ml-1 ${sortBy === column ? 'text-[#1c2b40]' : 'text-gray-300'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={sortBy === column && sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  );

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1c2b40] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Procedure Profit Impact
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Cost analysis across {data.summary.totalProcedures} procedures
          </p>
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1c2b40]"
        >
          <option value="all">All Categories</option>
          {data.categories.map(cat => (
            <option key={cat.category} value={cat.category}>
              {cat.category} ({cat.procedureCount})
            </option>
          ))}
        </select>
      </div>

      {/* Treemap */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Cost by Category</h3>
        <div className="h-[200px] bg-gray-50 rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              content={<CustomTreemapContent />}
            >
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Cost Impact']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {data.categories.map(cat => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category === selectedCategory ? 'all' : cat.category)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.category
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#6B7280' }}
              />
              {cat.category}
            </button>
          ))}
        </div>
      </div>

      {/* Procedure Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Procedure</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">Category</th>
              <th
                className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('compliance_rate')}
              >
                Compliance <SortIcon column="compliance_rate" />
              </th>
              <th
                className="px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                onClick={() => toggleSort('work_order_count')}
              >
                Work Orders <SortIcon column="work_order_count" />
              </th>
              <th
                className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('totalProfitImpact')}
              >
                Cost Impact <SortIcon column="totalProfitImpact" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProcedures.map((proc, index) => (
              <motion.tr
                key={proc.procedure_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-[#1c2b40]">{proc.name}</div>
                  <div className="text-xs text-gray-500 sm:hidden">{proc.category}</div>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[proc.category] || '#6B7280'}20`,
                      color: CATEGORY_COLORS[proc.category] || '#6B7280',
                    }}
                  >
                    {proc.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          proc.compliance_rate >= 90
                            ? 'bg-green-500'
                            : proc.compliance_rate >= 75
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${proc.compliance_rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-10">
                      {proc.compliance_rate}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <span className="text-gray-700">{proc.work_order_count}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-bold text-red-600">{formatCurrency(proc.totalProfitImpact)}</div>
                  <div className="text-xs text-gray-500">{proc.contributionPercent}% of total</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProcedures.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No procedures found for the selected category
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>
            Showing <strong>{filteredProcedures.length}</strong> procedures
          </span>
          <span>|</span>
          <span>
            Total Cost: <strong className="text-red-600">
              {formatCurrency(filteredProcedures.reduce((sum, p) => sum + p.totalProfitImpact, 0))}
            </strong>
          </span>
          <span>|</span>
          <span>
            Avg Compliance: <strong>
              {filteredProcedures.length > 0
                ? (filteredProcedures.reduce((sum, p) => sum + p.compliance_rate, 0) / filteredProcedures.length).toFixed(1)
                : 0}%
            </strong>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
