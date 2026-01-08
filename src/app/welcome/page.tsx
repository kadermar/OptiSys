'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Database,
  Bot,
  Smartphone,
  Server,
  BarChart3,
  LayoutDashboard,
  RefreshCcw,
  ArrowRight,
  Play,
  Compass,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useTour } from '@/components/tour';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const layers = [
  { id: 1, name: 'Knowledge Base', icon: Database, description: 'Single source of truth for all procedures and governance documents', color: '#3B82F6' },
  { id: 2, name: 'AI Copilot', icon: Bot, description: 'Natural language interface for queries and insights', color: '#8B5CF6' },
  { id: 3, name: 'Field Execution', icon: Smartphone, description: 'Digital checklists and work order management', color: '#10B981' },
  { id: 4, name: 'Data Hub', icon: Server, description: 'Central repository for all operational data', color: '#F59E0B' },
  { id: 5, name: 'Analytics Engine', icon: BarChart3, description: 'Correlation analysis and predictive insights', color: '#EF4444' },
  { id: 6, name: 'Dashboards', icon: LayoutDashboard, description: 'Executive oversight and KPI monitoring', color: '#EC4899' },
  { id: 7, name: 'Feedback Loop', icon: RefreshCcw, description: 'Continuous improvement cycle', color: '#06B6D4' },
];

const features = [
  {
    icon: TrendingUp,
    title: 'Real-time Analytics',
    description: 'Track compliance, quality scores, and operational metrics as they happen',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Shield,
    title: 'Compliance Monitoring',
    description: 'Ensure adherence to procedures with automated tracking and alerts',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Zap,
    title: 'Predictive Insights',
    description: 'AI-powered forecasting to prevent issues before they occur',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Sparkles,
    title: 'Continuous Improvement',
    description: 'Data-driven feedback loop for measurable process enhancement',
    color: 'from-purple-500 to-violet-600',
  },
];

// Floating particle component
function FloatingParticle({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-[#ff0000]/20 to-[#ff0000]/5"
      style={{ width: size, height: size, left, top }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const { startTour } = useTour();

  const handleStartTour = () => {
    startTour();
  };

  const handleExplore = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen bg-[#0B1121] text-white overflow-auto">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1121] via-[#111827] to-[#1c2b40]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#ff0000]/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        <FloatingParticle delay={0} size={8} left="10%" top="20%" />
        <FloatingParticle delay={1} size={6} left="80%" top="15%" />
        <FloatingParticle delay={2} size={10} left="70%" top="60%" />
        <FloatingParticle delay={3} size={5} left="20%" top="70%" />
        <FloatingParticle delay={4} size={7} left="50%" top="80%" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center mb-16 lg:mb-20"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0000] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff0000]"></span>
            </span>
            <span className="px-4 py-1.5 bg-[#ff0000]/10 border border-[#ff0000]/20 rounded-full text-[#ff0000] font-medium tracking-wider uppercase text-xs">
              Proof of Concept
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0000] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff0000]"></span>
            </span>
          </motion.div>

          {/* Logo/Title */}
          <motion.div variants={fadeInUp} className="mb-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Opti</span>
              <span className="bg-gradient-to-r from-[#ff0000] to-[#ff4444] bg-clip-text text-transparent">Sys</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeInUp} className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-300 mb-6">
            Operational Intelligence Platform
          </motion.p>

          {/* Description */}
          <motion.p variants={fadeInUp} className="text-gray-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-10">
            Demonstrating how a management system can be digitally linked to real operational
            behavior to assess effectiveness and provide a measurable, data-driven feedback
            loop for continuous improvement.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartTour}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-xl font-bold text-lg transition-all shadow-xl shadow-red-500/25 hover:shadow-red-500/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff2222] to-[#ff0000] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Guided Tour</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExplore}
              className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm rounded-xl font-bold text-lg transition-all"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              whileHover={{ y: -5 }}
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-white/[0.05] hover:border-white/10 p-6 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-[#ff0000] transition-colors">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-6 sm:p-8 lg:p-10 mb-12 overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff0000]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff0000]/10 rounded-full mb-4">
                <span className="w-2 h-2 bg-[#ff0000] rounded-full" />
                <span className="text-[#ff0000] font-semibold text-sm">System Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">7-Layer Data Flow</h2>
              <p className="text-gray-400 mt-2 max-w-2xl mx-auto">From governance to execution to insights — a complete operational intelligence cycle</p>
            </div>

            {/* Desktop Architecture */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between gap-2">
                {layers.map((layer, index) => (
                  <div key={layer.id} className="relative flex-1">
                    {/* Connection Line */}
                    {index < layers.length - 1 && (
                      <div className="absolute top-1/2 -right-1 w-4 h-0.5 bg-gradient-to-r from-white/20 to-white/5 transform -translate-y-1/2 z-0" />
                    )}

                    {/* Layer Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative z-10 flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] hover:border-white/20 cursor-pointer transition-all"
                      style={{
                        boxShadow: `0 8px 32px ${layer.color}15`,
                      }}
                    >
                      <motion.div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 relative"
                        style={{ backgroundColor: `${layer.color}15` }}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <layer.icon className="w-7 h-7" style={{ color: layer.color }} />
                        <div
                          className="absolute inset-0 rounded-xl opacity-50"
                          style={{ boxShadow: `inset 0 0 20px ${layer.color}30` }}
                        />
                      </motion.div>
                      <span className="text-xs font-semibold text-center leading-tight text-white">{layer.name}</span>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Feedback Loop Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="flex justify-center mt-8"
              >
                <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-full border border-white/[0.08]">
                  <RefreshCcw className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Continuous feedback loop from insights back to procedures</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
              </motion.div>
            </div>

            {/* Mobile/Tablet Architecture */}
            <div className="lg:hidden">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {layers.map((layer, index) => (
                  <motion.div
                    key={layer.id}
                    variants={scaleIn}
                    className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08]"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${layer.color}15` }}
                    >
                      <layer.icon className="w-6 h-6" style={{ color: layer.color }} />
                    </div>
                    <span className="text-xs font-semibold text-center mb-1">{layer.name}</span>
                    <span className="text-[10px] text-gray-500 text-center leading-tight">{layer.description}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Connect', desc: 'Link governance documents to operational procedures' },
              { step: '02', title: 'Execute', desc: 'Capture real-time data through digital checklists' },
              { step: '03', title: 'Analyze', desc: 'Correlate compliance with business outcomes' },
              { step: '04', title: 'Improve', desc: 'Drive continuous improvement with data insights' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="relative bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.05] hover:border-[#ff0000]/30 p-6 transition-all group"
              >
                <span className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-red-500/20">
                  {item.step}
                </span>
                <h3 className="font-bold text-lg mb-2 mt-2 group-hover:text-[#ff0000] transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-8 border-t border-white/[0.05]"
        >
          <div className="flex items-center justify-center gap-3 text-gray-500 text-sm">
            <div className="w-1.5 h-1.5 bg-[#ff0000] rounded-full" />
            <span>OptiSys — Management System Performance Intelligence</span>
            <div className="w-1.5 h-1.5 bg-[#ff0000] rounded-full" />
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
