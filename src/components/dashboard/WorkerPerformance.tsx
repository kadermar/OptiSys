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
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
          <span>💡</span> Key Insights & Recommendations
        </h3>
        <Link
          href="/workers"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View More
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="space-y-2 text-sm dark:text-gray-300">
        <p>
          <strong className="dark:text-white">Experience Correlation:</strong> {experienceLevelData[0]?.level} workers show{' '}
          {experienceLevelData[0]?.avgCompliance}% compliance on average
        </p>
        <p>
          <strong className="dark:text-white">Training Impact:</strong> Focus mentorship on {needsSupport.length} workers with compliance below 80%
        </p>
        <p>
          <strong className="dark:text-white">Best Practice Sharing:</strong> Connect top performers with teams needing support for peer learning
        </p>
      </div>
    </div>
  );
}
