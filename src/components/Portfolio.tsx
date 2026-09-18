import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Sparkles, Layers, ArrowUpRight, X, Check, Globe } from 'lucide-react';
import { ProjectItem } from '../types';

interface PortfolioProps {
  onOpenEstimatorWithService: (service: string) => void;
}

const projects: ProjectItem[] = [
  {
    id: 'apex-logistics',
    title: 'Apex Global Logistics Portal',
    category: 'Business Websites',
    client: 'Apex Global Freight Ltd.',
    description: 'Corporate business website with real-time consignment tracking, responsive booking calculators, and custom Gutenberg performance blocks.',
    techStack: ['WordPress', 'TypeScript', 'Tailwind CSS', 'REST API'],
    metrics: '0.6s Load Time • 3x Inquiries',
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    overview: 'A modernized global shipping enterprise portal replacing legacy slow infrastructure with a dynamic, multi-lingual WordPress setup.',
    keyFeatures: ['Interactive shipment tracking widget', 'Instant freight quote generator', 'Automated CRM lead dispatch', 'Multi-region CDN deployment'],
  },
  {
    id: 'lumina-luxe',
    title: 'Lumina Luxe Sustainable Fashion',
    category: 'eCommerce Stores',
    client: 'Lumina Luxe Brand',
    description: 'High-converting flagship Shopify 2.0 storefront featuring 3D product previews, dynamic bundle builders, and one-click checkout.',
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'Klaviyo'],
    metrics: '+184% Conversion • $1.2M GMV',
    featuredImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
    overview: 'A bespoke sustainable apparel flagship store engineered to maximize mobile checkout speed and average order value (AOV).',
    keyFeatures: ['Sub-second cart drawer & slide-outs', 'Custom swatch & variant selector', 'Currency & localization selector', 'Direct review & social feed sync'],
  },
  {
    id: 'novaflow-crm',
    title: 'NovaFlow Cloud Operations ERP',
    category: 'Web Applications',
    client: 'NovaFlow Tech Systems',
    description: 'Scalable SaaS web application for collaborative project management, real-time telemetry metrics, and team resource scheduling.',
    techStack: ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'],
    metrics: '15,000+ Active Users • 99.99% Uptime',
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    overview: 'Enterprise cloud dashboard with sub-100ms API response times, role-based access control, and dynamic interactive SVG charts.',
    keyFeatures: ['Real-time WebSocket notifications', 'Kanban & Gantt interactive views', 'Automated PDF export engine', 'Stripe recurring billing subscription'],
  },
  {
    id: 'pulsehealth-portal',
    title: 'PulseCare Telehealth Diagnostic Suite',
    category: 'Custom Digital Solutions',
    client: 'PulseCare Medical Network',
    description: 'Custom HIPAA-compliant digital solution connecting verified practitioners with patients through encrypted video consults and scheduling.',
    techStack: ['Next.js', 'TypeScript', 'Node.js', 'WebRTC', 'Tailwind'],
    metrics: '100% HIPAA Compliant • 4.9★ App Rating',
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    overview: 'A patient-first healthcare ecosystem replacing cumbersome paper workflows with instant online scheduling and secure medical records.',
    keyFeatures: ['Encrypted WebRTC peer-to-peer consults', 'Automated SMS/Email appointment reminders', 'Digital prescription issuance', 'Multi-clinic admin hub'],
  },
];

const categories = [
  'All',
  'Business Websites',
  'eCommerce Stores',
  'Web Applications',
  'Custom Digital Solutions',
];

export default function Portfolio({ onOpenEstimatorWithService }: PortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const filteredProjects = projects.filter((project) => {
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
                className="group bg-white border border-slate-200/90 hover:border-cyan-400 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80 shadow-sm flex flex-col"
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
                        onClick={() => setActiveProject(project)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 hover:text-cyan-800 transition-colors cursor-pointer"
                      >
                        <span>View Project Case Study</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenEstimatorWithService(project.category)}
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

        {/* Case Study Modal */}
        <AnimatePresence>
          {activeProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveProject(null)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-slate-900"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-mono uppercase tracking-wider border border-cyan-200 font-bold">
                      {activeProject.category}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                      {activeProject.title}
                    </h3>
                    <p className="text-xs font-mono text-emerald-700 mt-0.5 font-semibold">
                      Client: {activeProject.client}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="p-2 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden mb-6 h-52 sm:h-64 relative bg-slate-100">
                  <img
                    src={activeProject.featuredImage}
                    alt={activeProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-xs font-mono text-emerald-400 border border-emerald-500/40 backdrop-blur-md font-bold">
                    {activeProject.metrics}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 mb-1">
                      Project Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activeProject.overview}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 mb-2">
                      Key Engineering Deliverables
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProject.keyFeatures.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 mb-2">
                      Applied Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeProject.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-cyan-800 font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      const category = activeProject.category;
                      setActiveProject(null);
                      onOpenEstimatorWithService(category);
                    }}
                    className="flex-1 py-3 px-6 rounded-full bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-cyan-700 transition-all cursor-pointer text-center shadow-md shadow-cyan-600/25"
                  >
                    Start a Project Like This
                  </button>

                  <a
                    href={`https://wa.me/8801608098281?text=Hello%20Plexivia!%20I'm%20interested%20in%20a%20project%20similar%20to%20${encodeURIComponent(activeProject.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-6 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all text-center cursor-pointer shadow-md shadow-emerald-600/25"
                  >
                    Discuss on WhatsApp
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
