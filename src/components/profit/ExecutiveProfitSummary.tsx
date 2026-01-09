'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/costConstants';

interface BreakdownData {
  totalProfitImpact: number;
  potentialSavings: number;
  monthOverMonthTrend: number;
  complianceRate: number;
  workOrderCount: number;
  targetCompliance: number;
}

interface ExecutiveProfitSummaryProps {
  data: BreakdownData | null;
  aiHeadline?: string;
}

// Animated counter component
function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1500 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easeOut));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export function ExecutiveProfitSummary({ data, aiHeadline }: ExecutiveProfitSummaryProps) {
  if (!data) return null;

  const trendIsPositive = data.monthOverMonthTrend <= 0;

  return (
    <div className="space-y-6">
      {/* Hero Metric */}
      <motion.div
        variants={fadeInUp}
        className="bg-gradient-to-br from-[#1c2b40] to-[#2d3e54] rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-2">Total Profit Impact (YTD)</p>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <AnimatedCounter
                value={data.totalProfitImpact}
                prefix="$"
                duration={2000}
              />
            </div>
            <p className="text-blue-200 text-sm mt-2">
              Cost of non-compliance across {data.workOrderCount.toLocaleString()} work orders
            </p>
          </div>

          {/* AI Headline */}
          {aiHeadline && (
            <motion.div
              variants={scaleIn}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md border border-white/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-amber-300 font-semibold mb-1">AI INSIGHT</p>
                  <p className="text-sm text-white/90">{aiHeadline}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Current Cost Card */}
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Cost</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">
                {formatCurrency(data.totalProfitImpact)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Non-compliance impact</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Potential Savings Card */}
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Potential Savings</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(data.potentialSavings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">At {data.targetCompliance}% compliance</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Compliance Rate Card */}
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Compliance Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
                {data.complianceRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Target: {data.targetCompliance}%</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (data.complianceRate / data.targetCompliance) * 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* MoM Trend Card */}
        <motion.div
          variants={scaleIn}
          className={`bg-white rounded-xl p-5 shadow-lg border-l-4 ${trendIsPositive ? 'border-green-500' : 'border-amber-500'} hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">MoM Trend</p>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 ${trendIsPositive ? 'text-green-600' : 'text-amber-600'}`}>
                {data.monthOverMonthTrend > 0 ? '+' : ''}{data.monthOverMonthTrend}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {trendIsPositive ? 'Costs decreasing' : 'Costs increasing'}
              </p>
            </div>
            <div className={`w-10 h-10 ${trendIsPositive ? 'bg-green-100' : 'bg-amber-100'} rounded-lg flex items-center justify-center`}>
              <svg
                className={`w-5 h-5 ${trendIsPositive ? 'text-green-600' : 'text-amber-600'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {trendIsPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                )}
              </svg>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
