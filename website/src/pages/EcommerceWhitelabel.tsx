import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowLeft, Sparkles, Menu, X, ArrowUpRight, Phone } from 'lucide-react';
import PlexiviaLogo from '../components/PlexiviaLogo';
import WhitelabelHero from '../components/ecommerce/WhitelabelHero';
import WhitelabelComparison from '../components/ecommerce/WhitelabelComparison';
import WhitelabelFeatures from '../components/ecommerce/WhitelabelFeatures';
import WhitelabelRoiCalculator from '../components/ecommerce/WhitelabelRoiCalculator';
import WhitelabelDemoPreview from '../components/ecommerce/WhitelabelDemoPreview';
import WhitelabelPricing from '../components/ecommerce/WhitelabelPricing';
import WhitelabelFaq from '../components/ecommerce/WhitelabelFaq';
import WhitelabelCtaBanner from '../components/ecommerce/WhitelabelCtaBanner';
import Footer from '../components/Footer';

interface EcommerceWhitelabelProps {
  onNavigateHome: () => void;
  onOpenEstimator: (serviceName?: string) => void;
}

export default function EcommerceWhitelabel({
  onNavigateHome,
  onOpenEstimator,
}: EcommerceWhitelabelProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Scroll to top on initial page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navLinks = [
    { name: 'Comparison', href: '#comparison' },
    { name: 'Features', href: '#features' },
    { name: 'ROI Calculator', href: '#roi-calculator' },
    { name: 'Architecture', href: '#demo' },
    { name: 'Packages', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleOpenDemoModal = () => {
    onOpenEstimator('Ecommerce Whitelabel Platform');
  };

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1618] text-[#F5F7F7] font-sans selection:bg-[#58C1C3]/30 selection:text-[#58C1C3] flex flex-col relative w-full max-w-full overflow-x-hidden">
      
      {/* Dedicated Whitelabel Subpage Header */}
      <header className="sticky top-0 z-40 bg-[#0C1618]/90 backdrop-blur-md border-b border-[#58C1C3]/15 px-4 sm:px-6 lg:px-12 w-full">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Logo & Back Link */}
            <div className="flex items-center gap-6">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 text-xs text-[#58C1C3] hover:text-[#97CC6F] transition-colors py-1.5 px-3 rounded-full bg-[#14262A] border border-[#58C1C3]/20 cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Agency</span>
              </button>

              <div className="flex items-center gap-2.5">
                <PlexiviaLogo size="sm" showTagline={false} />
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#97CC6F]/15 text-[#97CC6F] text-[11px] font-bold uppercase tracking-wider border border-[#97CC6F]/30">
                  Whitelabel Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              <div className="flex items-center gap-6 text-xs font-medium text-[#F5F7F7]/75">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="hover:text-[#58C1C3] transition-colors relative py-1"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <button
                onClick={handleOpenDemoModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-[0_0_25px_rgba(151,204,111,0.4)] transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Book a Live Demo</span>
              </button>
            </nav>

            {/* Mobile Nav Button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={handleOpenDemoModal}
                className="px-3 py-1.5 bg-[#58C1C3] text-[#0C1618] text-[11px] font-bold rounded-full cursor-pointer"
              >
                Demo
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="text-[#F5F7F7]/70 hover:text-[#58C1C3] p-1.5 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#97CC6F] via-[#58C1C3] to-[#97CC6F] origin-left"
          style={{ scaleX }}
        />

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-[#58C1C3]/15 bg-[#0C1618]/98 backdrop-blur-xl px-6 py-6"
          >
            <div className="flex flex-col gap-3 text-sm font-medium">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateHome();
                }}
                className="text-left text-[#58C1C3] font-semibold py-1.5 flex items-center justify-between border-b border-white/5"
              >
                <span>← Back to Plexivia Agency</span>
              </button>

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="text-[#F5F7F7]/80 hover:text-[#58C1C3] transition-colors py-1.5 flex items-center justify-between border-b border-white/5"
                >
                  <span>{link.name}</span>
                  <span className="text-[#58C1C3]/40 text-xs">→</span>
                </a>
              ))}

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenDemoModal();
                  }}
                  className="w-full text-center py-3 bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg cursor-pointer"
                >
                  Book a Live Demo
                </button>
                <a
                  href="https://wa.me/8801823110115?text=Hello%20Plexivia,%20I%20want%20to%20learn%20more%20about%20your%20Ecommerce%20Whitelabel%20Platform."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 border border-[#58C1C3]/30 text-[#58C1C3] text-xs font-semibold rounded-full hover:bg-[#58C1C3]/10 transition-colors"
                >
                  Direct WhatsApp (+880 1823-110115)
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Whitelabel Sections */}
      <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        {/* 1. Hero */}
        <WhitelabelHero onOpenDemoModal={handleOpenDemoModal} />

        {/* 2. Honest Comparison with Shopify & WooCommerce */}
        <div id="comparison" className="w-full overflow-hidden">
          <WhitelabelComparison onOpenDemoModal={handleOpenDemoModal} />
        </div>

        {/* 3. Deep Features Grid */}
        <WhitelabelFeatures onOpenDemoModal={handleOpenDemoModal} />

        {/* 4. Interactive ROI & Savings Calculator */}
        <WhitelabelRoiCalculator onOpenDemoModal={handleOpenDemoModal} />

        {/* 5. Product Architecture & Tabbed Demo Tour */}
        <WhitelabelDemoPreview onOpenDemoModal={handleOpenDemoModal} />

        {/* 6. Pricing & Deployment Tiers */}
        <WhitelabelPricing onOpenDemoModal={handleOpenDemoModal} />

        {/* 7. FAQ */}
        <WhitelabelFaq />

        {/* 8. Closing Conversion Pitch Banner */}
        <WhitelabelCtaBanner onOpenDemoModal={handleOpenDemoModal} />
      </main>

      {/* Footer */}
      <Footer onNavigateHome={onNavigateHome} />
    </div>
  );
}
