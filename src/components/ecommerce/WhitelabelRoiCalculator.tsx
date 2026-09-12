import { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Sparkles, TrendingUp, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WhitelabelRoiCalculatorProps {
  onOpenDemoModal: () => void;
}

export default function WhitelabelRoiCalculator({ onOpenDemoModal }: WhitelabelRoiCalculatorProps) {
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');
  // Monthly GMV (Default: 800,000 BDT or 8,000 USD)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(800000);
  // Monthly Orders (Default: 500)
  const [monthlyOrders, setMonthlyOrders] = useState<number>(500);

  // Conversion / currency multipliers
  const isBDT = currency === 'BDT';
  const currencySymbol = isBDT ? '৳' : '$';

  // Slider bounds
  const minRev = isBDT ? 200000 : 2000;
  const maxRev = isBDT ? 5000000 : 60000;
  const stepRev = isBDT ? 50000 : 500;

  const handleCurrencyChange = (newCurr: 'BDT' | 'USD') => {
    if (newCurr === currency) return;
    setCurrency(newCurr);
    if (newCurr === 'USD') {
      setMonthlyRevenue(8000);
    } else {
      setMonthlyRevenue(800000);
    }
  };

  // Calculations:
  // 1. Shopify 2% transaction fee
  const shopifyTransactionFeeMonthly = monthlyRevenue * 0.02;
  // 2. Shopify Essential Apps (Checkout, upsell, courier bridge, WhatsApp recovery, page builder)
  const shopifyAppsMonthly = isBDT ? 28000 : 250;
  // 3. Shopify Base Plan
  const shopifyPlanMonthly = isBDT ? 8500 : 79;
  // Total Shopify Annual Cost:
  const shopifyTotalAnnual = (shopifyTransactionFeeMonthly + shopifyAppsMonthly + shopifyPlanMonthly) * 12;

  // Plexivia Whitelabel: Zero transaction cut, Zero monthly app fees.
  // Just standard high-speed cloud infrastructure + support
  const plexiviaMaintenanceAnnual = isBDT ? 40000 : 400;

  // Annual Net Savings
  const annualSavings = Math.max(0, Math.round(shopifyTotalAnnual - plexiviaMaintenanceAnnual));

  return (
    <section id="roi-calculator" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0F1E22] relative border-t border-[#58C1C3]/10 overflow-hidden w-full">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#97CC6F]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#97CC6F]/10 border border-[#97CC6F]/25 text-[#97CC6F] text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI & Savings Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            How Much Money Are You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              Losing To SaaS Fees?
            </span>
          </h2>

          <p className="text-[#F5F7F7]/70 text-sm sm:text-base mt-4 leading-relaxed">
            Drag the sliders below to see your exact annual savings when switching from Shopify’s app ecosystem and 2% fee to Plexivia White-label.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center bg-[#0C1618] p-1 rounded-xl border border-[#58C1C3]/20 mt-6 shadow-inner">
            <button
              onClick={() => handleCurrencyChange('BDT')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currency === 'BDT'
                  ? 'bg-[#58C1C3] text-[#0C1618] shadow-md'
                  : 'text-[#F5F7F7]/70 hover:text-white'
              }`}
            >
              🇧🇩 BDT (৳)
            </button>
            <button
              onClick={() => handleCurrencyChange('USD')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#58C1C3] text-[#0C1618] shadow-md'
                  : 'text-[#F5F7F7]/70 hover:text-white'
              }`}
            >
              🌐 USD ($)
            </button>
          </div>
        </div>

        {/* Calculator Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sliders Form (Left Col) */}
          <div className="lg:col-span-7 bg-[#0C1618]/90 border border-[#58C1C3]/20 rounded-2xl p-6 sm:p-8 space-y-8 backdrop-blur-xl">
            
            {/* Slider 1: Monthly GMV / Revenue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#F5F7F7]">
                  Monthly Store Revenue (GMV)
                </label>
                <div className="px-3 py-1 rounded-lg bg-[#14262A] border border-[#58C1C3]/30 text-[#58C1C3] font-bold text-base font-mono">
                  {currencySymbol} {monthlyRevenue.toLocaleString()}
                </div>
              </div>

              <input
                type="range"
                min={minRev}
                max={maxRev}
                step={stepRev}
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full h-2 bg-[#14262A] rounded-lg appearance-none cursor-pointer accent-[#58C1C3]"
              />

              <div className="flex justify-between text-[11px] text-[#F5F7F7]/50">
                <span>{currencySymbol} {minRev.toLocaleString()}</span>
                <span>{currencySymbol} {maxRev.toLocaleString()}+</span>
              </div>
            </div>

            {/* Slider 2: Monthly Orders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#F5F7F7]">
                  Estimated Monthly Orders
                </label>
                <div className="px-3 py-1 rounded-lg bg-[#14262A] border border-[#97CC6F]/30 text-[#97CC6F] font-bold text-base font-mono">
                  {monthlyOrders.toLocaleString()} Orders
                </div>
              </div>

              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full h-2 bg-[#14262A] rounded-lg appearance-none cursor-pointer accent-[#97CC6F]"
              />

              <div className="flex justify-between text-[11px] text-[#F5F7F7]/50">
                <span>100 orders</span>
                <span>5,000+ orders</span>
              </div>
            </div>

            {/* Detailed Cost Breakdown on Shopify */}
            <div className="bg-[#14262A]/60 rounded-xl p-4 border border-white/5 space-y-2 text-xs">
              <div className="text-[#F5F7F7]/80 font-semibold mb-1">
                Where your money goes on Shopify every month:
              </div>
              
              <div className="flex justify-between text-[#F5F7F7]/70">
                <span>• 2.0% Shopify Transaction Penalty:</span>
                <span className="text-red-400 font-semibold">
                  {currencySymbol} {Math.round(shopifyTransactionFeeMonthly).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex justify-between text-[#F5F7F7]/70">
                <span>• Necessary Shopify App Subscriptions (Checkout/Upsell/Courier):</span>
                <span className="text-red-400 font-semibold">
                  {currencySymbol} {Math.round(shopifyAppsMonthly).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex justify-between text-[#F5F7F7]/70">
                <span>• Shopify Core Plan:</span>
                <span className="text-red-400 font-semibold">
                  {currencySymbol} {Math.round(shopifyPlanMonthly).toLocaleString()}/mo
                </span>
              </div>
            </div>

          </div>

          {/* Results Card (Right Col) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#14262A] to-[#0C1618] border-2 border-[#58C1C3]/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_15px_50px_rgba(88,193,195,0.15)] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#97CC6F]/15 rounded-full blur-[70px] pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#97CC6F]/20 text-[#97CC6F] text-xs font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Estimated Annual Savings</span>
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#97CC6F] to-[#58C1C3] tracking-tight">
                {currencySymbol} {annualSavings.toLocaleString()}
              </div>
              <p className="text-xs text-[#F5F7F7]/70 mt-1">
                Net profit back in your pocket every 12 months.
              </p>

              <div className="my-6 space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 text-[#F5F7F7]/85">
                  <CheckCircle2 className="w-4 h-4 text-[#97CC6F] shrink-0" />
                  <span><strong>0% platform commission:</strong> You keep 100% of revenue</span>
                </div>
                <div className="flex items-center gap-2 text-[#F5F7F7]/85">
                  <CheckCircle2 className="w-4 h-4 text-[#97CC6F] shrink-0" />
                  <span><strong>Zero monthly app bills:</strong> 1-click checkout & courier built-in</span>
                </div>
                <div className="flex items-center gap-2 text-[#F5F7F7]/85">
                  <CheckCircle2 className="w-4 h-4 text-[#97CC6F] shrink-0" />
                  <span><strong>Fast payback:</strong> System pays for itself within 60-90 days</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenDemoModal}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(88,193,195,0.4)] hover:shadow-[0_0_35px_rgba(151,204,111,0.5)] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim This Savings — Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <p className="text-center text-[10px] text-[#F5F7F7]/50 mt-2.5">
                Full source code license & custom deployment options available.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
