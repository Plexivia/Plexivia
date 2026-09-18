import { motion } from 'motion/react';
import { CheckCircle2, Award, Zap, Users, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onOpenEstimator: () => void;
}

export default function AboutSection({ onOpenEstimator }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-slate-50/60 relative border-t border-slate-200">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Pillars Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60">
              
              {/* Corner Brand Gradient Ribbon */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-700 font-bold">
                    Agency DNA
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    The Plexivia Standard
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-xs">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-cyan-800 font-mono font-bold text-xs">
                    PX
                  </div>
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Speed & Conversion First</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Every millisecond counts. We optimize assets, routing, and database queries for 99+ Core Web Vitals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Bespoke UI/UX Architecture</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      No generic templates. Every visual asset and interactive component is tailored specifically to your audience.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Dedicated Partnership</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      From Dhaka to international clients across the US, UK, and Europe, we provide 24/7 transparent communication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tagline footer badge */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <span className="text-xs font-mono text-emerald-700 font-semibold tracking-wide">
                  “Your Vision. Our Development.”
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Narrative & Mission */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-800 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              About Plexivia
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Crafting Digital Experiences That Support{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">
                Real Business Growth
              </span>
            </h2>

            {/* Official Agency Copy */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
              Plexivia is a digital development agency focused on helping businesses build a stronger online presence. We combine modern UI/UX design, custom development, performance optimization, and scalable technologies to create digital experiences that support real business growth.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
              Whether you are an ambitious startup needing an MVP, an established retailer migrating to a headless Shopify experience, or an enterprise revamping its web application stack, we build with precision, care, and future-proof craftsmanship.
            </p>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-cyan-700">80+</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5 font-medium">Websites Delivered</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">4+</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5 font-medium">Years Experience</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-cyan-700">100%</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5 font-medium">Client Satisfaction</div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onOpenEstimator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-cyan-700 transition-all cursor-pointer shadow-md shadow-cyan-600/25"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:text-cyan-700 hover:border-cyan-400 text-xs font-bold transition-colors shadow-xs"
              >
                Explore Consultation Options
              </a>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
