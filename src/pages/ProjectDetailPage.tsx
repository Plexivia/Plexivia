import { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { ProjectItem } from '../types';
import { projectsData } from '../data/projects';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ProjectDetailPageProps {
  projectId: string;
  onNavigateHome: () => void;
  onSelectProject: (id: string) => void;
  onOpenEstimator: (service?: string) => void;
}

export default function ProjectDetailPage({
  projectId,
  onNavigateHome,
  onSelectProject,
  onOpenEstimator,
}: ProjectDetailPageProps) {
  const project = projectsData.find((p) => p.id === projectId) || projectsData[0];
  const relatedProjects = projectsData.filter((p) => p.id !== project.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [projectId]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-500/20 selection:text-cyan-900 flex flex-col">
      {/* Header */}
      <Header onOpenEstimator={() => onOpenEstimator(project.category)} />

      <main className="flex-1">
        {/* Top Breadcrumb & Navigation Bar */}
        <section className="bg-slate-50 border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-700 font-semibold transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Projects</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium">
              <button onClick={onNavigateHome} className="hover:text-slate-900 cursor-pointer">Home</button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <button onClick={onNavigateHome} className="hover:text-slate-900 cursor-pointer">Portfolio</button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-cyan-800 font-bold truncate max-w-xs">{project.title}</span>
            </div>
          </div>
        </section>

        {/* Project Hero Section */}
        <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 px-4 sm:px-6 lg:px-12 bg-white overflow-hidden">
          <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-100/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Header Meta */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-mono uppercase tracking-wider text-cyan-800 font-bold">
                {project.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 font-semibold">
                Client: {project.client}
              </span>
              {project.duration && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {project.duration}
                </span>
              )}
            </div>

            {/* Title & Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl">
              {project.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed mb-8">
              {project.overview}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button
                onClick={() => onOpenEstimator(project.category)}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-cyan-700 transition-all duration-300 shadow-lg shadow-cyan-600/25 cursor-pointer"
              >
                <span>Start a Project Like This</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/8801608098281?text=Hello%20Plexivia!%20I'm%20interested%20in%20a%20project%20similar%20to%20${encodeURIComponent(project.title)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-100 transition-all duration-300 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Discuss on WhatsApp</span>
              </a>
            </div>

            {/* High-Resolution Featured Hero Image */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900 aspect-[16/9] sm:aspect-[21/9] max-h-[520px]">
              <img
                src={project.featuredImage}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

              {/* Floating Live Badge */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-xs sm:text-sm font-mono text-emerald-400 font-bold backdrop-blur-md shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  {project.metrics}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive Case Study Content */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12">
              
              {/* Main Content Column */}
              <div className="lg:col-span-8 space-y-12">
                {/* Challenge Section */}
                {project.challenge && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 font-mono">
                      <Zap className="w-4 h-4" />
                      The Challenge & Problem Statement
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                      Overcoming Legacy Infrastructure & Friction
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {project.challenge}
                    </p>
                  </div>
                )}

                {/* Solution Section */}
                {project.solution && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-3 font-mono">
                      <Sparkles className="w-4 h-4" />
                      The Engineering & Design Solution
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                      High-Performance Custom Architecture
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                      {project.solution}
                    </p>

                    {/* Key Engineering Features Grid */}
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 font-mono">
                      Key Deliverables & Architectural Modules
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      {project.keyFeatures.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Measurable Business Results */}
                {project.results && project.results.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 font-mono">
                      <TrendingUp className="w-4 h-4" />
                      Business Impact & Verified Metrics
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                      Measurable ROI & Performance Gains
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {project.results.map((res) => (
                        <div
                          key={res.label}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center"
                        >
                          <div className="text-2xl sm:text-3xl font-black text-cyan-700 tracking-tight mb-1">
                            {res.value}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 leading-snug">
                            {res.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Summary Column */}
              <div className="lg:col-span-4 space-y-6">
                {/* Project Specs Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">
                    Project Specifications
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[10px] block mb-1">
                        Client Partner
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{project.client}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[10px] block mb-1">
                        Service Vertical
                      </span>
                      <span className="font-semibold text-cyan-800">{project.category}</span>
                    </div>

                    {project.duration && (
                      <div>
                        <span className="text-slate-500 uppercase font-mono text-[10px] block mb-1">
                          Delivery Timeline
                        </span>
                        <span className="font-semibold text-slate-800">{project.duration}</span>
                      </div>
                    )}

                    {project.year && (
                      <div>
                        <span className="text-slate-500 uppercase font-mono text-[10px] block mb-1">
                          Launch Year
                        </span>
                        <span className="font-semibold text-slate-800">{project.year}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[10px] block mb-2">
                        Applied Tech Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 font-semibold"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Consultation Banner Inside Sidebar */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onOpenEstimator(project.category)}
                      className="w-full py-3 bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-cyan-700 transition-all shadow-md shadow-cyan-600/20 cursor-pointer text-center"
                    >
                      Request Similar Project
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Related Projects Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 font-mono">
                  Explore More
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Other Featured Case Studies
                </h2>
              </div>

              <button
                onClick={onNavigateHome}
                className="text-xs font-bold uppercase tracking-wider text-cyan-700 hover:text-cyan-800 cursor-pointer hidden sm:block"
              >
                All Projects →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProject(rel.id)}
                  className="group bg-white border border-slate-200 hover:border-cyan-400 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl shadow-xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 overflow-hidden relative bg-slate-100">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-mono text-cyan-800 font-bold shadow-xs">
                        {rel.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1 mb-1.5">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {rel.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-cyan-700">
                    <span>Read Case Study</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
