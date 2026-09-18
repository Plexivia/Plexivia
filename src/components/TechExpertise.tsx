import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, Cpu, Database, Globe, Code2 } from 'lucide-react';

interface TechBadge {
  name: string;
  category: string;
  icon: string;
  description: string;
  tag: string;
}

const technologies: TechBadge[] = [
  {
    name: 'React',
    category: 'Frontend',
    icon: '⚛️',
    description: 'Dynamic, component-driven client architecture',
    tag: 'SPA & PWA',
  },
  {
    name: 'Next.js',
    category: 'Full-Stack',
    icon: '▲',
    description: 'Server-side rendering, static site generation, and Edge APIs',
    tag: 'SSR / SSG',
  },
  {
    name: 'Node.js',
    category: 'Backend',
    icon: '🟢',
    description: 'High-throughput asynchronous backend services & microservices',
    tag: 'REST & GraphQL',
  },
  {
    name: 'TypeScript',
    category: 'Core Language',
    icon: 'TS',
    description: 'Type-safe, maintainable enterprise software architecture',
    tag: 'Strict Typing',
  },
  {
    name: 'MongoDB',
    category: 'Database',
    icon: '🍃',
    description: 'Scalable NoSQL document data store for agile cloud apps',
    tag: 'NoSQL / Cloud',
  },
  {
    name: 'WordPress',
    category: 'CMS',
    icon: 'W',
    description: 'Custom headless and enterprise-grade content management',
    tag: 'Custom Themes',
  },
  {
    name: 'Shopify',
    category: 'eCommerce',
    icon: '🛍️',
    description: 'Modern storefronts, high conversion checkout & Liquid themes',
    tag: 'Liquid / Headless',
  },
  {
    name: 'Tailwind CSS',
    category: 'Styling',
    icon: '🎨',
    description: 'Modern utility-first responsive styling & bespoke UI design',
    tag: 'Design Systems',
  },
];

export default function TechExpertise() {
  return (
    <section id="expertise" className="py-20 px-4 sm:px-6 lg:px-12 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Technology & Expertise
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered with <span className="text-cyan-700">Modern Web Technologies</span>
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            We select the optimal tech stack for your project to ensure blistering performance, bank-grade security, and long-term scalability.
          </p>

          {/* Subtitle Tagline from Brand Guidelines */}
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-emerald-700 mt-4">
            <span>Modern Tech</span>
            <span className="text-slate-300">•</span>
            <span>Scalable Solutions</span>
            <span className="text-slate-300">•</span>
            <span>Client Focused</span>
          </div>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {technologies.map((tech, idx) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -4 }}
              className="bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-cyan-300 rounded-2xl p-5 transition-all duration-300 group hover:shadow-md shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base font-bold text-cyan-700 group-hover:border-cyan-300 transition-colors shadow-xs">
                  {tech.icon}
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  {tech.tag}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 group-hover:text-cyan-700 transition-colors">
                {tech.name}
              </h3>
              <p className="text-[10px] text-cyan-700 font-mono uppercase tracking-wider mb-2 font-semibold">
                {tech.category}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Reliability Guarantee Strip */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-cyan-50 via-white to-emerald-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Clean Code Architecture & Zero Technical Debt
              </h4>
              <p className="text-xs text-slate-600">
                Every project is built with version control, modular patterns, automated tests, and comprehensive handover documentation.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-800 font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-cyan-100/60 border border-cyan-200 whitespace-nowrap">
            100% Client Focused
          </span>
        </div>

      </div>
    </section>
  );
}
