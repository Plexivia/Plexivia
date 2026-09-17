import { motion } from 'motion/react';
import { Globe, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

const metrics = [
  {
    value: '80+',
    label: 'Websites Delivered',
    subtext: 'High-performing web platforms for global businesses',
    icon: Globe,
    accent: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    iconColor: 'text-cyan-600',
  },
  {
    value: '4+',
    label: 'Years of Experience',
    subtext: 'Deep industry expertise in modern engineering',
    icon: Clock,
    accent: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
  {
    value: '100%',
    label: 'Client-Focused Solutions',
    subtext: 'Dedicated post-launch support and scalability',
    icon: ShieldCheck,
    accent: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    iconColor: 'text-cyan-600',
  },
  {
    value: '99.9%',
    label: 'Uptime & Optimization',
    subtext: 'SEO, speed, and conversion optimized',
    icon: TrendingUp,
    accent: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
];

export default function MetricsBar() {
  return (
    <section className="relative z-20 -mt-8 sm:-mt-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6 }}
        className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
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
                className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${metric.accent}`}
              >
                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    {metric.value}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-cyan-800 mt-0.5">
                  {metric.label}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug hidden sm:block">
                  {metric.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </div>
    </section>
  );
}
