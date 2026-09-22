import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MetricsBar from './components/MetricsBar';
import Services from './components/Services';
import TechExpertise from './components/TechExpertise';
import AboutSection from './components/AboutSection';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ProjectEstimatorModal from './components/ProjectEstimatorModal';
import ProjectDetailPage from './pages/ProjectDetailPage';
import EcommerceWhitelabel from './pages/EcommerceWhitelabel';
import { ThemeProvider } from './context/ThemeContext';

type ViewRoute = 
  | { type: 'home' }
  | { type: 'project'; id: string }
  | { type: 'whitelabel' };

function parseRoute(): ViewRoute {
  const path = window.location.pathname;
  if (path.startsWith('/project/')) {
    const id = path.replace('/project/', '').replace(/\/$/, '');
    if (id) return { type: 'project', id };
  }
  if (path === '/ecommerce-whitelabel' || path === '/whitelabel') {
    return { type: 'whitelabel' };
  }
  return { type: 'home' };
}

function MainContent() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>(parseRoute);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [defaultEstimatorService, setDefaultEstimatorService] = useState('Custom Website Development');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenEstimator = (service?: string) => {
    if (service) {
      setDefaultEstimatorService(service);
    }
    setIsEstimatorOpen(true);
  };

  const handleSelectProject = (id: string) => {
    window.history.pushState({}, '', `/project/${id}`);
    setCurrentRoute({ type: 'project', id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = (hash?: string) => {
    window.history.pushState({}, '', hash && hash !== '#home' ? `/${hash}` : '/');
    setCurrentRoute({ type: 'home' });
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render Project Detail Case Study Page
  if (currentRoute.type === 'project') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0C1618] text-slate-900 dark:text-[#F5F7F7] font-sans selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:text-cyan-200 flex flex-col relative transition-colors duration-300">
        <ProjectDetailPage
          projectId={currentRoute.id}
          onNavigateHome={() => handleNavigateHome('#portfolio')}
          onSelectProject={handleSelectProject}
          onOpenEstimator={handleOpenEstimator}
        />
        <ProjectEstimatorModal
          isOpen={isEstimatorOpen}
          onClose={() => setIsEstimatorOpen(false)}
          defaultService={defaultEstimatorService}
        />
      </div>
    );
  }

  // Render eCommerce Whitelabel Page
  if (currentRoute.type === 'whitelabel') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0C1618] text-slate-900 dark:text-[#F5F7F7] font-sans selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:text-cyan-200 flex flex-col relative transition-colors duration-300">
        <EcommerceWhitelabel
          onNavigateHome={() => handleNavigateHome()}
          onOpenEstimator={handleOpenEstimator}
        />
        <ProjectEstimatorModal
          isOpen={isEstimatorOpen}
          onClose={() => setIsEstimatorOpen(false)}
          defaultService={defaultEstimatorService}
        />
      </div>
    );
  }

  // Render Main Agency Landing Page
  return (
    <div className="min-h-screen bg-white dark:bg-[#0C1618] text-slate-900 dark:text-[#F5F7F7] font-sans selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:text-cyan-200 flex flex-col relative transition-colors duration-300">
      {/* Header */}
      <Header onOpenEstimator={() => handleOpenEstimator()} />

      {/* Main Sections */}
      <main className="flex-1 flex flex-col">
        {/* Main Hero Section */}
        <Hero onOpenEstimator={() => handleOpenEstimator()} />

        {/* Highlight Metrics Bar */}
        <MetricsBar />

        {/* Services Section (All 10 Services) */}
        <Services onSelectService={(serviceName) => handleOpenEstimator(serviceName)} />

        {/* Technology & Expertise */}
        <TechExpertise />

        {/* About Plexivia */}
        <AboutSection onOpenEstimator={() => handleOpenEstimator()} />

        {/* Featured Projects Portfolio (Opens Dedicated Case Study Pages) */}
        <Portfolio
          onSelectProject={handleSelectProject}
          onOpenEstimatorWithService={(serviceName) => handleOpenEstimator(serviceName)}
        />

        {/* Testimonials */}
        <Testimonials />

        {/* Contact Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Project Scoping & Estimation Modal */}
      <ProjectEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        defaultService={defaultEstimatorService}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}
