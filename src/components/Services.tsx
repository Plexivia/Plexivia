import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  Layers,
  Globe,
  ShoppingBag,
  Layout,
  Palette,
  Search,
  Video,
  Share2,
  Briefcase,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

const servicesData: ServiceItem[] = [
  {
    id: 'custom-web',
    title: 'Custom Website Development',
    description: 'Custom websites that perform and scale, engineered with modern frameworks, high security, and ultra-fast loading speeds.',
    category: 'development',
    icon: 'Code',
    features: ['Responsive across all viewports', 'Sub-second page load times', 'Custom CMS & API integrations', 'SEO-friendly architecture'],
    deliverables: 'Tailored corporate websites, landing pages & web portals',
  },
  {
    id: 'web-app',
    title: 'Web Application Development',
    description: 'Robust web apps for your business needs. Full-stack cloud applications built for high concurrency, security, and scalability.',
    category: 'development',
    icon: 'Layers',
    features: ['Modern React & Next.js frameworks', 'Secure Node.js & REST/GraphQL APIs', 'Role-based access & authentication', 'Scalable database architecture'],
    deliverables: 'SaaS platforms, client portals, internal business dashboards',
  },
  {
    id: 'wordpress',
    title: 'WordPress Development',
    description: 'Flexible, powerful, and easy to manage websites with custom Gutenberg blocks, Elementor setups, and high-performance headless options.',
    category: 'development',
    icon: 'Globe',
    features: ['Bespoke theme & plugin development', 'Zero-bloat performance optimization', 'Intuitive admin panel for non-tech teams', 'Automated backup & malware shield'],
    deliverables: 'Custom WordPress sites, publishing blogs, company showcases',
  },
  {
    id: 'shopify',
    title: 'Shopify Development',
    description: 'Build and grow your eCommerce store. High-converting shopping experiences with seamless checkout flows and payment gateways.',
    category: 'development',
    icon: 'ShoppingBag',
    features: ['Custom Liquid & Shopify 2.0 themes', 'Third-party app & ERP integrations', 'Mobile checkout conversion optimization', 'Inventory & fulfillment setup'],
    deliverables: 'Flagship eCommerce storefronts & international retail stores',
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'User-centric designs that make an impact. We turn complex user flows into intuitive, visually striking design systems in Figma.',
    category: 'design',
    icon: 'Layout',
    features: ['Wireframing & user journey mapping', 'High-fidelity Figma prototypes', 'Design systems & component libraries', 'Usability testing & accessibility audit'],
    deliverables: 'Complete design specs, interactive prototypes, design systems',
  },
  {
    id: 'graphics',
    title: 'Graphics Design',
    description: 'Creative visuals for your brand identity. Cohesive branding that communicates trust, sophistication, and digital authority.',
    category: 'design',
    icon: 'Palette',
    features: ['Brand guidelines & color palettes', 'Logo identity & vector asset suites', 'Marketing collateral & digital pitch decks', 'Custom vector iconography'],
    deliverables: 'Brand styleguides, vector logos, marketing visual suites',
  },
  {
    id: 'seo',
    title: 'SEO (Search Engine Optimization)',
    description: 'Rank higher, get found, get more customers. Technical audits, keyword strategy, and on-page optimization for organic dominance.',
    category: 'growth',
    icon: 'Search',
    features: ['Comprehensive technical SEO audits', 'Core Web Vitals & speed remediation', 'High-intent keyword research & strategy', 'Schema markup & rich snippet injection'],
    deliverables: 'Monthly organic growth reports, technical SEO execution',
  },
  {
    id: 'video-motion',
    title: 'Video Editing & Motion Graphics',
    description: 'Engaging videos that tell your story. Dynamic product animations, promotional reels, and brand explainers that drive retention.',
    category: 'design',
    icon: 'Video',
    features: ['High-impact promotional reels & ads', '3D motion graphics & logo reveals', 'SaaS product demo videos & walkthroughs', 'Color grading, audio mix & sound design'],
    deliverables: 'High-res 4K video assets, social reels, motion assets',
  },
  {
    id: 'social-marketing',
    title: 'Social Media Marketing',
    description: 'Build your brand and grow your audience with targeted multi-channel campaigns, cohesive content strategy, and community engagement.',
    category: 'growth',
    icon: 'Share2',
    features: ['Multi-platform content strategy', 'Data-backed ad campaign management', 'Audience growth & engagement metrics', 'Conversion tracking & ROI reporting'],
    deliverables: 'Editorial calendars, ad creative assets, performance reports',
  },
  {
    id: 'business-solutions',
    title: 'Business Solutions',
    description: 'Tailored digital strategies to streamline operations, automate repetitive workflows, and integrate mission-critical tools.',
    category: 'solutions',
    icon: 'Briefcase',
    features: ['Workflow automation (Zapier, Make, n8n)', 'CRM, ERP & Payment API integrations', 'Data migration & cloud infrastructure setup', 'Dedicated ongoing IT consulting & SLAs'],
    deliverables: 'Automated business systems, integrated APIs, consulting roadmap',
  },
];

const categoryFilters = [
  { key: 'all', label: 'All Services (10)' },
  { key: 'development', label: 'Development' },
  { key: 'design', label: 'UI/UX & Design' },
  { key: 'growth', label: 'SEO & Marketing' },
  { key: 'solutions', label: 'Business Solutions' },
];

export default function Services({ onSelectService }: ServicesProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const filteredServices = servicesData.filter((service) => {
    if (activeCategory === 'all') return true;
    return service.category === activeCategory;
  });

  const getIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'Code':
        return <Code {...props} className="w-5 h-5 text-cyan-600" />;
      case 'Layers':
        return <Layers {...props} className="w-5 h-5 text-emerald-600" />;
      case 'Globe':
        return <Globe {...props} className="w-5 h-5 text-cyan-600" />;
      case 'ShoppingBag':
        return <ShoppingBag {...props} className="w-5 h-5 text-emerald-600" />;
      case 'Layout':
        return <Layout {...props} className="w-5 h-5 text-cyan-600" />;
      case 'Palette':
        return <Palette {...props} className="w-5 h-5 text-emerald-600" />;
      case 'Search':
        return <Search {...props} className="w-5 h-5 text-cyan-600" />;
      case 'Video':
        return <Video {...props} className="w-5 h-5 text-emerald-600" />;
      case 'Share2':
        return <Share2 {...props} className="w-5 h-5 text-cyan-600" />;
      case 'Briefcase':
        return <Briefcase {...props} className="w-5 h-5 text-emerald-600" />;
      default:
        return <Code {...props} className="w-5 h-5 text-cyan-600" />;
    }
  };

  return (
    <section id="services" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 relative border-t border-slate-200 bg-slate-50/70">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-100/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-800 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Our Services
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">Grow Online</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-3">
              From websites to marketing, we provide complete digital solutions under one roof designed to drive actual business results.
            </p>
          </div>

          <button
            onClick={() => onSelectService('Custom Website Development')}
            className="self-start md:self-end inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 hover:text-cyan-800 transition-colors py-2 group cursor-pointer"
          >
            <span>Request Custom Solution</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categoryFilters.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === tab.key
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredServices.map((service) => {
              const isExpanded = expandedService === service.id;

              return (
                <motion.div
                  layout
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group relative bg-white border border-slate-200/90 hover:border-cyan-400 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/80 shadow-sm flex flex-col justify-between"
                >
                  {/* Card Content */}
                  <div>
                    {/* Icon and Category */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        {getIcon(service.icon)}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 font-semibold">
                        {service.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 group-hover:text-cyan-700 transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Expandable Key Features */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-slate-100 mb-4 space-y-2"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          Core Deliverables:
                        </p>
                        {service.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => setExpandedService(isExpanded ? null : service.id)}
                      className="text-xs text-slate-500 hover:text-cyan-700 transition-colors underline underline-offset-4 cursor-pointer font-medium"
                    >
                      {isExpanded ? 'Show less' : 'View deliverables'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectService(service.title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800 hover:bg-cyan-600 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
