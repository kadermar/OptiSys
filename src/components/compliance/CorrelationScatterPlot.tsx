'use client';

import Link from 'next/link';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
         ResponsiveContainer, ReferenceLine, Label, ZAxis } from 'recharts';

interface CorrelationPoint {
  procedure_id: string;
  name: string;
  compliance_rate: number;
  incident_rate_reduction: number;
  cost_impact: number;
  category: string;
}

export function CorrelationScatterPlot({ data }: { data: CorrelationPoint[] }) {
  const trendLine = calculateTrendLine(data);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 border-l-4 border-[#ff0000]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1c2b40] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff0000] rounded-full flex items-center justify-center text-white text-xl shadow-lg">
              📈
            </div>
            Statistical Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-13">
            Correlation between compliance and incident reduction across all procedures
          </p>
        </div>
        <Link
          href="/compliance-analysis"
          className="px-4 py-2 bg-[#ff0000] text-white font-semibold rounded-lg hover:bg-[#cc0000] transition-colors shadow-lg whitespace-nowrap"
        >
          View More →
        </Link>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 80, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          <XAxis
            type="number"
            dataKey="compliance_rate"
            name="Compliance Rate"
            unit="%"
            domain={[50, 105]}
            ticks={[50, 60, 70, 80, 90, 100]}
          >
            <Label
              value="Procedure Compliance Rate (%)"
              position="bottom"
              offset={50}
              style={{ fontSize: 16, fontWeight: 600, fill: '#1c2b40' }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="incident_rate_reduction"
            name="Incident Rate Reduction"
            unit="%"
            domain={[-100, 100]}
          >
            <Label
              value="Incident Rate Reduction (%)"
              angle={-90}
              position="left"
              offset={50}
              style={{ fontSize: 16, fontWeight: 600, fill: '#1c2b40' }}
            />
          </YAxis>

          <ZAxis type="number" dataKey="cost_impact" range={[100, 1000]} />

          {/* Trend Line */}
          <ReferenceLine
            segment={[
              { x: 50, y: trendLine.getY(50) },
              { x: 100, y: trendLine.getY(100) }
            ]}
            stroke="#ff0000"
            strokeWidth={3}
            label={{
              value: "Trend: Higher compliance → Fewer incidents",
              position: "top",
              fill: "#ff0000",
              fontWeight: 700,
              fontSize: 14
            }}
          />

          {/* Data Points */}
          <Scatter
            name="Procedures"
            data={data}
            fill="#3B82F6"
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as CorrelationPoint;
                return (
                  <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-xl">
                    <p className="font-bold text-lg mb-2 text-[#1c2b40]">{data.name}</p>
                    <p className="text-sm text-gray-700">Compliance: {data.compliance_rate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-700">Incident Reduction: {data.incident_rate_reduction.toFixed(1)}%</p>
                    <p className="text-sm text-gray-700">Cost Impact: ${(data.cost_impact/1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500 mt-1">{data.category}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helper functions
function calculateTrendLine(data: CorrelationPoint[]) {
  const n = data.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, getY: () => 0, rSquared: 0 };
  }

  const sumX = data.reduce((acc, d) => acc + d.compliance_rate, 0);
  const sumY = data.reduce((acc, d) => acc + d.incident_rate_reduction, 0);
  const sumXY = data.reduce((acc, d) => acc + d.compliance_rate * d.incident_rate_reduction, 0);
  const sumX2 = data.reduce((acc, d) => acc + d.compliance_rate * d.compliance_rate, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    getY: (x: number) => slope * x + intercept,
    rSquared: calculateRSquared(data, slope, intercept)
  };
}

function calculateRSquared(data: CorrelationPoint[], slope: number, intercept: number) {
  const yMean = data.reduce((acc, d) => acc + d.incident_rate_reduction, 0) / data.length;
  const ssTotal = data.reduce((acc, d) =>
    acc + Math.pow(d.incident_rate_reduction - yMean, 2), 0);
  const ssResidual = data.reduce((acc, d) => {
    const yPred = slope * d.compliance_rate + intercept;
    return acc + Math.pow(d.incident_rate_reduction - yPred, 2);
  }, 0);

  return Math.max(0, 1 - (ssResidual / ssTotal));
}
