import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { projectsData } from '../data/projects';

interface PortfolioProps {
  onSelectProject: (id: string) => void;
  onOpenEstimatorWithService: (service: string) => void;
}

const categories = [
  'All',
  'Business Websites',
  'eCommerce Stores',
  'Web Applications',
  'Custom Digital Solutions',
];

export default function Portfolio({ onSelectProject, onOpenEstimatorWithService }: PortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProjects = projectsData.filter((project) => {
    if (selectedCategory === 'All') return true;
    return project.category === selectedCategory;
  });

  return (
    <section id="portfolio" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-white dark:bg-[#0C1618] relative border-t border-slate-200 dark:border-[#58C1C3]/15 transition-colors">
      {/* Background ambient lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-100/30 dark:bg-[#58C1C3]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-800 dark:text-[#58C1C3] mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#97CC6F]" />
              Our Work
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#F5F7F7] tracking-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-[#58C1C3] dark:to-[#97CC6F]">Projects</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#F5F7F7]/70 max-w-2xl mt-3">
              A glimpse of what we've built for our amazing clients across business websites, eCommerce stores, and custom software.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-[#97CC6F] font-semibold bg-emerald-50 dark:bg-[#97CC6F]/10 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-[#97CC6F]/30 shadow-xs">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-[#58C1C3]" />
            <span>80+ Custom Projects Delivered</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 dark:bg-[#58C1C3] text-white dark:text-[#0C1618] font-bold shadow-md shadow-cyan-600/20 dark:shadow-[0_0_15px_rgba(88,193,195,0.3)]'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-[#58C1C3] hover:text-cyan-700 dark:hover:text-[#58C1C3] shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group bg-white dark:bg-[#0F1E22] border border-slate-200/90 dark:border-[#58C1C3]/20 hover:border-cyan-400 hover:dark:border-[#58C1C3] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:shadow-black/60 shadow-sm flex flex-col cursor-pointer"
                onClick={() => onSelectProject(project.id)}
              >
                {/* Project Image Container */}
                <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-100 dark:bg-[#14262A]">
                  <img
                    src={project.featuredImage}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#0C1618]/95 border border-slate-200 dark:border-[#58C1C3]/30 text-[10px] font-mono uppercase tracking-wider text-cyan-800 dark:text-[#58C1C3] font-bold backdrop-blur-md shadow-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* Impact Metric Pill */}
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 dark:bg-[#0C1618]/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 dark:text-[#97CC6F] font-bold backdrop-blur-md shadow-sm">
                      {project.metrics}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-[#58C1C3] mb-1 font-semibold">
                      {project.client}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F7F7] group-hover:text-cyan-700 dark:group-hover:text-[#58C1C3] transition-colors mb-3">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-[#F5F7F7]/70 leading-relaxed mb-5">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0C1618] border border-slate-200 dark:border-[#58C1C3]/15 text-[10px] font-mono text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-[#58C1C3] group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <span>View Project Case Study</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEstimatorWithService(project.category);
                        }}
                        className="text-xs text-slate-500 dark:text-[#F5F7F7]/60 hover:text-cyan-700 dark:hover:text-[#58C1C3] transition-colors cursor-pointer font-semibold"
                      >
                        Build Similar →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
