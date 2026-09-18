import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Globe, ArrowUp } from 'lucide-react';
import PlexiviaLogo from './PlexiviaLogo';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/plexivia',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/plexivia',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/plexivia',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      url: 'https://github.com/plexivia',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@plexivia',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'About Us', href: '#about' },
    { label: 'Technology', href: '#expertise' },
    { label: 'Contact', href: '#contact' },
  ];

  const serviceLinks = [
    'Custom Website Development',
    'Web Application Development',
    'WordPress Development',
    'Shopify Development',
    'UI/UX Design',
    'SEO & Performance',
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-gradient-to-t from-cyan-100/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-200">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <PlexiviaLogo size="md" showTagline={true} />
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed pt-2">
              Plexivia is a Digital Development Agency helping businesses establish and grow their online presence through modern design, custom development, and scalable digital solutions.
            </p>

            {/* Official Tagline Badge */}
            <div className="inline-block pt-1">
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold shadow-xs">
                “Your Vision. Our Development.”
              </span>
            </div>

            {/* Social Media Icons */}
            <div className="pt-2">
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold mb-3">
                Connect With Us
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Follow Plexivia on ${social.name}`}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-cyan-400 text-slate-600 hover:text-cyan-700 flex items-center justify-center transition-all hover:scale-105 shadow-xs"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-cyan-700 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Core Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              {serviceLinks.map((srv) => (
                <li key={srv}>
                  <a href="#services" className="hover:text-cyan-700 transition-colors">
                    {srv}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact Information */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Global Agency Hub
            </h4>
            
            <div className="text-xs text-slate-600 space-y-2.5 font-medium">
              <a
                href="mailto:support@plexivia.online"
                className="flex items-center gap-2 hover:text-cyan-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                <span>support@plexivia.online</span>
              </a>

              <a
                href="https://wa.me/8801608098281"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-emerald-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>+880 1608-098281</span>
              </a>

              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                <span>Dhaka, Bangladesh (Serving Worldwide)</span>
              </div>

              <a
                href="https://plexivia.online"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-cyan-700 transition-colors font-mono text-cyan-700 font-semibold"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                <span>plexivia.online</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} <span className="text-slate-900 font-bold">PLEXIVIA</span>. All rights reserved. Crafting Digital Dreams.
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-emerald-700 font-semibold">
              Dhaka, Bangladesh • Worldwide
            </span>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-cyan-400 text-slate-600 hover:text-cyan-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
