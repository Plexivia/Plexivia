import { useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import PlexiviaLogo from './PlexiviaLogo';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenEstimator: () => void;
  onNavigateHome?: (hash?: string) => void;
}

export default function Header({ onOpenEstimator, onNavigateHome }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
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
    if (onNavigateHome) {
      onNavigateHome(href);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0C1618]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#58C1C3]/15 px-4 sm:px-6 lg:px-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center cursor-pointer"
          >
            <PlexiviaLogo size="sm" showTagline={true} />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <div className="flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-[#F5F7F7]/80">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-cyan-600 dark:hover:text-[#58C1C3] transition-colors relative py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-600 dark:bg-[#58C1C3] transition-all duration-200 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Dark/Light Mode Switcher */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-full bg-slate-100 dark:bg-[#0F1E22] border border-slate-200 dark:border-[#58C1C3]/25 text-slate-700 dark:text-[#F5F7F7] hover:border-cyan-400 dark:hover:border-[#58C1C3] transition-colors cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#97CC6F] animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </motion.button>

            <button
              onClick={onOpenEstimator}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 dark:bg-[#58C1C3] text-white dark:text-[#0C1618] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-cyan-700 dark:hover:bg-[#48b0b2] transition-all duration-300 shadow-md shadow-cyan-600/20 dark:shadow-[#58C1C3]/20 hover:shadow-lg cursor-pointer"
            >
              Get a Quote
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Mobile Nav Header Controls */}
          <div className="md:hidden flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              aria-label="Toggle theme mode"
              className="p-1.5 rounded-full bg-slate-100 dark:bg-[#0F1E22] border border-slate-200 dark:border-[#58C1C3]/25 text-slate-700 dark:text-[#F5F7F7] cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#97CC6F]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </motion.button>

            <button
              onClick={onOpenEstimator}
              className="px-3 py-1.5 bg-cyan-600 dark:bg-[#58C1C3] text-white dark:text-[#0C1618] text-[11px] font-bold rounded-full cursor-pointer shadow-sm"
            >
              Quote
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="text-slate-700 dark:text-[#F5F7F7] hover:text-cyan-600 dark:hover:text-[#58C1C3] focus:outline-none p-1.5 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-[#0F1E22] transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Progress Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 dark:from-[#97CC6F] dark:via-[#58C1C3] dark:to-[#97CC6F] origin-left"
        style={{ scaleX }}
      />

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-b border-slate-200 dark:border-[#58C1C3]/20 bg-white/98 dark:bg-[#0C1618]/98 backdrop-blur-xl px-6 py-6 shadow-xl"
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
                className="text-slate-700 dark:text-[#F5F7F7] hover:text-cyan-600 dark:hover:text-[#58C1C3] transition-colors py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800"
              >
                <span className="font-semibold">{link.name}</span>
                <span className="text-cyan-600 dark:text-[#58C1C3] text-xs">→</span>
              </a>
            ))}

            {/* Mobile Theme Switcher Bar */}
            <div className="py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-[#F5F7F7]/70 font-semibold">Theme Mode</span>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#0F1E22] border border-slate-200 dark:border-[#58C1C3]/30 text-slate-800 dark:text-[#F5F7F7] font-semibold"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#97CC6F]" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenEstimator();
                }}
                className="w-full text-center py-3 bg-cyan-600 dark:bg-[#58C1C3] text-white dark:text-[#0C1618] text-xs font-bold uppercase tracking-wider rounded-full shadow-md cursor-pointer hover:bg-cyan-700 dark:hover:bg-[#48b0b2]"
              >
                Get a Quote
              </button>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-[#F5F7F7]/80 text-xs font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
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
