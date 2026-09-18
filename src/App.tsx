import { useState } from 'react';
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

export default function App() {
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [defaultEstimatorService, setDefaultEstimatorService] = useState('Custom Website Development');

  const handleOpenEstimator = (service?: string) => {
    if (service) {
      setDefaultEstimatorService(service);
    }
    setIsEstimatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-500/20 selection:text-cyan-900 flex flex-col relative">
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

        {/* Featured Projects Portfolio */}
        <Portfolio onOpenEstimatorWithService={(serviceName) => handleOpenEstimator(serviceName)} />

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
