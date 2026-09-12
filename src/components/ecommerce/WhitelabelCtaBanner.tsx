import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';

interface WhitelabelCtaBannerProps {
  onOpenDemoModal: () => void;
}

export default function WhitelabelCtaBanner({ onOpenDemoModal }: WhitelabelCtaBannerProps) {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#0C1618] via-[#0F1E22] to-[#0C1618] relative border-t border-[#58C1C3]/10 overflow-hidden w-full">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-72 bg-gradient-to-r from-[#58C1C3]/15 via-[#97CC6F]/15 to-[#58C1C3]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center w-full">
        
        {/* Top pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/25 text-[#58C1C3] text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Your High-Converting Store Today</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F7F7] tracking-tight leading-tight">
          Ready To Stop Paying SaaS Taxes &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] via-[#85D9B0] to-[#97CC6F]">
            Own Your Platform?
          </span>
        </h2>

        {/* Sub-text */}
        <p className="text-base sm:text-lg text-[#F5F7F7]/75 mt-6 max-w-2xl mx-auto font-light leading-relaxed">
          Book a 15-minute live screen-share walkthrough with our lead eCommerce engineer. We will show you the exact live storefront, 1-click courier workflow, and how much you will save.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={onOpenDemoModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(88,193,195,0.4)] hover:shadow-[0_0_40px_rgba(151,204,111,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Live Demo & Free Scoping</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://wa.me/8801823110115?text=Hello%20Plexivia,%20I%20am%20interested%20in%20deploying%20the%20Ecommerce%20Whitelabel%20Platform.%20Can%20we%20discuss?"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#14262A] border border-[#58C1C3]/30 text-[#F5F7F7] font-semibold text-sm hover:border-[#58C1C3] hover:bg-[#58C1C3]/10 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#97CC6F]" />
            <span>Chat on WhatsApp (+880 1823-110115)</span>
          </a>
        </div>

        {/* Four Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-xs text-[#F5F7F7]/75">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#97CC6F]" />
            <span>0% Platform Commission</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#97CC6F]" />
            <span>Live in 48 - 72 Hours</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#97CC6F]" />
            <span>Free Store Data Migration</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#97CC6F]" />
            <span>100% White-label Guarantee</span>
          </div>
        </div>

      </div>
    </section>
  );
}
