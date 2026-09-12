import { motion } from 'motion/react';
import { ArrowRight, Code2, Sparkles, CheckCircle2, Zap, Database, Terminal, ExternalLink } from 'lucide-react';

interface HeroProps {
  onOpenEstimator: () => void;
}

export default function Hero({ onOpenEstimator }: HeroProps) {
  return (
    <section id="home" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-12 overflow-hidden w-full">
      {/* Background Ambient Glows adhering strictly to brand cyan #58C1C3 and green #97CC6F */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#58C1C3]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-[#97CC6F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 bg-gradient-to-t from-[#58C1C3]/5 to-transparent pointer-events-none" />

      {/* Subtle Digital Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #58C1C3 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/25 text-xs font-semibold text-[#58C1C3] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#97CC6F] animate-pulse" />
              <span className="tracking-wide">Digital Development Agency</span>
              <span className="text-[#F5F7F7]/30">|</span>
              <span className="text-[#F5F7F7]/70 text-[11px] font-mono">plexivia.online</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-extrabold text-[#F5F7F7] tracking-tight leading-[1.08] mb-6">
              Custom Digital Solutions for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] via-[#75C79E] to-[#97CC6F]">
                Growing Businesses
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#F5F7F7]/75 max-w-xl leading-relaxed mb-8">
              We build modern, scalable, and high-performing websites and digital solutions designed around your business goals.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={onOpenEstimator}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#58C1C3] text-[#0C1618] text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#97CC6F] transition-all duration-300 shadow-[0_0_30px_rgba(88,193,195,0.35)] hover:shadow-[0_0_35px_rgba(151,204,111,0.45)] cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#0C1618] text-[#F5F7F7] text-sm font-semibold rounded-full border border-[#58C1C3]/30 hover:border-[#58C1C3] hover:bg-[#58C1C3]/10 transition-all duration-300 cursor-pointer"
              >
                View Our Work
                <ExternalLink className="w-4 h-4 text-[#58C1C3]" />
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-[#58C1C3]/15 w-full">
              <div className="flex items-center gap-2 text-xs text-[#F5F7F7]/80">
                <CheckCircle2 className="w-4 h-4 text-[#97CC6F] flex-shrink-0" />
                <span>Custom Architecture</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F5F7F7]/80">
                <Zap className="w-4 h-4 text-[#58C1C3] flex-shrink-0" />
                <span>High Performance (99+)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F5F7F7]/80 col-span-2 sm:col-span-1">
                <Sparkles className="w-4 h-4 text-[#97CC6F] flex-shrink-0" />
                <span>Enterprise ERP & Software</span>
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
            <div className="absolute inset-0 bg-gradient-to-tr from-[#58C1C3]/20 via-[#97CC6F]/15 to-transparent rounded-3xl blur-2xl transform -rotate-1 pointer-events-none" />

            {/* Futuristic App / Code / Dashboard Card */}
            <div className="relative bg-[#0F1E22] border border-[#58C1C3]/30 rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(88,193,195,0.15)] overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#97CC6F]" />
                  <span className="text-[11px] font-mono text-[#F5F7F7]/40 ml-2">plexivia-app.tsx</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#58C1C3]/15 text-[#58C1C3] border border-[#58C1C3]/30">
                  Production Ready
                </span>
              </div>

              {/* Code Snippet & Architecture Preview */}
              <div className="bg-[#0C1618] rounded-xl p-4 border border-[#58C1C3]/15 font-mono text-[11px] sm:text-xs leading-relaxed text-[#F5F7F7]/80 mb-4 overflow-x-auto">
                <div className="text-[#58C1C3]">
                  <span className="text-[#97CC6F]">import</span> &#123; createDigitalDream &#125; <span className="text-[#97CC6F]">from</span> <span className="text-[#F5F7F7]/60">'@plexivia/core'</span>;
                </div>
                <div className="mt-1">
                  <span className="text-[#58C1C3]">const</span> <span className="text-[#F5F7F7]">app</span> = <span className="text-[#97CC6F]">await</span> createDigitalDream(&#123;
                </div>
                <div className="pl-4 text-[#F5F7F7]/70">
                  client: <span className="text-[#97CC6F]">'Global Enterprise'</span>,
                </div>
                <div className="pl-4 text-[#F5F7F7]/70">
                  performance: <span className="text-[#58C1C3]">99.8</span>, <span className="text-[#F5F7F7]/40">// Lighthouse</span>
                </div>
                <div className="pl-4 text-[#F5F7F7]/70">
                  stack: [<span className="text-[#97CC6F]">'React'</span>, <span className="text-[#97CC6F]">'Next.js'</span>, <span className="text-[#97CC6F]">'TypeScript'</span>],
                </div>
                <div className="pl-4 text-[#F5F7F7]/70">
                  scalable: <span className="text-[#58C1C3]">true</span>,
                </div>
                <div>&#125;);</div>
              </div>

              {/* Mini Interactive Analytics Visualizer */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0C1618]/90 border border-white/5 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#F5F7F7]/60 mb-1">
                    <span>Performance Score</span>
                    <span className="text-[#97CC6F] font-bold">100/100</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]"
                    />
                  </div>
                </div>

                <div className="bg-[#0C1618]/90 border border-white/5 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-[#F5F7F7]/60 mb-1">
                    <span>Client Satisfaction</span>
                    <span className="text-[#58C1C3] font-bold">100%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-[#97CC6F] to-[#58C1C3]"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Tech Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/30 text-[10px] font-mono text-[#58C1C3] flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> React / Next.js
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#97CC6F]/10 border border-[#97CC6F]/30 text-[10px] font-mono text-[#97CC6F] flex items-center gap-1">
                  <Database className="w-3 h-3" /> ERP & Software
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#F5F7F7]/70 flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Clean Code
                </span>
              </div>
            </div>

            {/* Floating Live Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-1 sm:-right-5 bg-[#0C1618] border border-[#97CC6F]/40 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex items-center gap-2 max-w-[calc(100%-1rem)]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#97CC6F] animate-ping" />
              <div className="text-[10px] font-mono">
                <div className="text-[#97CC6F] font-bold">80+ Websites</div>
                <div className="text-[#F5F7F7]/50">Global Delivery</div>
              </div>
            </motion.div>

            {/* Floating Speed Badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-1 sm:-left-5 bg-[#0C1618] border border-[#58C1C3]/40 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex items-center gap-2 max-w-[calc(100%-1rem)]"
            >
              <Zap className="w-4 h-4 text-[#58C1C3]" />
              <div className="text-[10px] font-mono">
                <div className="text-[#58C1C3] font-bold">Ultra Fast Speed</div>
                <div className="text-[#F5F7F7]/50">SEO Ready</div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
