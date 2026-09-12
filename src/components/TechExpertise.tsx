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
    <section id="expertise" className="py-20 px-4 sm:px-6 lg:px-12 bg-[#0C1618] border-t border-[#58C1C3]/10 relative overflow-hidden w-full">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-xs font-semibold text-[#58C1C3] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#97CC6F]" />
            Technology & Expertise
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7F7] tracking-tight">
            Engineered with <span className="text-[#58C1C3]">Modern Web Technologies</span>
          </h2>
          <p className="text-sm text-[#F5F7F7]/60 mt-3">
            We select the optimal tech stack for your project to ensure blistering performance, bank-grade security, and long-term scalability.
          </p>

          {/* Subtitle Tagline from Brand Guidelines */}
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-[#97CC6F] mt-4">
            <span>Modern Tech</span>
            <span className="text-[#F5F7F7]/20">•</span>
            <span>Scalable Solutions</span>
            <span className="text-[#F5F7F7]/20">•</span>
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
              className="bg-[#0F1E22] border border-[#58C1C3]/15 hover:border-[#58C1C3]/40 rounded-2xl p-5 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0C1618] border border-white/10 flex items-center justify-center text-base font-bold text-[#58C1C3] group-hover:border-[#58C1C3]/40 transition-colors">
                  {tech.icon}
                </div>
                <span className="text-[10px] font-mono text-[#97CC6F] bg-[#97CC6F]/10 px-2 py-0.5 rounded-full border border-[#97CC6F]/20">
                  {tech.tag}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#F5F7F7] group-hover:text-[#58C1C3] transition-colors">
                {tech.name}
              </h3>
              <p className="text-[10px] text-[#58C1C3]/80 font-mono uppercase tracking-wider mb-2">
                {tech.category}
              </p>
              <p className="text-xs text-[#F5F7F7]/55 leading-relaxed">
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Reliability Guarantee Strip */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#58C1C3]/10 via-transparent to-[#97CC6F]/10 border border-[#58C1C3]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#97CC6F]/20 border border-[#97CC6F]/40 flex items-center justify-center text-[#97CC6F] flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F5F7F7]">
                Clean Code Architecture & Zero Technical Debt
              </h4>
              <p className="text-xs text-[#F5F7F7]/60">
                Every project is built with version control, modular patterns, automated tests, and comprehensive handover documentation.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#58C1C3] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#58C1C3]/15 border border-[#58C1C3]/30 whitespace-nowrap">
            100% Client Focused
          </span>
        </div>

      </div>
    </section>
  );
}
