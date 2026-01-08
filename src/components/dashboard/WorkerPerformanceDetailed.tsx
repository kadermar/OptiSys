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
    <div className="space-y-6">
      {/* Experience Level Summary Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
        <h2 className="text-xl font-bold text-[#1c2b40] mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
          Experience Level Analysis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {experienceLevelData.map((level: any) => (
            <div key={level.level} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-[#1c2b40]">{level.level}</h3>
                <span className="text-2xl font-bold text-gray-400">{level.workerCount}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Compliance:</span>
                  <span className="font-bold text-[#1c2b40]">{level.avgCompliance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Quality:</span>
                  <span className="font-bold text-[#1c2b40]">{level.avgQuality}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Incidents:</span>
                  <span className={`font-bold ${level.totalIncidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {level.totalIncidents}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scatter Plot: Experience vs Compliance */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
        <h3 className="text-xl font-bold text-[#1c2b40] mb-2 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
          Worker Compliance Distribution by Experience
        </h3>
        <p className="text-sm text-gray-600 mb-4 ml-4">Each point represents a worker - hover for details</p>

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
                    <div className="bg-white p-3 border-2 border-[#ff0000] rounded-lg shadow-xl">
                      <p className="font-bold text-[#1c2b40]">{data.name}</p>
                      <p className="text-sm text-gray-700">Experience: {data.experience}</p>
                      <p className="text-sm text-gray-700">Compliance: {data.compliance}%</p>
                      <p className="text-sm text-gray-700">Quality: {data.quality}/10</p>
                      <p className="text-sm text-gray-700">Incidents: {data.incidents}</p>
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
                    <div className="bg-white p-3 border-2 border-[#ff0000] rounded-lg shadow-xl">
                      <p className="font-bold text-[#1c2b40]">{data.name}</p>
                      <p className="text-sm text-gray-700">Experience: {data.experience}</p>
                      <p className="text-sm text-gray-700">Compliance: {data.compliance}%</p>
                      <p className="text-sm text-gray-700">Quality: {data.quality}/10</p>
                      <p className="text-sm text-gray-700">Incidents: {data.incidents}</p>
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
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1c2b40]">
            <span className="text-green-600">🏆</span> Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((worker, index) => (
              <div key={worker.worker_id} className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">#{index + 1}</span>
                    <span className="font-bold text-[#1c2b40]">{worker.worker_name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{worker.experience_level} - {worker.work_order_count} WOs</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{worker.compliance_rate}%</p>
                  <p className="text-xs text-gray-600">Quality: {worker.avg_quality_score}/10</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Support */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1c2b40]">
            <span className="text-orange-600">📚</span> Training Opportunities
          </h3>
          <div className="space-y-3">
            {needsSupport.map((worker, index) => (
              <div key={worker.worker_id} className="flex items-center justify-between p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c2b40]">{worker.worker_name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{worker.experience_level} - {worker.work_order_count} WOs</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{worker.compliance_rate}%</p>
                  <p className="text-xs text-gray-600">
                    {worker.incident_count} incidents, {worker.rework_count} rework
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-[#1c2b40] rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1c2b40]">
          <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
          <span>💡</span> Key Insights & Recommendations
        </h3>
        <div className="space-y-3">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border-l-4 border-green-500 shadow-md">
            <p className="text-sm font-medium text-gray-800">
              <strong className="text-[#1c2b40]">Experience Correlation:</strong> {experienceLevelData[0]?.level} workers show{' '}
              <span className="text-[#ff0000] font-bold">{experienceLevelData[0]?.avgCompliance}%</span> compliance on average
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border-l-4 border-yellow-500 shadow-md">
            <p className="text-sm font-medium text-gray-800">
              <strong className="text-[#1c2b40]">Training Impact:</strong> Focus mentorship on <span className="text-[#ff0000] font-bold">{needsSupport.length} workers</span> with compliance below 80%
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border-l-4 border-blue-500 shadow-md">
            <p className="text-sm font-medium text-gray-800">
              <strong className="text-[#1c2b40]">Best Practice Sharing:</strong> Connect top performers with teams needing support for peer learning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
