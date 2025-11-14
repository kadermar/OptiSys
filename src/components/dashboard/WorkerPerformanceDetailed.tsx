'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

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

interface WorkerPerformanceDetailedProps {
  workerData: Worker[];
}

const EXPERIENCE_COLORS: Record<string, string> = {
  Junior: '#EF4444',
  Mid: '#F59E0B',
  Senior: '#10B981',
  Expert: '#3B82F6',
};

export function WorkerPerformanceDetailed({ workerData }: WorkerPerformanceDetailedProps) {
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

  // Prepare scatter plot data: experience vs compliance
  const scatterData = workerData.map(worker => ({
    name: worker.worker_name,
    experience: worker.experience_level,
    compliance: parseFloat(worker.compliance_rate.toString()),
    quality: parseFloat(worker.avg_quality_score.toString()),
    incidents: worker.incident_count,
    experienceLevel: worker.experience_level,
  }));

  // Top performers (highest compliance rate)
  const topPerformers = [...workerData]
    .sort((a, b) => parseFloat(b.compliance_rate.toString()) - parseFloat(a.compliance_rate.toString()))
    .slice(0, 5);

  // Workers needing support (lowest compliance)
  const needsSupport = [...workerData]
    .sort((a, b) => parseFloat(a.compliance_rate.toString()) - parseFloat(b.compliance_rate.toString()))
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Worker Performance Analysis</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Experience level vs compliance correlation & training needs</p>
      </div>

      {/* Experience Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {experienceLevelData.map((level: any) => (
          <div key={level.level} className="bg-white dark:bg-gray-700 border-2 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg dark:text-white">{level.level}</h3>
              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{level.workerCount}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Compliance:</span>
                <span className="font-semibold dark:text-white">{level.avgCompliance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Quality:</span>
                <span className="font-semibold dark:text-white">{level.avgQuality}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Incidents:</span>
                <span className={`font-semibold ${level.totalIncidents > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {level.totalIncidents}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scatter Plot: Experience vs Compliance */}
      <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">Worker Compliance Distribution by Experience</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">Each point represents a worker - hover for details</p>

        <ResponsiveContainer width="100%" height={300} className="sm:hidden">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="category"
              dataKey="experience"
              name="Experience"
              allowDuplicatedCategory={false}
              label={{ value: 'Experience', position: 'bottom', offset: 20, style: { fontSize: 10 } }}
              tick={{ fontSize: 9 }}
            />
            <YAxis
              type="number"
              dataKey="compliance"
              name="Compliance"
              unit="%"
              domain={[0, 100]}
              label={{ value: 'Compliance (%)', angle: -90, position: 'left', offset: 20, style: { fontSize: 10 } }}
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
                      <p className="text-sm dark:text-gray-300">Experience: {data.experience}</p>
                      <p className="text-sm dark:text-gray-300">Compliance: {data.compliance}%</p>
                      <p className="text-sm dark:text-gray-300">Quality: {data.quality}/10</p>
                      <p className="text-sm dark:text-gray-300">Incidents: {data.incidents}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Workers" data={scatterData}>
              {scatterData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EXPERIENCE_COLORS[entry.experienceLevel as keyof typeof EXPERIENCE_COLORS] || '#999'}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={400} className="hidden sm:block">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="category"
              dataKey="experience"
              name="Experience"
              allowDuplicatedCategory={false}
              label={{ value: 'Experience Level', position: 'bottom', offset: 40 }}
            />
            <YAxis
              type="number"
              dataKey="compliance"
              name="Compliance"
              unit="%"
              domain={[0, 100]}
              label={{ value: 'Compliance Rate (%)', angle: -90, position: 'left', offset: 40 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                      <p className="font-semibold dark:text-white">{data.name}</p>
                      <p className="text-sm dark:text-gray-300">Experience: {data.experience}</p>
                      <p className="text-sm dark:text-gray-300">Compliance: {data.compliance}%</p>
                      <p className="text-sm dark:text-gray-300">Quality: {data.quality}/10</p>
                      <p className="text-sm dark:text-gray-300">Incidents: {data.incidents}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Workers" data={scatterData}>
              {scatterData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EXPERIENCE_COLORS[entry.experienceLevel as keyof typeof EXPERIENCE_COLORS] || '#999'}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers & Needs Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <span className="text-green-600 dark:text-green-400">🏆</span> Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((worker, index) => (
              <div key={worker.worker_id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">#{index + 1}</span>
                    <span className="font-semibold dark:text-white">{worker.worker_name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{worker.experience_level} - {worker.work_order_count} WOs</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{worker.compliance_rate}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quality: {worker.avg_quality_score}/10</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Support */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <span className="text-orange-600 dark:text-orange-400">📚</span> Training Opportunities
          </h3>
          <div className="space-y-3">
            {needsSupport.map((worker, index) => (
              <div key={worker.worker_id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold dark:text-white">{worker.worker_name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{worker.experience_level} - {worker.work_order_count} WOs</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{worker.compliance_rate}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {worker.incident_count} incidents, {worker.rework_count} rework
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 dark:text-white">
          <span>💡</span> Key Insights & Recommendations
        </h3>
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
    </div>
  );
}
