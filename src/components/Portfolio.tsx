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
    <section id="portfolio" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-white relative border-t border-slate-200">
      {/* Background ambient lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-100/30 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-800 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Our Work
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">Projects</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-3">
              A glimpse of what we've built for our amazing clients across business websites, eCommerce stores, and custom software.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
            <Sparkles className="w-4 h-4 text-cyan-600" />
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
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 shadow-xs'
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
                className="group bg-white border border-slate-200/90 hover:border-cyan-400 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 shadow-sm flex flex-col cursor-pointer"
                onClick={() => onSelectProject(project.id)}
              >
                {/* Project Image Container */}
                <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-100">
                  <img
                    src={project.featuredImage}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/95 border border-slate-200 text-[10px] font-mono uppercase tracking-wider text-cyan-800 font-bold backdrop-blur-md shadow-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* Impact Metric Pill */}
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold backdrop-blur-md shadow-sm">
                      {project.metrics}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-1 font-semibold">
                      {project.client}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors mb-3">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 group-hover:text-cyan-800 transition-colors cursor-pointer"
                      >
                        <span>View Project Case Study</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEstimatorWithService(project.category);
                        }}
                        className="text-xs text-slate-500 hover:text-cyan-700 transition-colors cursor-pointer font-semibold"
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
