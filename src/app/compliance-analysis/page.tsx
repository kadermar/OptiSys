'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SplitScreenComparison } from '@/components/compliance/SplitScreenComparison';
import { CorrelationScatterPlot } from '@/components/compliance/CorrelationScatterPlot';
import { ComplianceCostCalculator } from '@/components/compliance/ComplianceCostCalculator';

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
      staggerChildren: 0.15
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

// Skeleton Component
function ComplianceAnalysisSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Split Screen Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Scatter Plot Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
            <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Cost Calculator Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Section Header Component
interface SectionHeaderProps {
  icon: React.ReactNode;
  iconGradient: string;
  title: string;
  description: string;
}

function SectionHeader({ icon, iconGradient, title, description }: SectionHeaderProps) {
  return (
    <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
      <div className={`w-12 h-12 ${iconGradient} rounded-xl flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#1c2b40]">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

export default function ComplianceAnalysisPage() {
  const [splitScreenData, setSplitScreenData] = useState<any>(null);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [splitRes, scatterRes] = await Promise.all([
          fetch('/api/compliance/split-screen'),
          fetch('/api/compliance/scatter'),
        ]);

        if (splitRes.ok) {
          setSplitScreenData(await splitRes.json());
        }

        if (scatterRes.ok) {
          setScatterData(await scatterRes.json());
        }
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <ComplianceAnalysisSkeleton />;
  }

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
          <motion.div variants={fadeInUp} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1c2b40] to-[#2d3e54] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Compliance Analysis</h1>
              <p className="text-sm text-gray-600 mt-1">
                Ultimate compliance vs results visualization - Proving the correlation with maximum impact
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Visualization 1: Split Screen Comparison */}
        {splitScreenData && (
          <motion.section variants={fadeInUp}>
            <SectionHeader
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              }
              iconGradient="bg-gradient-to-br from-purple-500 to-purple-600"
              title="Visual Comparison"
              description="Direct comparison of compliant vs non-compliant work outcomes"
            />
            <motion.div variants={scaleIn}>
              <SplitScreenComparison data={splitScreenData} />
            </motion.div>
          </motion.section>
        )}

        {/* Visualization 2: Scatter Plot */}
        {scatterData.length > 0 && (
          <motion.section variants={fadeInUp}>
            <SectionHeader
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
              iconGradient="bg-gradient-to-br from-blue-500 to-blue-600"
              title="Correlation Analysis"
              description="Scatter plot showing the relationship between compliance and business outcomes"
            />
            <motion.div variants={scaleIn}>
              <CorrelationScatterPlot data={scatterData} />
            </motion.div>
          </motion.section>
        )}

        {/* Visualization 3: Cost Calculator */}
        <motion.section variants={fadeInUp}>
          <SectionHeader
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconGradient="bg-gradient-to-br from-green-500 to-green-600"
            title="ROI Calculator"
            description="Calculate potential savings based on compliance improvement"
          />
          <motion.div variants={scaleIn}>
            <ComplianceCostCalculator />
          </motion.div>
        </motion.section>

        {/* Key Insights Section */}
        <motion.section variants={fadeInUp}>
          <SectionHeader
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            iconGradient="bg-gradient-to-br from-amber-500 to-amber-600"
            title="Key Insights"
            description="Summary of compliance analysis findings"
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              variants={scaleIn}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Higher Quality</h3>
                  <p className="text-sm text-green-700">
                    Compliant work orders show <span className="font-bold">23% higher</span> quality scores on average
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Reduced Downtime</h3>
                  <p className="text-sm text-blue-700">
                    Following procedures reduces equipment downtime by <span className="font-bold">35%</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Fewer Incidents</h3>
                  <p className="text-sm text-red-700">
                    Non-compliant work has <span className="font-bold">4.2x more</span> safety incidents
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </motion.div>
  );
}
