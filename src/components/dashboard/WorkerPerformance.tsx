'use client';

import Link from 'next/link';

interface Worker {
  worker_id: string;
  worker_name: string;
  experience_level: string;
  work_order_count: number;
  compliance_rate: number;
  incident_count: number;
  rework_count: number;
  avg_quality_score: number;
  avg_duration_hours: number;
}

interface WorkerPerformanceProps {
  workerData: Worker[];
}

export function WorkerPerformance({ workerData }: WorkerPerformanceProps) {
  // Group by experience level
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

  // Calculate averages for each experience level
  const experienceLevelData = Object.values(experienceStats).map((stat: any) => {
    const workers = stat.workers;
    return {
      level: stat.level,
      avgCompliance: (workers.reduce((sum: number, w: Worker) => sum + parseFloat(w.compliance_rate.toString()), 0) / workers.length).toFixed(1),
      avgQuality: (workers.reduce((sum: number, w: Worker) => sum + parseFloat(w.avg_quality_score.toString()), 0) / workers.length).toFixed(1),
      totalIncidents: workers.reduce((sum: number, w: Worker) => sum + w.incident_count, 0),
      totalRework: workers.reduce((sum: number, w: Worker) => sum + w.rework_count, 0),
      workerCount: workers.length,
    };
  });

  // Workers needing support (lowest compliance)
  const needsSupport = [...workerData]
    .sort((a, b) => parseFloat(a.compliance_rate.toString()) - parseFloat(b.compliance_rate.toString()))
    .filter(w => parseFloat(w.compliance_rate.toString()) < 80)
    .slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-[#1c2b40] rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-[#1c2b40]">
          <div className="w-8 h-8 bg-[#ff0000] rounded-full flex items-center justify-center text-white text-lg shadow-lg">
            💡
          </div>
          Recommendations
        </h3>
        <Link
          href="/workers"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1c2b40] hover:bg-[#2d3e54] text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
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
  );
}
