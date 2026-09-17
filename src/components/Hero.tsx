import { motion } from 'motion/react';
import { ArrowRight, Code2, Sparkles, CheckCircle2, Zap, LayoutDashboard, Terminal, ExternalLink } from 'lucide-react';

interface HeroProps {
  onOpenEstimator: () => void;
}

export default function Hero({ onOpenEstimator }: HeroProps) {
  return (
    <section id="home" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-12 overflow-hidden bg-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 bg-gradient-to-t from-cyan-50/60 to-transparent pointer-events-none" />

      {/* Subtle Digital Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0284C7 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-xs font-semibold text-cyan-800 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-wide">Digital Development Agency</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 text-[11px] font-mono">plexivia.online</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6">
              Custom Digital Solutions for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600">
                Growing Businesses
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-8">
              We build modern, scalable, and high-performing websites and digital solutions designed around your business goals.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={onOpenEstimator}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-cyan-600 text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-cyan-700 transition-all duration-300 shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:shadow-cyan-600/35 cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-slate-800 text-sm font-bold rounded-full border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 cursor-pointer shadow-sm"
              >
                View Our Work
                <ExternalLink className="w-4 h-4 text-cyan-600" />
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 w-full">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Custom Architecture</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Zap className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>High Performance (99+)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 col-span-2 sm:col-span-1">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Modern UI/UX Design</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visuals - Isometric Digital Development Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200/40 via-emerald-200/30 to-transparent rounded-3xl blur-2xl transform -rotate-1 pointer-events-none" />

            {/* Modern App / Code / Dashboard Card */}
            <div className="relative bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-slate-300/60 overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">plexivia-app.tsx</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold">
                  Production Ready
                </span>
              </div>

              {/* Code Snippet */}
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-slate-200 mb-4 overflow-x-auto shadow-inner">
                <div className="text-cyan-300">
                  <span className="text-emerald-400">import</span> &#123; createDigitalDream &#125; <span className="text-emerald-400">from</span> <span className="text-slate-400">'@plexivia/core'</span>;
                </div>
                <div className="mt-1">
                  <span className="text-cyan-300">const</span> <span className="text-white font-bold">app</span> = <span className="text-emerald-400">await</span> createDigitalDream(&#123;
                </div>
                <div className="pl-4 text-slate-300">
                  client: <span className="text-emerald-300">'Global Enterprise'</span>,
                </div>
                <div className="pl-4 text-slate-300">
                  performance: <span className="text-cyan-300 font-bold">99.8</span>, <span className="text-slate-500">// Lighthouse</span>
                </div>
                <div className="pl-4 text-slate-300">
                  stack: [<span className="text-emerald-300">'React'</span>, <span className="text-emerald-300">'Next.js'</span>, <span className="text-emerald-300">'TypeScript'</span>],
                </div>
                <div className="pl-4 text-slate-300">
                  scalable: <span className="text-cyan-300">true</span>,
                </div>
                <div>&#125;);</div>
              </div>

              {/* Mini Analytics Visualizer */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium">Performance Score</span>
                    <span className="text-emerald-600 font-bold">100/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium">Client Satisfaction</span>
                    <span className="text-cyan-600 font-bold">100%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Tech Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-mono text-cyan-800 font-semibold flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-cyan-600" /> React / Next.js
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3 text-emerald-600" /> Modern UI/UX
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-semibold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-500" /> Clean Code
                </span>
              </div>
            </div>

            {/* Floating Live Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-3 sm:-right-5 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-[10px] font-mono">
                <div className="text-emerald-700 font-bold">80+ Websites</div>
                <div className="text-slate-500">Global Delivery</div>
              </div>
            </motion.div>

            {/* Floating Speed Badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-3 sm:-left-5 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-600" />
              <div className="text-[10px] font-mono">
                <div className="text-cyan-700 font-bold">Ultra Fast Speed</div>
                <div className="text-slate-500">SEO Ready</div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
