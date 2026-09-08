import { motion } from 'motion/react';
import { Globe, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

const metrics = [
  {
    value: '80+',
    label: 'Websites Delivered',
    subtext: 'High-performing web platforms for global businesses',
    icon: Globe,
    accent: 'from-[#58C1C3]/20 to-[#97CC6F]/10',
    iconColor: 'text-[#58C1C3]',
  },
  {
    value: '4+',
    label: 'Years of Experience',
    subtext: 'Deep industry expertise in modern engineering',
    icon: Clock,
    accent: 'from-[#97CC6F]/20 to-[#58C1C3]/10',
    iconColor: 'text-[#97CC6F]',
  },
  {
    value: '100%',
    label: 'Client-Focused Solutions',
    subtext: 'Dedicated post-launch support and scalability',
    icon: ShieldCheck,
    accent: 'from-[#58C1C3]/20 to-[#97CC6F]/10',
    iconColor: 'text-[#58C1C3]',
  },
  {
    value: '99.9%',
    label: 'Uptime & Optimization',
    subtext: 'SEO, speed, and conversion optimized',
    icon: TrendingUp,
    accent: 'from-[#97CC6F]/20 to-[#58C1C3]/10',
    iconColor: 'text-[#97CC6F]',
  },
];

export default function MetricsBar() {
  return (
    <section className="relative z-20 -mt-8 sm:-mt-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6 }}
        className="bg-[#0C1618]/90 border border-[#58C1C3]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(88,193,195,0.1)]"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#58C1C3]/10">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`flex items-start gap-4 ${idx > 0 && idx % 2 === 0 ? 'pt-6 lg:pt-0' : ''} ${
                idx > 0 && idx % 2 !== 0 ? 'pt-0 lg:pt-0' : ''
              } ${idx > 0 ? 'lg:pl-6' : ''}`}
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${metric.accent} border border-[#58C1C3]/20 flex items-center justify-center flex-shrink-0`}
              >
                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5F7F7]">
                    {metric.value}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#97CC6F]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#58C1C3] mt-0.5">
                  {metric.label}
                </h3>
                <p className="text-[11px] text-[#F5F7F7]/50 mt-1 leading-snug hidden sm:block">
                  {metric.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
