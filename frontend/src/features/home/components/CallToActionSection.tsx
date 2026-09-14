import { motion } from 'framer-motion';
import { Zap, BookOpen } from 'lucide-react';

export function CallToActionSection() {
  return (
    <section className="py-28 border-t border-brand-border relative z-10 overflow-hidden">
      {/* Ambient subtle background grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-card border border-brand-border text-xs font-mono text-brand-muted mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-emerald"></span>
          <span>PRODUCTION GRADE RESILIENCY</span>
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
          Ship with confidence.
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Deploy your next application with infrastructure that watches itself, diagnoses incidents, and recovers before downtime strikes.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <motion.a
            href="#developer-experience"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="light-sweep-btn bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.18)] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <Zap className="w-4 h-4 text-black fill-black" />
            <span>Deploy a Project</span>
          </motion.a>

          <motion.a
            href="#pipeline"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-brand-card hover:bg-brand-elevated text-white border border-brand-border hover:border-brand-border-hover font-medium text-sm px-6 py-3.5 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <BookOpen className="w-4 h-4 text-brand-muted" />
            <span>View Pipeline Specs</span>
          </motion.a>
        </div>

        {/* Feature Guarantees */}
        <div className="mt-12 text-xs font-mono text-brand-muted flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span>Zero credit card required</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span>Automatic SSL &amp; Anycast Mesh</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span>Continuous Health Watchdogs</span>
        </div>

      </div>
    </section>
  );
}
