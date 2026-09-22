import { motion } from 'motion/react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Building2, Layers } from 'lucide-react';

interface WhitelabelPricingProps {
  onOpenDemoModal: () => void;
}

const pricingTiers = [
  {
    name: 'Starter Turnkey Store',
    tagline: 'Ideal for single D2C brands wanting a 3x higher conversion rate',
    badge: 'Fast Launch',
    highlight: false,
    features: [
      '100% custom-branded Next.js storefront',
      'Ultra-fast 1-click express mobile checkout',
      'Steadfast & Pathao Courier API 1-click dispatch',
      'Direct bKash, Nagad & Cash on Delivery (COD)',
      'Basic fake order & spam phone number shield',
      'Product variant & inventory tracking',
      'Free migration of products & existing data',
      'Live deployment in 48-72 hours',
    ],
    cta: 'Book Starter Demo',
  },
  {
    name: 'Scale & Enterprise Engine',
    tagline: 'Engineered for high-volume merchants doing 500+ orders/month',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Everything in Starter Turnkey, plus:',
      'Multi-warehouse & multi-outlet inventory sync',
      'All courier APIs (Steadfast, Pathao, RedX, eCourier)',
      'Thermal barcode shipping label bulk generator (PDF)',
      'Advanced courier delivery score & fraud blacklist check',
      'Server-side Meta Conversion API (CAPI) 9.8+ EMQ',
      'Automated WhatsApp & SMS abandoned cart sequences',
      'Dedicated cloud server with auto-scaling protection',
      'Priority 24/7 tech support & dedicated engineer',
    ],
    cta: 'Get Enterprise Deployment',
  },
  {
    name: 'Agency Whitelabel Reseller',
    tagline: 'For marketing agencies who want to sell stores to their own clients',
    badge: 'Agency / Reseller',
    highlight: false,
    features: [
      '100% Whitelabel: ZERO Plexivia branding anywhere',
      'Your own agency logo, domain & client portal',
      'Multi-tenant deployment engine (spin up stores in minutes)',
      'Charge your own monthly SaaS or setup fees to clients',
      'Full source code access & custom database architecture',
      'White-label mobile app (Android/iOS) add-on ready',
      'Dedicated Plexivia engineering team for custom modules',
      'Wholesale agency partner discounts per deployed store',
    ],
    cta: 'Apply For Agency License',
  },
];

export default function WhitelabelPricing({ onOpenDemoModal }: WhitelabelPricingProps) {
  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0F1E22] relative border-t border-[#58C1C3]/10 overflow-hidden w-full">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#58C1C3]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-[#58C1C3] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Commercial Models</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            Deploy Under Your Own Brand.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              Zero Hidden Cuts.
            </span>
          </h2>

          <p className="text-[#F5F7F7]/70 text-sm sm:text-base mt-4 leading-relaxed">
            Whether you are launching your own flagship brand or looking to resell turnkey eCommerce systems to your agency clients, we have flexible deployment packages tailored to your scale.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                tier.highlight
                  ? 'bg-gradient-to-b from-[#14262A] to-[#0C1618] border-2 border-[#58C1C3] shadow-[0_20px_50px_rgba(88,193,195,0.2)] lg:-translate-y-2'
                  : 'bg-[#0C1618]/90 border border-[#58C1C3]/20 hover:border-[#58C1C3]/50'
              }`}
            >
              {/* Highlight Badge */}
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] text-xs font-extrabold uppercase tracking-wider shadow-lg">
                  {tier.badge}
                </div>
              )}

              <div>
                {/* Top info */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  {!tier.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#58C1C3]">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#F5F7F7]/65 mb-6 min-h-[36px]">
                  {tier.tagline}
                </p>

                {/* Price indicator */}
                <div className="p-4 rounded-xl bg-[#14262A]/60 border border-white/5 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      Custom Quote
                    </span>
                    <span className="text-xs text-[#97CC6F] font-semibold">/ 0% Rev Cut</span>
                  </div>
                  <span className="text-[11px] text-[#F5F7F7]/60 block mt-1">
                    Transparent one-time or structured licensing. No recurring per-order penalty.
                  </span>
                </div>

                {/* Feature checklist */}
                <div className="space-y-3 mb-8">
                  <div className="text-xs font-semibold text-[#58C1C3] uppercase tracking-wider">
                    Included Capabilities:
                  </div>
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#F5F7F7]/85">
                      <Check className="w-4 h-4 text-[#97CC6F] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={onOpenDemoModal}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] shadow-[0_0_20px_rgba(88,193,195,0.4)] hover:shadow-[0_0_30px_rgba(151,204,111,0.5)]'
                      : 'bg-[#14262A] text-[#F5F7F7] border border-[#58C1C3]/30 hover:border-[#58C1C3] hover:text-[#58C1C3]'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center text-[10px] text-white/40 mt-2">
                  1-on-1 consultation & custom proposal included
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom requirements callout */}
        <div className="mt-12 p-6 rounded-2xl bg-[#0C1618] border border-[#58C1C3]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#58C1C3]/10 flex items-center justify-center text-[#58C1C3] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Need a Multi-Vendor Marketplace or Custom Enterprise ERP Integration?</h4>
              <p className="text-xs text-[#F5F7F7]/60">Our senior engineering team can build bespoke modules, multi-currency wallets, or custom logistics bridges.</p>
            </div>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="px-5 py-2.5 rounded-xl bg-[#58C1C3]/20 border border-[#58C1C3]/40 text-[#58C1C3] hover:bg-[#58C1C3] hover:text-[#0C1618] text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Speak With Solution Architect
          </button>
        </div>

      </div>
    </section>
  );
}
