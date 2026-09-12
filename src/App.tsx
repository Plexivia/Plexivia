import { useState, useEffect, lazy, Suspense } from 'react';
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
import WhitelabelAnnouncementModal from './components/WhitelabelAnnouncementModal';

const EcommerceWhitelabel = lazy(() => import('./pages/EcommerceWhitelabel'));

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [defaultEstimatorService, setDefaultEstimatorService] = useState('Custom Website Development');
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  const isWhitelabelPage =
    currentPath === '/ecommerce-whitelabel' ||
    currentPath === '/ecommerce-whitelabel/' ||
    currentPath === '/whitelabel-ecommerce' ||
    currentPath === '/whitelabel-ecommerce/';

  useEffect(() => {
    if (isWhitelabelPage) {
      document.title = 'Plexivia - Enterprise eCommerce Whitelabel Platform | 0% Cuts';
    } else {
      document.title = 'Plexivia - Digital Development Agency';
    }
  }, [isWhitelabelPage]);

  // Trigger Whitelabel Announcement Modal 0.5s after load on home page
  useEffect(() => {
    if (isWhitelabelPage) return;

    const hasSeen = sessionStorage.getItem('plexivia_whitelabel_modal_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsAnnouncementOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isWhitelabelPage]);

  const handleCloseAnnouncement = () => {
    sessionStorage.setItem('plexivia_whitelabel_modal_seen', 'true');
    setIsAnnouncementOpen(false);
  };

  const handleExploreFromAnnouncement = () => {
    sessionStorage.setItem('plexivia_whitelabel_modal_seen', 'true');
    setIsAnnouncementOpen(false);
    navigateTo('/ecommerce-whitelabel');
  };

  const handleOpenEstimator = (service?: string) => {
    if (service) {
      setDefaultEstimatorService(service);
    }
    setIsEstimatorOpen(true);
  };

  return (
    <>
      {isWhitelabelPage ? (
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#0C1618] flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-2 border-[#58C1C3] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#58C1C3] font-mono tracking-widest uppercase">Loading Whitelabel Engine...</span>
            </div>
          }
        >
          <EcommerceWhitelabel
            onNavigateHome={() => navigateTo('/')}
            onOpenEstimator={(serviceName) => handleOpenEstimator(serviceName || 'Ecommerce Whitelabel Platform')}
          />
        </Suspense>
      ) : (
        <div className="min-h-screen bg-[#0C1618] text-[#F5F7F7] font-sans selection:bg-[#58C1C3]/30 selection:text-[#58C1C3] flex flex-col relative w-full max-w-full overflow-x-hidden">
          {/* Header */}
          <Header
            onOpenEstimator={() => handleOpenEstimator()}
            onNavigateWhitelabel={() => navigateTo('/ecommerce-whitelabel')}
          />

          {/* Main Sections */}
          <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
            {/* Main Hero Section */}
            <Hero onOpenEstimator={() => handleOpenEstimator()} />

            {/* Highlight Metrics Bar */}
            <MetricsBar />

            {/* Services Section (All 6 Core Services + Whitelabel Feature) */}
            <Services
              onSelectService={(serviceName) => handleOpenEstimator(serviceName)}
              onNavigateWhitelabel={() => navigateTo('/ecommerce-whitelabel')}
            />

            {/* Technology & Expertise */}
            <TechExpertise />

            {/* About Plexivia */}
            <AboutSection onOpenEstimator={() => handleOpenEstimator()} />

            {/* Featured Projects Portfolio */}
            <Portfolio onOpenEstimatorWithService={(serviceName) => handleOpenEstimator(serviceName)} />

            {/* Testimonials */}
            <Testimonials />

            {/* Contact Section */}
            <ContactSection />
          </main>

          {/* Footer */}
          <Footer
            onNavigateWhitelabel={() => navigateTo('/ecommerce-whitelabel')}
          />
        </div>
      )}

      {/* Interactive Project Scoping & Estimation Modal */}
      <ProjectEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        defaultService={defaultEstimatorService}
      />

      {/* Whitelabel Announcement Modal (Triggered 0.5s after load on home) */}
      <WhitelabelAnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={handleCloseAnnouncement}
        onExplore={handleExploreFromAnnouncement}
      />
    </>
  );
}
