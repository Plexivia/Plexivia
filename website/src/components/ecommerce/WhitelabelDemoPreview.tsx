import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface WhitelabelDemoPreviewProps {
  onOpenDemoModal: () => void;
}

export default function WhitelabelDemoPreview({ onOpenDemoModal }: WhitelabelDemoPreviewProps) {
  const [activeTab, setActiveTab] = useState<'storefront' | 'admin' | 'funnel'>('storefront');

  const tabs = [
    {
      id: 'storefront',
      label: 'Ultra-Fast Storefront',
      icon: Store,
      badge: '0.4s Speed',
      description:
        'Customer-facing Next.js storefront engineered for 100% mobile perfection, frictionless 1-page checkout, and zero checkout abandonments.',
    },
    {
      id: 'admin',
      label: 'Admin & Courier Command Center',
      icon: Truck,
      badge: '1-Click Dispatch',
      description:
        'Central operations hub: manage orders, print Steadfast/Pathao thermal shipping labels in bulk, filter fake COD orders, and track courier cash collections.',
    },
    {
      id: 'funnel',
      label: 'Landing Funnels & Meta CAPI',
      icon: SlidersHorizontal,
      badge: '100% Ad Attribution',
      description:
        'Launch dedicated single-product marketing landing funnels with urgency timers, video reviews, and direct server-side Meta Conversion API (CAPI).',
    },
  ];

  return (
    <section id="demo" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative overflow-hidden w-full">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-[#58C1C3] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Walkthrough</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            Look Inside The{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              White-label Architecture
            </span>
          </h2>

          <p className="text-[#F5F7F7]/70 text-sm sm:text-base mt-4 leading-relaxed">
            Engineered with modern full-stack technologies (React, Next.js, Node.js, PostgreSQL). No bloated legacy PHP. No third-party lock-in.
          </p>

          {/* Interactive Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#58C1C3] text-[#0C1618] border-[#58C1C3] shadow-[0_0_25px_rgba(88,193,195,0.35)]'
                      : 'bg-[#0F1E22] text-[#F5F7F7]/80 border-white/10 hover:border-[#58C1C3]/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-[#0C1618]/20 text-[#0C1618]' : 'bg-white/10 text-[#58C1C3]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Showcase Window */}
        <div className="bg-[#0F1E22] border border-[#58C1C3]/20 rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {activeTab === 'storefront' && (
              <motion.div
                key="storefront"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded bg-[#58C1C3]/15 text-[#58C1C3] text-xs font-semibold">
                    Customer Experience (Front-End)
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Frictionless 1-Click Ordering That Multiplies Your Ad ROAS
                  </h3>
                  <p className="text-sm text-[#F5F7F7]/70 leading-relaxed">
                    Most customers in Bangladesh drop off when forced to go through 4-step Shopify checkouts or create passwords. Our native 1-page checkout renders instantly and lets the user order with just their name, mobile number, and address.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      'Auto-suggest for 64 districts and all thanas',
                      'Instant bKash PGW + Cash on Delivery selector',
                      'Sticky bottom buy bar on mobile devices',
                      'One-click order bumps (e.g. Add extra pair for ৳500)',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#F5F7F7]/85">
                        <CheckCircle className="w-4 h-4 text-[#97CC6F] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={onOpenDemoModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#58C1C3] text-[#0C1618] font-bold text-xs hover:bg-[#97CC6F] transition-colors cursor-pointer"
                    >
                      <span>Request Live Front-End Store URL</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#0C1618] border border-white/10 rounded-xl p-5 shadow-inner">
                  {/* Simulated Storefront View */}
                  <div className="bg-[#14262A] rounded-lg p-4 border border-white/5 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="font-bold text-white">LuxeAura Minimalist Watch</span>
                      <span className="text-[#97CC6F] font-bold text-sm">৳ 3,850</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-[#0C1618] rounded-lg border border-white/5 space-y-1.5">
                        <span className="text-[10px] text-[#F5F7F7]/60 block font-medium">Selected Color</span>
                        <div className="flex gap-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-900 border-2 border-[#58C1C3]" />
                          <span className="w-5 h-5 rounded-full bg-amber-700 border border-white/20" />
                          <span className="w-5 h-5 rounded-full bg-slate-300 border border-white/20" />
                        </div>
                      </div>
                      <div className="p-3 bg-[#0C1618] rounded-lg border border-white/5 space-y-1.5">
                        <span className="text-[10px] text-[#F5F7F7]/60 block font-medium">Order Bump Offer</span>
                        <span className="text-[11px] text-[#97CC6F] font-semibold block">
                          + Add Leather Strap for ৳ 450 (Save 40%)
                        </span>
                      </div>
                    </div>

                    {/* Quick checkout fields */}
                    <div className="p-3 bg-[#0C1618] rounded-lg border border-[#58C1C3]/30 space-y-2">
                      <div className="text-[11px] text-[#58C1C3] font-bold">Billing & Delivery Details</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                        <div className="bg-[#14262A] p-1.5 rounded">Name: Mehedi Hasan</div>
                        <div className="bg-[#14262A] p-1.5 rounded">Phone: 01823XXXXXX</div>
                      </div>
                      <div className="bg-[#14262A] p-1.5 rounded text-[11px] text-white/70">
                        Address: Mirpur DOHS, Dhaka (Delivery: ৳ 60 Inside Dhaka)
                      </div>
                      <div className="p-2 rounded bg-gradient-to-r from-[#97CC6F] to-[#58C1C3] text-[#0C1618] font-bold text-center">
                        ⚡ Place Order — Total: ৳ 3,910
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded bg-[#97CC6F]/15 text-[#97CC6F] text-xs font-semibold">
                    Operations & Logistics Hub
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    1-Click Courier Dispatch & Fake Order Prevention
                  </h3>
                  <p className="text-sm text-[#F5F7F7]/70 leading-relaxed">
                    Say goodbye to manual Excel entry or copy-pasting customer addresses into courier portals. Select 50 orders and book them with Steadfast or Pathao with a single click.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      'Steadfast, Pathao Courier & RedX native API integration',
                      'Automated thermal barcode shipping label generation',
                      'Customer courier success score check before dispatch',
                      'Automated SMS to customer with tracking link on dispatch',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#F5F7F7]/85">
                        <CheckCircle className="w-4 h-4 text-[#97CC6F] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={onOpenDemoModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#97CC6F] text-[#0C1618] font-bold text-xs hover:bg-[#58C1C3] transition-colors cursor-pointer"
                    >
                      <span>Explore Admin Portal Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#0C1618] border border-white/10 rounded-xl p-5 shadow-inner">
                  {/* Simulated Admin Dispatch Screen */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Order Dispatch Management</span>
                        <span className="px-2 py-0.5 bg-[#97CC6F]/20 text-[#97CC6F] rounded text-[10px] font-bold">1-Click Ready</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-[#14262A] text-[#58C1C3] rounded text-[10px] font-semibold border border-white/5">
                          Steadfast API: Connected
                        </span>
                        <span className="px-2 py-1 bg-[#14262A] text-[#97CC6F] rounded text-[10px] font-semibold border border-white/5">
                          Pathao: Connected
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#14262A] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Order #9021 • Nayeem Hossain</div>
                        <div className="text-[10px] text-[#F5F7F7]/60">Uttara, Dhaka • Cash on Delivery: ৳ 2,490</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          99% Delivery Score
                        </span>
                        <span className="px-2.5 py-1 bg-[#58C1C3] text-[#0C1618] font-bold rounded text-[10px]">
                          Book Steadfast
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#14262A] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Order #9022 • Fahim Rahman</div>
                        <div className="text-[10px] text-[#F5F7F7]/60">Chittagong Sadar • Cash on Delivery: ৳ 1,750</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                          Verify Phone (OTP)
                        </span>
                        <span className="px-2.5 py-1 bg-[#97CC6F] text-[#0C1618] font-bold rounded text-[10px]">
                          Book Pathao
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#14262A]/60 rounded-lg flex items-center justify-between text-[11px] text-[#F5F7F7]/70">
                      <span>Total Pending Dispatch: <strong>48 Parcels</strong></span>
                      <span className="text-[#58C1C3] font-semibold">Bulk Action: Print 48 Thermal Labels (PDF)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'funnel' && (
              <motion.div
                key="funnel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded bg-[#58C1C3]/15 text-[#58C1C3] text-xs font-semibold">
                    Marketing & Conversion Architecture
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Server-Side Meta CAPI & High-Converting Landing Funnels
                  </h3>
                  <p className="text-sm text-[#F5F7F7]/70 leading-relaxed">
                    Browser ad-blockers and iOS privacy updates make Facebook Pixel lose up to 40% of conversion events. Our engine uses Server-Side Meta CAPI with 9.8/10 Event Match Quality (EMQ) so your ads target the right buyers.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      '9.8/10 Event Match Quality on Facebook Conversion API',
                      'Real-time net margin & ROAS dashboard',
                      'Pre-built high-converting landing page layouts for winning products',
                      'Automated WhatsApp sequence for abandoned carts within 15 minutes',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#F5F7F7]/85">
                        <CheckCircle className="w-4 h-4 text-[#97CC6F] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={onOpenDemoModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#58C1C3] text-[#0C1618] font-bold text-xs hover:bg-[#97CC6F] transition-colors cursor-pointer"
                    >
                      <span>See Funnel Templates</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#0C1618] border border-white/10 rounded-xl p-5 shadow-inner">
                  {/* Simulated Telemetry & Ad Stats */}
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-[#14262A] rounded-lg border border-white/5">
                        <span className="text-[10px] text-white/50 block">Facebook CAPI Match</span>
                        <span className="text-base font-bold text-[#97CC6F]">9.8 / 10</span>
                        <span className="text-[9px] text-white/60 block">Server Synced</span>
                      </div>
                      <div className="p-2.5 bg-[#14262A] rounded-lg border border-white/5">
                        <span className="text-[10px] text-white/50 block">Blended ROAS</span>
                        <span className="text-base font-bold text-[#58C1C3]">4.82x</span>
                        <span className="text-[9px] text-white/60 block">Ad Spend: $1,200</span>
                      </div>
                      <div className="p-2.5 bg-[#14262A] rounded-lg border border-white/5">
                        <span className="text-[10px] text-white/50 block">Cart Recovery</span>
                        <span className="text-base font-bold text-emerald-400">24.6%</span>
                        <span className="text-[9px] text-white/60 block">Via WhatsApp Bot</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#14262A] rounded-lg border border-white/5 space-y-2">
                      <div className="flex justify-between text-[11px] font-semibold text-white">
                        <span>Campaign: Summer Flash Sale Funnel</span>
                        <span className="text-[#97CC6F]">Active</span>
                      </div>
                      <div className="text-[10px] text-[#F5F7F7]/70">
                        Funnel URL: <span className="font-mono text-[#58C1C3]">/offer/flash-shoes</span> • 3.8s Avg Dwell Time • 11.4% Conversion Rate
                      </div>
                      <div className="w-full bg-[#0C1618] h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] h-full w-[82%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
