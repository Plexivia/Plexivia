import { motion } from 'motion/react';
import { CheckCircle2, Award, Zap, Users, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onOpenEstimator: () => void;
}

export default function AboutSection({ onOpenEstimator }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative border-t border-[#58C1C3]/10">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#58C1C3]/5 rounded-full blur-[140px] pointer-events-none" />

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
            <div className="relative bg-[#0F1E22] border border-[#58C1C3]/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              
              {/* Corner Brand Gradient Ribbon */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#58C1C3]">
                    Agency DNA
                  </span>
                  <h3 className="text-xl font-bold text-[#F5F7F7] mt-0.5">
                    The Plexivia Standard
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#97CC6F] to-[#58C1C3] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-[#0C1618] rounded-[10px] flex items-center justify-center text-[#58C1C3] font-mono font-bold text-xs">
                    PX
                  </div>
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0C1618] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#58C1C3]/15 text-[#58C1C3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F7F7]">Speed & Conversion First</h4>
                    <p className="text-xs text-[#F5F7F7]/60 mt-1">
                      Every millisecond counts. We optimize assets, routing, and database queries for 99+ Core Web Vitals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0C1618] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#97CC6F]/15 text-[#97CC6F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F7F7]">Bespoke Software Architecture</h4>
                    <p className="text-xs text-[#F5F7F7]/60 mt-1">
                      No generic templates. Every line of code and interactive system is tailored specifically to your business logic.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0C1618] border border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#58C1C3]/15 text-[#58C1C3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F7F7]">Dedicated Partnership</h4>
                    <p className="text-xs text-[#F5F7F7]/60 mt-1">
                      From Dhaka to international clients across the US, UK, and Europe, we provide 24/7 transparent communication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tagline footer badge */}
              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <span className="text-xs font-mono text-[#97CC6F] tracking-wide">
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
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#58C1C3] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#97CC6F]" />
              About Plexivia
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight leading-[1.15] mb-6">
              Crafting Digital Experiences That Support{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
                Real Business Growth
              </span>
            </h2>

            {/* Official Agency Copy */}
            <p className="text-base sm:text-lg text-[#F5F7F7]/80 leading-relaxed mb-6">
              Plexivia is a digital development agency focused on helping businesses build a stronger online presence. We combine custom development, robust software engineering, performance optimization, and scalable technologies to create digital experiences that support real business growth.
            </p>

            <p className="text-sm sm:text-base text-[#F5F7F7]/60 leading-relaxed mb-8">
              Whether you are an ambitious business needing custom software, an enterprise deploying an ERP solution, or an established retailer scaling on WordPress & Shopify, we build with precision, care, and future-proof craftsmanship.
            </p>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#0F1E22] border border-[#58C1C3]/20 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#58C1C3]">80+</div>
                <div className="text-[11px] font-mono text-[#F5F7F7]/60 mt-0.5">Websites Delivered</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0F1E22] border border-[#97CC6F]/20 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#97CC6F]">4+</div>
                <div className="text-[11px] font-mono text-[#F5F7F7]/60 mt-0.5">Years Experience</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0F1E22] border border-[#58C1C3]/20 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#58C1C3]">100%</div>
                <div className="text-[11px] font-mono text-[#F5F7F7]/60 mt-0.5">Client Satisfaction</div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onOpenEstimator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#58C1C3] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:bg-[#97CC6F] transition-all cursor-pointer shadow-[0_0_20px_rgba(88,193,195,0.3)]"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/10 text-[#F5F7F7]/80 hover:text-white hover:border-[#58C1C3]/40 text-xs font-semibold transition-colors"
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
