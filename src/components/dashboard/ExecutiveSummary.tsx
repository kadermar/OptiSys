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
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-green-100',
    risk: 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 shadow-red-100',
    underperforming: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-yellow-100',
    opportunity: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-blue-100',
  };

  const badgeColors = {
    success: 'bg-green-500 text-white shadow-lg',
    risk: 'bg-red-500 text-white shadow-lg',
    underperforming: 'bg-yellow-500 text-white shadow-lg',
    opportunity: 'bg-blue-500 text-white shadow-lg',
  };

  const icons = {
    success: '✓',
    risk: '!',
    underperforming: '⚠',
    opportunity: '★',
  };

  const iconBg = {
    success: 'bg-green-500',
    risk: 'bg-red-500',
    underperforming: 'bg-yellow-500',
    opportunity: 'bg-blue-500',
  };

  return (
    <Link
      href={`/procedures?selected=${procedureId}`}
      className={`${bgColors[type]} border-2 rounded-lg p-4 h-full block hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-md`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBg[type]} w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
          {icons[type]}
        </div>
        <span className={`${badgeColors[type]} px-2 py-0.5 rounded-full text-xs font-bold tracking-wide`}>
          {type.toUpperCase()}
        </span>
      </div>
      <h3 className="text-base font-bold mb-3 text-[#1c2b40]">{title}</h3>

      <div className="space-y-3">
        <div>
          <p className="text-lg font-bold text-[#1c2b40]">{metric}</p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Compliance:</span>
            <span className="font-bold text-[#1c2b40]">{compliance}</span>
          </div>
          <div>
            <span className="text-gray-700 font-medium">Impact:</span>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < impactStars ? 'text-[#ff0000] drop-shadow text-sm' : 'text-gray-300 text-sm'}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t-2 border-gray-300">
          <p className="text-xs font-semibold text-gray-800">{impact}</p>
        </div>

        <div className="bg-white/80 backdrop-blur p-2 rounded-lg border border-gray-200 shadow-inner">
          <p className="text-xs font-bold text-[#ff0000] mb-1">RECOMMENDATION</p>
          <p className="text-xs font-medium text-gray-800">{recommendation}</p>
        </div>
      </div>
    </Link>
  );
}

interface ExecutiveSummaryProps {
  procedureData: any[];
  workerData: any[];
}

export function ExecutiveSummary({ procedureData, workerData }: ExecutiveSummaryProps) {
  // Extract key insights from procedure data
  const lotoData = procedureData.find((p: any) => p.procedure_id === 'SAF-002') || procedureData[0];
  const corrosionData = procedureData.find((p: any) => p.procedure_id === 'INT-031') || procedureData[1];
  const pumpData = procedureData.find((p: any) => p.procedure_id === 'MNT-202') || procedureData[2];
  const compressorData = procedureData.find((p: any) => p.procedure_id === 'OPS-004') || procedureData[3];

  // Worker performance data
  const experienceStats = workerData.reduce((acc: any, worker) => {
    const level = worker.experience_level;
    if (!acc[level]) {
      acc[level] = {
        level,
        workers: [],
        avgCompliance: 0,
        avgQuality: 0,
        totalIncidents: 0,
        totalRework: 0,
      };
    }
    acc[level].workers.push(worker);
    return acc;
  }, {});

  const experienceLevelData = Object.values(experienceStats).map((stat: any) => {
    const workers = stat.workers;
    return {
      level: stat.level,
      avgCompliance: (workers.reduce((sum: number, w: any) => sum + parseFloat(w.compliance_rate.toString()), 0) / workers.length).toFixed(1),
      avgQuality: (workers.reduce((sum: number, w: any) => sum + parseFloat(w.avg_quality_score.toString()), 0) / workers.length).toFixed(1),
      totalIncidents: workers.reduce((sum: number, w: any) => sum + w.incident_count, 0),
      totalRework: workers.reduce((sum: number, w: any) => sum + w.rework_count, 0),
      workerCount: workers.length,
    };
  });

  const needsSupport = [...workerData]
    .sort((a, b) => parseFloat(a.compliance_rate.toString()) - parseFloat(b.compliance_rate.toString()))
    .filter(w => parseFloat(w.compliance_rate.toString()) < 80)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-[#1c2b40]">Key Insights & Recommendations</h2>
        <Link
          href="/procedures"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          View All
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Insight Cards */}
      <div className="space-y-4">
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

      {/* Recommendations Section */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1c2b40] flex items-center gap-2">
            <div className="w-6 h-6 bg-[#ff0000] rounded-full flex items-center justify-center text-white text-sm shadow-lg">
              💡
            </div>
            Action Items
          </h3>
          <Link
            href="/workers"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1c2b40] hover:bg-[#2d3e54] text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            View More
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="space-y-3">
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 border-l-4 border-green-500 shadow-md">
            <p className="text-xs font-medium text-gray-800">
              <strong className="text-[#1c2b40] text-sm">Experience Correlation:</strong>{' '}
              <span className="text-gray-700">{experienceLevelData[0]?.level} workers show{' '}
              <span className="text-[#ff0000] font-bold">{experienceLevelData[0]?.avgCompliance}%</span> compliance</span>
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 border-l-4 border-yellow-500 shadow-md">
            <p className="text-xs font-medium text-gray-800">
              <strong className="text-[#1c2b40] text-sm">Training Impact:</strong>{' '}
              <span className="text-gray-700">Focus on <span className="text-[#ff0000] font-bold">{needsSupport.length} workers</span> below 80%</span>
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 border-l-4 border-blue-500 shadow-md">
            <p className="text-xs font-medium text-gray-800">
              <strong className="text-[#1c2b40] text-sm">Best Practice Sharing:</strong>{' '}
              <span className="text-gray-700">Connect top performers for peer learning</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
