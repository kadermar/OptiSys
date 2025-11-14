import Link from 'next/link';

interface InsightCardProps {
  type: 'success' | 'risk' | 'underperforming' | 'opportunity';
  title: string;
  metric: string;
  compliance: string;
  impact: string;
  recommendation: string;
  impactStars: number;
  procedureId: string;
}

function InsightCard({ type, title, metric, compliance, impact, recommendation, impactStars, procedureId }: InsightCardProps) {
  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    risk: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
    underperforming: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
    opportunity: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
  };

  const badgeColors = {
    success: 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100',
    risk: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100',
    underperforming: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100',
    opportunity: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100',
  };

  const icons = {
    success: '🟢',
    risk: '🔴',
    underperforming: '🟡',
    opportunity: '🔵',
  };

  return (
    <Link
      href={`/procedures?selected=${procedureId}`}
      className={`${bgColors[type]} border-2 rounded-lg p-6 h-full block hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icons[type]}</span>
        <span className={`${badgeColors[type]} px-3 py-1 rounded-full text-xs font-semibold`}>
          {type.toUpperCase()}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-4 dark:text-white">{title}</h3>

      <div className="space-y-4">
        <div>
          <p className="text-2xl font-bold dark:text-white">{metric}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Compliance:</span>
            <span className="font-semibold dark:text-white">{compliance}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Impact:</span>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < impactStars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t dark:border-gray-600">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{impact}</p>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">RECOMMENDATION</p>
          <p className="text-sm dark:text-gray-300">{recommendation}</p>
        </div>
      </div>
    </Link>
  );
}

interface ExecutiveSummaryProps {
  procedureData: any[];
}

export function ExecutiveSummary({ procedureData }: ExecutiveSummaryProps) {
  // Extract key insights from procedure data
  const lotoData = procedureData.find((p: any) => p.procedure_id === 'SAF-002') || procedureData[0];
  const corrosionData = procedureData.find((p: any) => p.procedure_id === 'INT-031') || procedureData[1];
  const pumpData = procedureData.find((p: any) => p.procedure_id === 'MNT-202') || procedureData[2];
  const compressorData = procedureData.find((p: any) => p.procedure_id === 'OPS-004') || procedureData[3];

  return (
    <div className="space-y-4">
      {/* View All Procedures Button */}
      <div className="flex justify-end">
        <Link
          href="/procedures"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          View All Procedures
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lotoData && (
          <InsightCard
            type="success"
            title="LOTO Procedure Adherence"
            metric="Eliminates incidents by 100%"
            compliance={`${lotoData?.compliance_rate || 0}% (${lotoData?.compliant_count || 0}/${lotoData?.total_work_orders || 0})`}
            impact="0 incidents when compliant vs 3 when non-compliant"
            recommendation="Expand LOTO best practices across all facilities"
            impactStars={5}
            procedureId={lotoData.procedure_id}
          />
        )}

        {corrosionData && (
          <InsightCard
            type="risk"
            title="Corrosion Inspection Delays"
            metric="3.5x more leak events"
            compliance={`${corrosionData?.compliance_rate || 0}% on-time`}
            impact="22% overdue correlates with leak incidents"
            recommendation="Increase inspection frequency + automated scheduling"
            impactStars={4}
            procedureId={corrosionData.procedure_id}
          />
        )}

        {pumpData && (
          <InsightCard
            type="underperforming"
            title="Pump Overhaul Process"
            metric="7x higher rework rate"
            compliance={`${pumpData?.compliance_rate || 0}% followed`}
            impact="Procedure clarity issues in steps 5-8"
            recommendation="Simplify checklist + add photo guides"
            impactStars={3}
            procedureId={pumpData.procedure_id}
          />
        )}

        {compressorData && (
          <InsightCard
            type="opportunity"
            title="Compressor Start-Up"
            metric="User feedback: 3.8/5"
            compliance={`${compressorData?.compliance_rate || 0}% compliance`}
            impact="Unclear valve sequencing reported"
            recommendation="Create visual quick-reference guide"
            impactStars={2}
            procedureId={compressorData.procedure_id}
          />
        )}
      </div>
    </div>
  );
}
