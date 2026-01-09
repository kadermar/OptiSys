'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WorkerPerformanceDetailed } from '@/components/dashboard/WorkerPerformanceDetailed';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

// Skeleton Component
function WorkersSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Experience Level Cards Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
          <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
          <div className="h-6 w-72 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>

        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  textColor: string;
}

function StatCard({ title, value, icon, gradient, iconBg, textColor }: StatCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      className={`relative overflow-hidden rounded-xl ${gradient} p-5 group hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
      </div>
      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500"></div>
    </motion.div>
  );
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const workersRes = await fetch('/api/dashboard/workers');

        if (!workersRes.ok) {
          throw new Error('Failed to fetch worker data');
        }

        setWorkers(await workersRes.json());
      } catch (error) {
        console.error('Error fetching worker data:', error);
        setError('Failed to load worker data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <WorkersSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-xl p-8 border border-red-100"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Calculate summary stats
  const avgCompliance = workers.length > 0
    ? (workers.reduce((sum, w) => sum + parseFloat(w.compliance_rate.toString()), 0) / workers.length).toFixed(1)
    : '0';
  const totalIncidents = workers.reduce((sum, w) => sum + (Number(w.incident_count) || 0), 0);
  const totalRework = workers.reduce((sum, w) => sum + (Number(w.rework_count) || 0), 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1c2b40] to-[#2d3e54] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Worker Performance</h1>
              <p className="text-sm text-gray-600 mt-1">
                Detailed performance analysis and training recommendations for {workers.length} workers
              </p>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Workers"
              value={workers.length}
              gradient="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
              textColor="text-blue-700"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              title="Avg Compliance"
              value={`${avgCompliance}%`}
              gradient="bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              textColor="text-green-700"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Total Incidents"
              value={totalIncidents}
              gradient="bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
              iconBg="bg-gradient-to-br from-red-500 to-red-600"
              textColor="text-red-700"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <StatCard
              title="Rework Cases"
              value={totalRework}
              gradient="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200"
              iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
              textColor="text-yellow-700"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={fadeInUp}>
          <WorkerPerformanceDetailed workerData={workers} />
        </motion.div>
      </main>
    </motion.div>
  );
}
