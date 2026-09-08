import { useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import PlexiviaLogo from './PlexiviaLogo';

interface HeaderProps {
  onOpenEstimator: () => void;
}

export default function Header({ onOpenEstimator }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'About', href: '#about' },
    { name: 'Expertise', href: '#expertise' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0C1618]/90 backdrop-blur-md border-b border-[#58C1C3]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <PlexiviaLogo size="sm" showTagline={true} />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-7 text-xs font-medium text-[#F5F7F7]/70">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-[#58C1C3] transition-colors relative py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#58C1C3] transition-all duration-200 group-hover:w-full" />
                </a>
              ))}
            </div>

            <button
              onClick={onOpenEstimator}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#58C1C3] text-[#0C1618] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#97CC6F] transition-all duration-300 shadow-[0_0_20px_rgba(88,193,195,0.3)] hover:shadow-[0_0_25px_rgba(151,204,111,0.4)] cursor-pointer"
            >
              Get a Quote
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Mobile Nav Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={onOpenEstimator}
              className="px-3 py-1.5 bg-[#58C1C3] text-[#0C1618] text-[11px] font-bold rounded-full cursor-pointer"
            >
              Quote
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="text-[#F5F7F7]/70 hover:text-[#58C1C3] focus:outline-none p-1.5 cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Progress Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#97CC6F] via-[#58C1C3] to-[#97CC6F] origin-left"
        style={{ scaleX }}
      />

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-b border-[#58C1C3]/15 bg-[#0C1618]/98 backdrop-blur-xl px-6 py-6"
        >
          <div className="flex flex-col gap-4 text-sm font-medium">
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
                  setIsOpen(false);
                  onOpenEstimator();
                }}
                className="w-full text-center py-3 bg-[#58C1C3] text-[#0C1618] text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(88,193,195,0.3)] cursor-pointer"
              >
                Get a Quote
              </button>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 border border-[#58C1C3]/30 text-[#58C1C3] text-xs font-semibold rounded-full hover:bg-[#58C1C3]/10 transition-colors"
              >
                Direct Inquiry (+880 1608-098281)
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
