'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, BarChart, Bar } from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Safety: '#8B5CF6',
  Maintenance: '#EC4899',
  Operations: '#06B6D4',
  Integrity: '#14B8A6',
};

interface CorrelationProofProps {
  correlationData: any[];
  procedureData: any[];
  facilityData: any[];
  onPointClick?: (procedureId: string) => void;
  highlightedProcedureIds?: string[];
}

export function CorrelationProof({ correlationData, procedureData, facilityData, onPointClick, highlightedProcedureIds = [] }: CorrelationProofProps) {
  // Transform data for scatter plot
  const scatterData = correlationData?.map((item: any) => ({
    name: item.name,
    x: parseFloat(item.compliance_rate),
    y: parseFloat(item.kpi_improvement),
    size: parseInt(item.work_order_count),
    category: item.category,
    procedure_id: item.procedure_id,
  })) || [];

  // Prepare bar chart data for procedure rankings
  const rankingData = procedureData?.map((p: any) => {
    const compliantRate = p.compliant_count > 0
      ? (p.compliant_incidents / p.compliant_count) * 100
      : 0;
    const nonCompliantRate = (p.total_work_orders - p.compliant_count) > 0
      ? (p.noncompliant_incidents / (p.total_work_orders - p.compliant_count)) * 100
      : 0;

    const improvement = nonCompliantRate > 0 && compliantRate >= 0
      ? ((1 - (compliantRate / nonCompliantRate)) * 100).toFixed(0)
      : 100;

    return {
      name: p.name.split(' ').slice(0, 3).join(' '),
      improvement: Math.max(0, parseInt(improvement.toString())),
      compliance: parseFloat(p.compliance_rate),
    };
  }).sort((a: any, b: any) => b.improvement - a.improvement) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Correlation Proof</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Click any point to see work orders below</p>
      </div>

      {/* Scatter Plot */}
      <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">Compliance vs. Outcome Performance</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">Click any point to drill down - 4 quadrant analysis</p>

        <ResponsiveContainer width="100%" height={300} className="sm:hidden">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Compliance"
              unit="%"
              domain={[60, 100]}
              label={{ value: 'Compliance (%)', position: 'bottom', offset: 20, style: { fontSize: 10 } }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="KPI"
              unit="%"
              domain={[-50, 100]}
              label={{ value: 'KPI (%)', angle: -90, position: 'left', offset: 20, style: { fontSize: 10 } }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                      <p className="font-semibold dark:text-white">{data.name}</p>
                      <p className="text-sm dark:text-gray-300">Compliance: {data.x}%</p>
                      <p className="text-sm dark:text-gray-300">Improvement: {data.y}%</p>
                      <p className="text-sm dark:text-gray-300">Work Orders: {data.size}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Scatter
              name="Procedures"
              data={scatterData}
              onClick={(data: any) => {
                if (onPointClick && data && data.procedure_id) {
                  onPointClick(data.procedure_id);
                }
              }}
              cursor="pointer"
            >
              {scatterData.map((entry: any, index: number) => {
                const isHighlighted = highlightedProcedureIds.includes(entry.procedure_id);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#999'}
                    stroke={isHighlighted ? '#3B82F6' : 'none'}
                    strokeWidth={isHighlighted ? 4 : 0}
                    opacity={highlightedProcedureIds.length === 0 || isHighlighted ? 1 : 0.3}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={400} className="hidden sm:block">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Compliance"
              unit="%"
              domain={[60, 100]}
              label={{ value: 'Procedure Compliance (%)', position: 'bottom', offset: 40 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="KPI Improvement"
              unit="%"
              domain={[-50, 100]}
              label={{ value: 'KPI Improvement (%)', angle: -90, position: 'left', offset: 40 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                      <p className="font-semibold dark:text-white">{data.name}</p>
                      <p className="text-sm dark:text-gray-300">Compliance: {data.x}%</p>
                      <p className="text-sm dark:text-gray-300">Improvement: {data.y}%</p>
                      <p className="text-sm dark:text-gray-300">Work Orders: {data.size}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Scatter
              name="Procedures"
              data={scatterData}
              onClick={(data: any) => {
                if (onPointClick && data && data.procedure_id) {
                  onPointClick(data.procedure_id);
                }
              }}
              cursor="pointer"
            >
              {scatterData.map((entry: any, index: number) => {
                const isHighlighted = highlightedProcedureIds.includes(entry.procedure_id);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#999'}
                    stroke={isHighlighted ? '#3B82F6' : 'none'}
                    strokeWidth={isHighlighted ? 4 : 0}
                    opacity={highlightedProcedureIds.length === 0 || isHighlighted ? 1 : 0.3}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
            <p className="font-semibold text-xs sm:text-sm dark:text-white">✅ Top-Right: Working Well</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Followed + Good Results → KEEP</p>
          </div>
          <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded">
            <p className="font-semibold text-xs sm:text-sm dark:text-white">🔧 Bottom-Right: Underperforming</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Followed but Bad Results → FIX PROCEDURE</p>
          </div>
        </div>
      </div>

      {/* Bar Chart Rankings */}
      <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">Procedure Impact Rankings</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">Ranked by KPI improvement from compliance</p>

        <ResponsiveContainer width="100%" height={250} className="sm:hidden">
          <BarChart data={rankingData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="improvement" fill="#3B82F6" name="KPI Improvement (%)" />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
          <BarChart data={rankingData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Bar dataKey="improvement" fill="#3B82F6" name="KPI Improvement (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Facility Comparison */}
      <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">Compliance by Facility</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">Cultural patterns across platforms</p>

        <div className="space-y-4">
          {facilityData?.map((facility: any) => (
            <div key={facility.facility_id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold dark:text-white">{facility.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{facility.performance_tier} Performer</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold dark:text-white">{facility.compliance_rate}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {facility.work_order_count} WOs, {facility.total_incidents} incidents
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${facility.compliance_rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
