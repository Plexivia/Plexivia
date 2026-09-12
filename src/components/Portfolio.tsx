import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (activeProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeProject]);

  return (
    <section id="portfolio" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative border-t border-[#58C1C3]/10 overflow-hidden w-full">
      {/* Background ambient lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#58C1C3]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#58C1C3] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#97CC6F]" />
              Our Work
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">Projects</span>
            </h2>
            <p className="text-sm sm:text-base text-[#F5F7F7]/65 max-w-2xl mt-3">
              A glimpse of what we've built for our amazing clients across business websites, eCommerce stores, and custom software.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#97CC6F]">
            <Sparkles className="w-4 h-4 text-[#58C1C3]" />
            <span>80+ Custom Projects Delivered</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#58C1C3] text-[#0C1618] shadow-[0_0_15px_rgba(88,193,195,0.3)]'
                  : 'bg-white/[0.03] text-[#F5F7F7]/70 border border-white/5 hover:border-[#58C1C3]/30 hover:text-[#F5F7F7]'
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
                className="group bg-[#0F1E22] border border-[#58C1C3]/15 hover:border-[#58C1C3]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(88,193,195,0.15)] flex flex-col"
              >
                {/* Project Image Container */}
                <div className="relative h-60 sm:h-72 overflow-hidden bg-[#0C1618]">
                  <img
                    src={project.featuredImage}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1E22] via-transparent to-black/30" />

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#0C1618]/90 border border-[#58C1C3]/30 text-[10px] font-mono uppercase tracking-wider text-[#58C1C3] backdrop-blur-md">
                      {project.category}
                    </span>
                  </div>

                  {/* Impact Metric Pill */}
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-[#0C1618]/90 border border-[#97CC6F]/40 text-[10px] font-mono text-[#97CC6F] backdrop-blur-md">
                      {project.metrics}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-[#F5F7F7]/40 mb-1">
                      {project.client}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F5F7F7] group-hover:text-[#58C1C3] transition-colors mb-3">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F5F7F7]/65 leading-relaxed mb-5">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] font-mono text-[#F5F7F7]/70"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <button
                        onClick={() => setActiveProject(project)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#58C1C3] hover:text-[#97CC6F] transition-colors cursor-pointer"
                      >
                        <span>View Project Case Study</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenEstimatorWithService(project.category)}
                        className="text-xs text-[#F5F7F7]/50 hover:text-white transition-colors cursor-pointer"
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
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {activeProject && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveProject(null)}
                  className="fixed inset-0 bg-[#0C1618]/85 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl bg-[#0F1E22] border border-[#58C1C3]/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-[#58C1C3]/15 text-[#58C1C3] text-[10px] font-mono uppercase tracking-wider border border-[#58C1C3]/30">
                        {activeProject.category}
                      </span>
                      <h3 className="text-2xl font-bold text-[#F5F7F7] mt-2">
                        {activeProject.title}
                      </h3>
                      <p className="text-xs font-mono text-[#97CC6F] mt-0.5">
                        Client: {activeProject.client}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveProject(null)}
                      className="p-2 text-[#F5F7F7]/50 hover:text-white rounded-full bg-white/5 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden mb-6 h-52 sm:h-64 relative">
                    <img
                      src={activeProject.featuredImage}
                      alt={activeProject.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#0C1618]/90 text-xs font-mono text-[#97CC6F] border border-[#97CC6F]/30 backdrop-blur-md">
                      {activeProject.metrics}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-1">
                        Project Overview
                      </h4>
                      <p className="text-xs sm:text-sm text-[#F5F7F7]/75 leading-relaxed">
                        {activeProject.overview}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-2">
                        Key Engineering Deliverables
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeProject.keyFeatures.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs text-[#F5F7F7]/80">
                            <Check className="w-3.5 h-3.5 text-[#97CC6F] flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-2">
                        Applied Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeProject.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-lg bg-[#0C1618] border border-[#58C1C3]/20 text-xs font-mono text-[#58C1C3]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        const category = activeProject.category;
                        setActiveProject(null);
                        onOpenEstimatorWithService(category);
                      }}
                      className="flex-1 py-3 px-6 rounded-full bg-[#58C1C3] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:bg-[#97CC6F] transition-all cursor-pointer text-center"
                    >
                      Start a Project Like This
                    </button>

                    <a
                      href={`https://wa.me/8801823110115?text=Hello%20Plexivia!%20I'm%20interested%20in%20a%20project%20similar%20to%20${encodeURIComponent(activeProject.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-6 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all text-center cursor-pointer"
                    >
                      Discuss on WhatsApp
                    </a>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      </div>
    </section>
  );
}
