import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Custom Website Development',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Plexivia Team! I would like to build a project:\n- Name: ${formData.name || 'Visitor'}\n- Email: ${formData.email || 'N/A'}\n- Service: ${formData.service}\n- Brief: ${formData.message || 'Consultation inquiry'}`
    );
    window.open(`https://wa.me/8801608098281?text=${text}`, '_blank');
  };

  const handleEmailDirect = () => {
    const subject = encodeURIComponent(`Project Inquiry: ${formData.service}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n\nProject details:\n${formData.message}`
    );
    window.open(`mailto:support@plexivia.online?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <section id="contact" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-slate-50/70 dark:bg-[#0C1618] relative border-t border-slate-200 dark:border-[#58C1C3]/15 transition-colors">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-cyan-100/40 dark:bg-[#58C1C3]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-emerald-100/40 dark:bg-[#97CC6F]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-[#58C1C3]/10 border border-cyan-200 dark:border-[#58C1C3]/25 text-xs font-semibold text-cyan-800 dark:text-[#58C1C3] mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#97CC6F]" />
            Start Your Digital Journey
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#F5F7F7] tracking-tight">
            Let’s Build Something{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-[#58C1C3] dark:to-[#97CC6F]">
              Great Together
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#F5F7F7]/70 mt-3 max-w-xl mx-auto">
            Ready to turn your ideas into a powerful digital solution? Reach out for a free discovery session and technical roadmap.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Direct Contact Info & Worldwide Badge */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Box */}
            <div className="bg-white dark:bg-[#0F1E22] border border-slate-200/90 dark:border-[#58C1C3]/15 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/50 transition-colors">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-700 dark:text-[#58C1C3] font-bold">
                Direct Channels
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-[#F5F7F7] mt-1 mb-6">
                Get In Touch Fast
              </h3>

              <div className="space-y-4">
                {/* Website */}
                <a
                  href="https://plexivia.online"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0C1618] border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-[#58C1C3] hover:bg-white dark:hover:bg-[#14262A] transition-all group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-[#58C1C3]/20 text-cyan-700 dark:text-[#58C1C3] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#F5F7F7]/60 font-semibold">
                      Official Domain
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F7] group-hover:text-cyan-700 dark:group-hover:text-[#58C1C3] transition-colors">
                      plexivia.online
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:support@plexivia.online"
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0C1618] border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-[#58C1C3] hover:bg-white dark:hover:bg-[#14262A] transition-all group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#97CC6F]/20 text-emerald-700 dark:text-[#97CC6F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#F5F7F7]/60 font-semibold">
                      Email Address
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F7] group-hover:text-emerald-700 dark:group-hover:text-[#97CC6F] transition-colors">
                      support@plexivia.online
                    </p>
                  </div>
                </a>

                {/* Phone / WhatsApp */}
                <a
                  href="https://wa.me/8801608098281"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0C1618] border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-[#58C1C3] hover:bg-white dark:hover:bg-[#14262A] transition-all group shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-[#58C1C3]/20 text-cyan-700 dark:text-[#58C1C3] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#F5F7F7]/60 font-semibold">
                      Phone / WhatsApp (24/7)
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F7] group-hover:text-cyan-700 dark:group-hover:text-[#58C1C3] transition-colors">
                      +880 1608-098281
                    </p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0C1618] border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#97CC6F]/20 text-emerald-700 dark:text-[#97CC6F] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#F5F7F7]/60 font-semibold">
                      Headquarters
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F7]">
                      Dhaka, Bangladesh
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-[#97CC6F] mt-0.5 font-medium">
                      Serving clients worldwide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp CTA Button */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="https://wa.me/8801608098281?text=Hello%20Plexivia!%20I%20would%20like%20to%20consult%20on%20a%20digital%20solution."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-emerald-600 dark:bg-[#97CC6F] text-white dark:text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 dark:hover:bg-[#97CC6F]/90 transition-all shadow-md shadow-emerald-600/25 dark:shadow-[0_0_20px_rgba(151,204,111,0.3)] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
              </div>
            </div>

            {/* Global Reach Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-[#0F1E22] dark:to-[#14262A] border border-slate-200 dark:border-[#58C1C3]/20 flex items-center gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-[#58C1C3]/20 flex items-center justify-center text-cyan-700 dark:text-[#58C1C3] flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-[#F5F7F7]">Worldwide Remote Collaboration</p>
                <p className="text-slate-600 dark:text-[#F5F7F7]/70 mt-0.5">
                  Seamless communication across all time zones with weekly sprint reviews.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Proposal & Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#0F1E22] border border-slate-200/90 dark:border-[#58C1C3]/15 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 dark:shadow-black/50 transition-colors">
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-[#97CC6F]/20 border border-emerald-300 dark:border-[#97CC6F]/40 flex items-center justify-center mx-auto mb-5 text-emerald-700 dark:text-[#97CC6F]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-[#F5F7F7] mb-2">
                    Inquiry Received!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#F5F7F7]/70 max-w-md mx-auto mb-8">
                    Thank you, <span className="text-cyan-700 dark:text-[#58C1C3] font-bold">{formData.name || 'friend'}</span>. A lead architect from Plexivia will review your requirements and respond within 24 hours.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleWhatsAppDirect}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 dark:bg-[#97CC6F] text-white dark:text-[#0C1618] font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-emerald-700 dark:hover:bg-[#97CC6F]/90 shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Speed Up via WhatsApp
                    </button>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#14262A] cursor-pointer transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-[#F5F7F7]">
                      Send Us a Message
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#F5F7F7]/60 mt-1">
                      Fill out the form below or chat directly on WhatsApp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#F5F7F7]/90 mb-1.5">
                        Your Name <span className="text-cyan-600 dark:text-[#58C1C3]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-[#0F1E22] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:dark:border-[#58C1C3] focus:ring-2 focus:ring-cyan-100 dark:focus:ring-[#58C1C3]/20 transition-all placeholder:text-slate-400 dark:placeholder-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#F5F7F7]/90 mb-1.5">
                        Email Address <span className="text-cyan-600 dark:text-[#58C1C3]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white dark:bg-[#0F1E22] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:dark:border-[#58C1C3] focus:ring-2 focus:ring-cyan-100 dark:focus:ring-[#58C1C3]/20 transition-all placeholder:text-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#F5F7F7]/90 mb-1.5">
                      Service of Interest
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-white dark:bg-[#0F1E22] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:dark:border-[#58C1C3] focus:ring-2 focus:ring-cyan-100 dark:focus:ring-[#58C1C3]/20 transition-all cursor-pointer"
                    >
                      <option value="Custom Website Development" className="dark:bg-[#0C1618] dark:text-white">Custom Website Development</option>
                      <option value="Web Application Development" className="dark:bg-[#0C1618] dark:text-white">Web Application Development</option>
                      <option value="WordPress Development" className="dark:bg-[#0C1618] dark:text-white">WordPress Development</option>
                      <option value="Shopify Development" className="dark:bg-[#0C1618] dark:text-white">Shopify Development</option>
                      <option value="UI/UX Design" className="dark:bg-[#0C1618] dark:text-white">UI/UX Design</option>
                      <option value="Graphics Design" className="dark:bg-[#0C1618] dark:text-white">Graphics Design</option>
                      <option value="SEO" className="dark:bg-[#0C1618] dark:text-white">SEO (Search Engine Optimization)</option>
                      <option value="Video Editing & Motion Graphics" className="dark:bg-[#0C1618] dark:text-white">Video Editing & Motion Graphics</option>
                      <option value="Social Media Marketing" className="dark:bg-[#0C1618] dark:text-white">Social Media Marketing</option>
                      <option value="Business Solutions" className="dark:bg-[#0C1618] dark:text-white">Business Solutions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-[#F5F7F7]/90 mb-1.5">
                      Project Details & Vision <span className="text-cyan-600 dark:text-[#58C1C3]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your project goals, scope, desired timeline, or any reference websites..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white dark:bg-[#0F1E22] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:dark:border-[#58C1C3] focus:ring-2 focus:ring-cyan-100 dark:focus:ring-[#58C1C3]/20 transition-all placeholder:text-slate-400 dark:placeholder-slate-500 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-cyan-600 dark:bg-[#58C1C3] text-white dark:text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:bg-cyan-700 dark:hover:bg-[#58C1C3]/90 transition-all cursor-pointer shadow-md shadow-cyan-600/25 dark:shadow-[0_0_20px_rgba(88,193,195,0.3)]"
                    >
                      <Send className="w-4 h-4" />
                      Submit Project Brief
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppDirect}
                      className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-emerald-600 dark:bg-[#97CC6F] text-white dark:text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 dark:hover:bg-[#97CC6F]/90 transition-all cursor-pointer shadow-md shadow-emerald-600/25 dark:shadow-[0_0_20px_rgba(151,204,111,0.3)]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send via WhatsApp
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-500 dark:text-[#F5F7F7]/60 pt-2">
                    Direct inquiries also welcomed at <a href="mailto:support@plexivia.online" className="text-cyan-700 dark:text-[#58C1C3] hover:underline font-semibold">support@plexivia.online</a> or <span className="text-emerald-700 dark:text-[#97CC6F] font-semibold">+880 1608-098281</span>.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
