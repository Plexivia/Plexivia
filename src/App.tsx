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
    <div className="min-h-screen bg-[#0C1618] text-[#F5F7F7] font-sans selection:bg-[#58C1C3]/30 selection:text-[#58C1C3] flex flex-col relative">
      {/* Header */}
      <Header onOpenEstimator={() => handleOpenEstimator()} />

      {/* Main Sections */}
      <main className="flex-1 flex flex-col">
        {/* Main Hero Section */}
        <Hero onOpenEstimator={() => handleOpenEstimator()} />

        {/* Highlight Metrics Bar */}
        <MetricsBar />

        {/* Services Section (All 6 Core Services) */}
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
