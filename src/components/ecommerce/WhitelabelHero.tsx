import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  CreditCard,
  Layers,
  CheckCircle2,
  TrendingUp,
  Package,
  Clock,
  PhoneCall,
} from 'lucide-react';

interface WhitelabelHeroProps {
  onOpenDemoModal: () => void;
}

export default function WhitelabelHero({ onOpenDemoModal }: WhitelabelHeroProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'storefront' | 'admin'>('storefront');

  const scrollToCalculator = () => {
    const el = document.getElementById('roi-calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-12 overflow-hidden w-full">
      {/* Background Gradients & Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#58C1C3]/10 via-[#97CC6F]/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -top-24 right-10 w-80 h-80 bg-[#58C1C3]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Sales Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/25 text-[#58C1C3] text-xs font-semibold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(88,193,195,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#97CC6F] animate-pulse" />
              <span>Turnkey Whitelabel eCommerce Platform</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F7F7] tracking-tight leading-[1.12]"
            >
              Own Your eCommerce Engine.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] via-[#85D9B0] to-[#97CC6F]">
                0% Transaction Cuts.
              </span>{' '}
              100% White-Labeled.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#F5F7F7]/75 mt-6 leading-relaxed max-w-2xl font-light"
            >
              Stop losing <strong className="text-[#F5F7F7] font-semibold">2% of your revenue</strong> and thousands of dollars monthly to Shopify app subscriptions or fragile WordPress plugins. Launch a lightning-fast, custom-branded eCommerce platform with built-in <strong className="text-[#58C1C3] font-medium">1-click checkout</strong>, <strong className="text-[#97CC6F] font-medium">automated courier API dispatch</strong>, and <strong className="text-[#F5F7F7] font-medium">fake order return protection</strong>.
            </motion.p>

            {/* Trust Pills / Highlight Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-2.5 sm:gap-3 my-7"
            >
              {[
                { icon: Zap, label: '0.4s Fast Checkout' },
                { icon: Truck, label: 'Steadfast & Pathao 1-Click API' },
                { icon: CreditCard, label: 'bKash, Nagad & Stripe Ready' },
                { icon: ShieldCheck, label: 'Fake Order / RTO Shield' },
                { icon: Layers, label: 'Reseller & Agency Ready' },
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1E22] border border-[#58C1C3]/20 text-[#F5F7F7]/85 text-xs font-medium"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#58C1C3]" />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Dual CTAs & Live Direct Consult */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={onOpenDemoModal}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(88,193,195,0.4)] hover:shadow-[0_0_40px_rgba(151,204,111,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book a Live Demo & Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToCalculator}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0F1E22] border border-[#58C1C3]/30 text-[#F5F7F7] font-semibold text-sm hover:border-[#58C1C3] hover:bg-[#58C1C3]/10 transition-all duration-300 cursor-pointer"
              >
                <span>Calculate Your Cost Savings</span>
              </button>
            </motion.div>

            {/* Direct WhatsApp Callout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-5 flex items-center gap-3 text-xs text-[#F5F7F7]/60"
            >
              <div className="flex items-center gap-1.5 text-[#97CC6F]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Live in 48-72 Hours</span>
              </div>
              <span className="text-white/20">•</span>
              <a
                href="https://wa.me/8801823110115?text=Hello%20Plexivia,%20I%20want%20to%20learn%20more%20about%20your%20Ecommerce%20Whitelabel%20Platform."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#58C1C3] hover:underline font-medium"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp: +880 1823-110115</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Storefront & Admin Mockup */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#0F1E22]/95 border border-[#58C1C3]/25 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(88,193,195,0.1)] relative overflow-hidden backdrop-blur-xl"
            >
              {/* Tab Switcher */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[11px] text-[#F5F7F7]/50 font-mono ml-2">whitelabel-demo.store</span>
                </div>
                
                <div className="flex bg-[#0C1618] p-0.5 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setActivePreviewTab('storefront')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                      activePreviewTab === 'storefront'
                        ? 'bg-[#58C1C3] text-[#0C1618] font-bold shadow-sm'
                        : 'text-[#F5F7F7]/70 hover:text-white'
                    }`}
                  >
                    1-Click Storefront
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('admin')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                      activePreviewTab === 'admin'
                        ? 'bg-[#58C1C3] text-[#0C1618] font-bold shadow-sm'
                        : 'text-[#F5F7F7]/70 hover:text-white'
                    }`}
                  >
                    Admin Engine
                  </button>
                </div>
              </div>

              {/* Tab Content 1: Storefront Fast Checkout Mockup */}
              {activePreviewTab === 'storefront' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 text-xs"
                >
                  {/* Product Card Header */}
                  <div className="bg-[#14262A] p-3 rounded-xl border border-[#58C1C3]/15 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#58C1C3]/30 to-[#97CC6F]/30 flex items-center justify-center font-bold text-[#58C1C3] text-lg shrink-0">
                      👟
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold truncate">AeroFlex Ultra Running Shoes</h4>
                        <span className="text-[#97CC6F] font-bold text-sm">৳ 2,450</span>
                      </div>
                      <p className="text-[11px] text-[#F5F7F7]/60 mt-0.5">Size: 42 • Color: Jet Black</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#97CC6F]/20 text-[#97CC6F] rounded font-medium">In Stock</span>
                        <span className="text-[10px] text-[#58C1C3]">🔥 14 people ordering now</span>
                      </div>
                    </div>
                  </div>

                  {/* High-Converting 1-Page Express Checkout Form */}
                  <div className="bg-[#0C1618] p-3.5 rounded-xl border border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#58C1C3]">
                      <span>⚡ Express 1-Page Checkout</span>
                      <span className="text-[10px] text-white/50">No login required</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#14262A] px-2.5 py-2 rounded-lg border border-white/5 text-[11px] text-[#F5F7F7]/80">
                        Tanvir Ahmed
                      </div>
                      <div className="bg-[#14262A] px-2.5 py-2 rounded-lg border border-white/5 text-[11px] text-[#F5F7F7]/80">
                        017XXXXXXXX
                      </div>
                    </div>

                    <div className="bg-[#14262A] px-2.5 py-2 rounded-lg border border-white/5 text-[11px] text-[#F5F7F7]/80 flex justify-between items-center">
                      <span>House 42, Road 7, Banani, Dhaka</span>
                      <span className="text-[10px] text-[#97CC6F]">Auto District</span>
                    </div>

                    {/* Payment Selector */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-lg bg-[#58C1C3]/15 border border-[#58C1C3] flex items-center justify-between">
                        <span className="font-semibold text-[#58C1C3] text-[11px]">Cash on Delivery</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#58C1C3]" />
                      </div>
                      <div className="p-2 rounded-lg bg-[#14262A] border border-white/10 flex items-center justify-between text-[#F5F7F7]/70">
                        <span className="text-[11px]">bKash / Nagad Instant</span>
                        <span className="text-[9px] px-1 bg-[#97CC6F]/20 text-[#97CC6F] rounded">5% OFF</span>
                      </div>
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={onOpenDemoModal}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#97CC6F] to-[#58C1C3] text-[#0C1618] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(151,204,111,0.3)] hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Confirm Order — ৳ 2,510 (With Shipping)</span>
                    </button>
                    
                    <p className="text-center text-[10px] text-[#F5F7F7]/50 pt-0.5">
                      🔒 256-bit Encrypted • 3x Higher Conversion Rate Than Shopify
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Tab Content 2: Admin Dashboard Mockup */}
              {activePreviewTab === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 text-xs"
                >
                  {/* Telemetry Stats Bar */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#14262A] p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-[#F5F7F7]/60 flex items-center justify-between">
                        <span>Today's Sales</span>
                        <TrendingUp className="w-3 h-3 text-[#97CC6F]" />
                      </div>
                      <div className="text-sm font-bold text-white mt-1">৳ 148,900</div>
                      <span className="text-[9px] text-[#97CC6F] font-semibold">+34% vs yesterday</span>
                    </div>

                    <div className="bg-[#14262A] p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-[#F5F7F7]/60 flex items-center justify-between">
                        <span>Orders</span>
                        <Package className="w-3 h-3 text-[#58C1C3]" />
                      </div>
                      <div className="text-sm font-bold text-white mt-1">84 Orders</div>
                      <span className="text-[9px] text-[#58C1C3] font-semibold">0% platform cuts</span>
                    </div>

                    <div className="bg-[#14262A] p-2.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-[#F5F7F7]/60 flex items-center justify-between">
                        <span>Fake Order Shield</span>
                        <ShieldCheck className="w-3 h-3 text-[#97CC6F]" />
                      </div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">98.4% Safe</div>
                      <span className="text-[9px] text-[#F5F7F7]/60">11 Fake COD Blocked</span>
                    </div>
                  </div>

                  {/* Real-Time Dispatch Stream */}
                  <div className="bg-[#0C1618] p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white/90">
                      <span>Live Order Queue & Courier Auto-Dispatch</span>
                      <span className="text-[10px] text-[#97CC6F] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#97CC6F] animate-ping" />
                        Live
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { id: '#PLX-9481', customer: 'Rakibul Hasan', amount: '৳ 3,200', courier: 'Steadfast', status: 'Booked & Label Ready', color: 'text-emerald-400' },
                        { id: '#PLX-9480', customer: 'Sabbir Ahmed', amount: '৳ 1,850', courier: 'Pathao Courier', status: 'Consignment Created', color: 'text-[#58C1C3]' },
                        { id: '#PLX-9479', customer: 'Farzana Akter', amount: '৳ 4,100', courier: 'RedX Express', status: 'Dispatched Hub', color: 'text-[#97CC6F]' },
                      ].map((order, idx) => (
                        <div key={idx} className="bg-[#14262A]/70 p-2 rounded-lg flex items-center justify-between border border-white/5 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#58C1C3] font-medium">{order.id}</span>
                            <span className="text-white/80">{order.customer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{order.amount}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/5 ${order.color} font-medium`}>
                              {order.courier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={onOpenDemoModal}
                      className="w-full mt-2 py-2 rounded-lg bg-[#58C1C3]/15 border border-[#58C1C3]/40 text-[#58C1C3] font-bold text-[11px] hover:bg-[#58C1C3]/25 transition-all text-center cursor-pointer"
                    >
                      Access Full Interactive Demo Admin →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Bottom Quick Indicator */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-[#F5F7F7]/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#58C1C3]" />
                  Average response time: <strong>&lt; 150ms</strong>
                </span>
                <span className="text-[#97CC6F] font-semibold">100% Data Ownership</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
