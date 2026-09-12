import { motion } from 'motion/react';
import { Check, X, Sparkles, Shield, AlertTriangle, HelpCircle } from 'lucide-react';

interface WhitelabelComparisonProps {
  onOpenDemoModal: () => void;
}

const comparisonFeatures = [
  {
    feature: 'Transaction Platform Fee',
    whitelabel: '0% (Keep 100% of your profit)',
    shopify: '0.5% - 2.0% cut on every order',
    woocommerce: '0% (but expensive payment plugins)',
    highlight: true,
  },
  {
    feature: 'Average Mobile Page Load Speed',
    whitelabel: '< 0.4 seconds (Edge CDN + Next.js)',
    shopify: '1.8s - 3.2s (Bloated liquid apps)',
    woocommerce: '2.5s - 5.0s (Slow PHP/MySQL bottlenecks)',
    highlight: true,
  },
  {
    feature: '1-Click Express Checkout',
    whitelabel: 'Built-in single page with auto-district',
    shopify: 'Restricted (Shopify Plus required: $2,000/mo)',
    woocommerce: 'Requires 4-5 buggy third-party plugins',
    highlight: false,
  },
  {
    feature: 'Local Courier Auto-Booking (BD & Emerging)',
    whitelabel: 'Direct 1-Click Steadfast, Pathao, RedX API',
    shopify: 'Manual copy-paste or expensive bridge apps',
    woocommerce: 'Unstable plugins prone to breaking',
    highlight: true,
  },
  {
    feature: 'Fake COD Order & Return Shield',
    whitelabel: 'Built-in phone validation & fraud score',
    shopify: 'Costly third-party fraud apps',
    woocommerce: 'None (High return/RTO loss)',
    highlight: true,
  },
  {
    feature: 'Monthly App Subscription Costs',
    whitelabel: '$0 (All core sales apps built-in)',
    shopify: '$150 - $600/month recurring apps',
    woocommerce: '$50 - $200/month plugin licenses',
    highlight: true,
  },
  {
    feature: 'Brand White-labeling & Reselling',
    whitelabel: '100% Your Own Brand (Or resell to clients)',
    shopify: 'Locked to Shopify ecosystem',
    woocommerce: 'WordPress/WooCommerce branding',
    highlight: false,
  },
  {
    feature: 'Crash Resistance Under Flash Sales',
    whitelabel: 'Auto-scaling cloud edge (100,000+ concurrency)',
    shopify: 'High (Hosted by Shopify)',
    woocommerce: 'Crashes frequently on high traffic',
    highlight: false,
  },
];

export default function WhitelabelComparison({ onOpenDemoModal }: WhitelabelComparisonProps) {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative border-t border-[#58C1C3]/10 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-[#58C1C3] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Honest Architectural Comparison</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            Why Scaling Brands Are Ditching{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              Shopify & WooCommerce
            </span>
          </h2>
          
          <p className="text-[#F5F7F7]/70 text-sm sm:text-base mt-4 leading-relaxed">
            See how Plexivia White-label eliminates recurring SaaS overhead, transaction cuts, and fragile plugin stacks while giving you 100% platform autonomy.
          </p>
        </div>

        {/* Comparison Table / Card Container */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[760px] bg-[#0F1E22]/90 border border-[#58C1C3]/20 rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#14262A] border-b border-[#58C1C3]/20 p-5 text-sm font-semibold">
              <div className="col-span-4 text-[#F5F7F7]/80">Capability / Feature</div>
              <div className="col-span-3 text-center text-[#58C1C3] font-bold flex items-center justify-center gap-1.5 bg-[#58C1C3]/10 py-1 rounded-lg border border-[#58C1C3]/30">
                <Sparkles className="w-4 h-4" />
                <span>Plexivia Whitelabel</span>
              </div>
              <div className="col-span-2.5 text-center text-[#F5F7F7]/60">Shopify</div>
              <div className="col-span-2.5 text-center text-[#F5F7F7]/60">WooCommerce</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5 text-xs sm:text-sm">
              {comparisonFeatures.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 p-4 sm:p-5 items-center transition-colors ${
                    item.highlight ? 'bg-[#58C1C3]/[0.03]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Feature Name */}
                  <div className="col-span-4 font-medium text-[#F5F7F7] flex items-center gap-2">
                    {item.highlight && <span className="w-1.5 h-1.5 rounded-full bg-[#97CC6F]" />}
                    <span>{item.feature}</span>
                  </div>

                  {/* Plexivia Whitelabel Column */}
                  <div className="col-span-3 text-center px-3 py-2 rounded-lg bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-[#58C1C3] font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-[#97CC6F] shrink-0" />
                    <span className="text-xs sm:text-[13px]">{item.whitelabel}</span>
                  </div>

                  {/* Shopify Column */}
                  <div className="col-span-2.5 text-center px-2 text-[#F5F7F7]/60 flex items-center justify-center gap-1.5">
                    <X className="w-4 h-4 text-red-400 shrink-0 opacity-70" />
                    <span className="text-xs">{item.shopify}</span>
                  </div>

                  {/* WooCommerce Column */}
                  <div className="col-span-2.5 text-center px-2 text-[#F5F7F7]/60 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 opacity-70" />
                    <span className="text-xs">{item.woocommerce}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer CTA Bar */}
            <div className="bg-[#14262A]/90 p-5 border-t border-[#58C1C3]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#F5F7F7]/70 text-center sm:text-left">
                💡 <strong className="text-[#97CC6F]">Average Annual Merchant Savings:</strong> Scaling stores save between{' '}
                <strong className="text-white">$3,500 to $18,000+ USD</strong> every year by eliminating app fees & 2% transaction cuts.
              </div>
              <button
                onClick={onOpenDemoModal}
                className="px-5 py-2.5 rounded-xl bg-[#58C1C3] text-[#0C1618] font-bold text-xs hover:bg-[#97CC6F] transition-all cursor-pointer shadow-md shrink-0"
              >
                Request Migration & Demo →
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
