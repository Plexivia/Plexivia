import { motion } from 'motion/react';
import {
  Zap,
  Truck,
  ShieldCheck,
  CreditCard,
  LayoutTemplate,
  MessageSquare,
  Warehouse,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface WhitelabelFeaturesProps {
  onOpenDemoModal: () => void;
}

const features = [
  {
    icon: Zap,
    title: '1-Click Frictionless Mobile Checkout',
    badge: '3x Higher Conversions',
    description:
      'Designed specifically for impulsive social media and mobile buyers. Single-page checkout with district auto-complete, zero forced account registration, and zero checkout drop-off.',
    bullets: [
      'Sub-0.4s instant checkout render',
      'Auto district/thana address suggestions',
      'Dynamic delivery fee calculation',
      'Sticky 1-click buy button on mobile',
    ],
  },
  {
    icon: Truck,
    title: '1-Click Automated Courier API Hub',
    badge: 'Logistics Ready',
    description:
      'Direct API integrations with Bangladesh’s leading courier networks. Create consignments, generate thermal shipping labels, and track deliveries without ever leaving your admin panel.',
    bullets: [
      'Steadfast, Pathao & RedX 1-click booking',
      'Bulk consignment & thermal barcode label printing',
      'Live parcel tracking synced to customer SMS',
      'Automated return & exchange status tracking',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Fake Order & COD Return Prevention',
    badge: 'Cut Return Loss by 65%',
    description:
      'Protect your profits from fraudulent COD orders, competitor sabotage, and serial returners. Intelligent algorithms calculate delivery risk before you spend money on courier fees.',
    bullets: [
      'Customer courier delivery success score check',
      'Instant OTP SMS phone verification mode',
      'Duplicate order & spam IP blocker',
      'Blacklist manager across all stores',
    ],
  },
  {
    icon: CreditCard,
    title: 'Omnichannel Local & Global Payments',
    badge: '0% Middleman Fees',
    description:
      'Accept payments instantly with zero third-party surcharge cuts. Direct merchant gateway integration into your own bank account or mobile wallet.',
    bullets: [
      'Direct bKash PGW, Nagad & Rocket API',
      'SSLCommerz, Shurjopay & AamarPay',
      'International Visa, Mastercard & Stripe',
      'Cash on Delivery (COD) with advance partial payment option',
    ],
  },
  {
    icon: LayoutTemplate,
    title: 'High-Converting Sales Funnel Builder',
    badge: 'Product Landing Pages',
    description:
      'Create dedicated high-ticket product landing funnels with persuasive sales psychology, urgency timers, and sticky order buttons without needing a developer.',
    bullets: [
      'Drag-and-drop conversion blocks & video embeds',
      'Dynamic quantity bundle discounts (Buy 2 Get 1 Free)',
      'Countdown flash timers & stock urgency badges',
      'Direct product funnel checkout without cart friction',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Automated WhatsApp & SMS CRM Engine',
    badge: 'Recover 24% Abandoned Carts',
    description:
      'Automate your customer communication pipeline. Keep buyers informed at every stage to build trust and drastically reduce refused COD deliveries.',
    bullets: [
      'Instant order confirmation SMS with invoice link',
      'Automated WhatsApp cart abandonment recovery',
      'Out-for-delivery automated dispatch SMS alerts',
      'Post-delivery review collection & WhatsApp upsell',
    ],
  },
  {
    icon: Warehouse,
    title: 'Multi-Warehouse & Barcode Inventory',
    badge: 'Enterprise Scalable',
    description:
      'Keep tight control over your supply chain across multiple physical outlets, fulfillment warehouses, and online stock allocations.',
    bullets: [
      'Multi-branch / multi-warehouse stock allocations',
      'Instant PDF packaging slips & POS thermal printing',
      'Variant matrix (color, size, weight, SKU)',
      'Automated low-stock restock alerts',
    ],
  },
  {
    icon: BarChart3,
    title: 'Server-Side Meta CAPI & Real-Time Analytics',
    badge: '100% Tracking Accuracy',
    description:
      'Bypass iOS 14+ ad-blockers and browser privacy filters with direct server-side Conversion API (CAPI). Know your exact ROAS, net profit, and ad attribution.',
    bullets: [
      'Direct Server-side Facebook CAPI & Pixel',
      'Google Tag Manager & TikTok Pixel integration',
      'Net profit calculator (COGS vs Ads vs Courier Cost)',
      'Live visitor telemetry & geographic heatmaps',
    ],
  },
];

export default function WhitelabelFeatures({ onOpenDemoModal }: WhitelabelFeaturesProps) {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative overflow-hidden w-full">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#58C1C3]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#97CC6F]/10 border border-[#97CC6F]/25 text-[#97CC6F] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#97CC6F]" />
            <span>Engineered For Maximum GMV & Margin</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            Built From The Ground Up To{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              Convert, Automate & Scale
            </span>
          </h2>

          <p className="text-[#F5F7F7]/70 text-sm sm:text-base mt-4 leading-relaxed">
            Every feature is engineered to eliminate operational bottlenecks, reduce return rates (RTO), and turn social media ad traffic into profitable orders.
          </p>
        </div>

        {/* Features 8-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 4) * 0.1 }}
                className="bg-[#0F1E22]/90 border border-[#58C1C3]/20 hover:border-[#58C1C3]/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(88,193,195,0.1)] group relative overflow-hidden"
              >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#58C1C3]/5 via-transparent to-[#97CC6F]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#14262A] border border-[#58C1C3]/30 flex items-center justify-center text-[#58C1C3] group-hover:bg-[#58C1C3] group-hover:text-[#0C1618] transition-colors duration-300 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-[#58C1C3]">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-[#F5F7F7] mb-2 group-hover:text-[#58C1C3] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#F5F7F7]/65 leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {item.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-[11px] text-[#F5F7F7]/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#97CC6F] shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Link */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={onOpenDemoModal}
                    className="text-xs font-semibold text-[#58C1C3] group-hover:text-[#97CC6F] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>See live implementation</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
