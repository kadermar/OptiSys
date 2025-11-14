'use client';

interface ComparisonMetric {
  label: string;
  nonCompliant: {
    value: string | number;
    description: string;
    visualValue: number;
  };
  compliant: {
    value: string | number;
    description: string;
    visualValue: number;
  };
  multiplier?: string;
}

interface SplitScreenData {
  totalWorkOrders: number;
  nonCompliantCount: number;
  compliantCount: number;
  nonCompliantPercent: number;
  compliantPercent: number;
  metrics: ComparisonMetric[];
}

export function SplitScreenComparison({ data }: { data: SplitScreenData }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-[#ff0000]">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2b40] text-center flex items-center justify-center gap-2">
          <span className="w-2 h-8 bg-[#ff0000] rounded"></span>
          Compliance vs Results: The Evidence
        </h2>
        <p className="text-center text-gray-600 mt-2">
          {data.totalWorkOrders} work orders analyzed | {data.compliantPercent.toFixed(1)}% compliance rate
        </p>
      </div>

      <div className="p-6">
        {/* Header Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Non-Compliant Side */}
          <div className="text-center p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="text-4xl mb-2">❌</div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Non-Compliant Work
            </h3>
            <p className="text-sm text-red-700 mb-4">
              &lt;100% checklist complete
            </p>
            <div className="mt-4">
              <div className="text-3xl font-bold text-red-600">{data.nonCompliantCount}</div>
              <div className="text-sm text-red-600">Work Orders ({data.nonCompliantPercent.toFixed(1)}%)</div>
            </div>
          </div>

          {/* Compliant Side */}
          <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Compliant Work
            </h3>
            <p className="text-sm text-green-700 mb-4">
              100% checklist complete
            </p>
            <div className="mt-4">
              <div className="text-3xl font-bold text-green-600">{data.compliantCount}</div>
              <div className="text-sm text-green-600">Work Orders ({data.compliantPercent.toFixed(1)}%)</div>
            </div>
          </div>
        </div>

        {/* Metrics Comparison */}
        <div className="space-y-6">
          {data.metrics.map((metric, index) => (
            <ComparisonMetricRow key={index} metric={metric} />
          ))}
        </div>

        {/* Bottom Line */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-900 mb-2">
            THE VERDICT
          </div>
          <div className="text-lg text-blue-800 mb-1">
            Following procedures reduces risk by <span className="font-bold text-3xl text-[#ff0000]">15.6x</span>
          </div>
          <div className="text-lg text-blue-800">
            and saves <span className="font-bold text-3xl text-green-600">$1.07M</span> per year
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonMetricRow({ metric }: { metric: ComparisonMetric }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-bold text-lg mb-4 text-[#1c2b40]">{metric.label}</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Non-Compliant */}
        <div>
          <div className="mb-2">
            <div className="w-full bg-red-200 rounded-full h-8 relative">
              <div
                className="bg-red-600 h-8 rounded-full transition-all duration-500 absolute left-0"
                style={{ width: `${metric.nonCompliant.visualValue}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-[#1c2b40] font-bold text-sm">
                {metric.nonCompliant.value}
              </div>
            </div>
          </div>
          <p className="text-sm text-red-700 font-semibold">
            {metric.nonCompliant.description}
          </p>
        </div>

        {/* Compliant */}
        <div>
          <div className="mb-2">
            <div className="w-full bg-green-200 rounded-full h-8 relative">
              <div
                className="bg-green-600 h-8 rounded-full transition-all duration-500 absolute left-0"
                style={{ width: `${metric.compliant.visualValue}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-[#1c2b40] font-bold text-sm">
                {metric.compliant.value}
              </div>
            </div>
          </div>
          <p className="text-sm text-green-700 font-semibold">
            {metric.compliant.description}
          </p>
        </div>
      </div>

      {/* Multiplier */}
      {metric.multiplier && (
        <div className="mt-3 text-center">
          <span className="inline-block bg-orange-500 text-white text-sm px-4 py-1 rounded-full font-semibold">
            {metric.multiplier}
          </span>
        </div>
      )}
    </div>
  );
}
