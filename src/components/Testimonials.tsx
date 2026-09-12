import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';
import { TestimonialItem } from '../types';

const testimonials: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Marcus Vance',
    role: 'Chief Technology Officer',
    company: 'Apex Global Freight Ltd.',
    projectType: 'Business Website & API Integration',
    rating: 5,
    quote: 'Plexivia completely elevated our digital presence. Our previous portal was sluggish and difficult to manage. Their team delivered a custom high-performance architecture that cut load times by 70% and tripled our online freight quote inquiries within the first month.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'test-2',
    name: 'Elena Rostova',
    role: 'Founder & Head of Brand',
    company: 'Lumina Luxe Apparel',
    projectType: 'Shopify 2.0 Headless Storefront',
    rating: 5,
    quote: 'From custom eCommerce architecture to flawless Shopify 2.0 implementation, Plexivia worked with extreme precision. The checkout flow is silky smooth, and our conversion rate jumped by 184%. They are our go-to digital development partner.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'test-3',
    name: 'David Steinberg',
    role: 'VP of Product',
    company: 'NovaFlow Tech Systems',
    projectType: 'React & Node.js Web Application',
    rating: 5,
    quote: 'Finding developers who truly care about scalable code and clean architecture is rare. Plexivia built our cloud dashboard on Next.js and Node.js with zero technical compromises. Responsive, communicative, and technically brilliant.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] border-t border-[#58C1C3]/10 relative overflow-hidden w-full">
      <div className="max-w-5xl mx-auto relative z-10 w-full">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#58C1C3] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#97CC6F]" />
            Client Voices
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7F7] tracking-tight">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">Growing Businesses</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#F5F7F7]/60 mt-2">
            100% Client-Focused Solutions with long-term partnership guarantees.
          </p>
        </div>

        {/* Testimonial Box */}
        <div className="relative bg-[#0F1E22] border border-[#58C1C3]/20 rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(88,193,195,0.1)] min-h-[320px] flex flex-col justify-between">
          
          <Quote className="w-12 h-12 text-[#58C1C3]/20 absolute top-8 right-8 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 text-[#97CC6F]">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <span className="text-xs font-mono text-[#F5F7F7]/50 ml-2">
                  Verified Client Review
                </span>
              </div>

              {/* Quote text */}
              <p className="text-base sm:text-xl text-[#F5F7F7] font-medium leading-relaxed italic">
                "{current.quote}"
              </p>

              {/* Author details */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <img
                  src={current.avatarUrl}
                  alt={current.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#58C1C3]/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm sm:text-base font-bold text-[#F5F7F7]">
                      {current.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#97CC6F]" />
                  </div>
                  <p className="text-xs text-[#58C1C3]">
                    {current.role} • <span className="text-[#F5F7F7]/60">{current.company}</span>
                  </p>
                  <p className="text-[10px] font-mono text-[#97CC6F] mt-0.5">
                    Project: {current.projectType}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              {testimonials.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-[#58C1C3]' : 'w-2 bg-white/20'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-[#58C1C3]/20 hover:border-[#58C1C3] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-[#58C1C3]/20 hover:border-[#58C1C3] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
