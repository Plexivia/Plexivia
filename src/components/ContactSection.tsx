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
    window.open(`https://wa.me/8801823110115?text=${text}`, '_blank');
  };

  const handleEmailDirect = () => {
    const subject = encodeURIComponent(`Project Inquiry: ${formData.service}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n\nProject details:\n${formData.message}`
    );
    window.open(`mailto:plexivia@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <section id="contact" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative border-t border-[#58C1C3]/15">
      {/* Ambient background glows adhering strictly to #58C1C3 and #97CC6F */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-[#58C1C3]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#97CC6F]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-xs font-semibold text-[#58C1C3] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#97CC6F]" />
            Start Your Digital Journey
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            Let’s Build Something{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              Great Together
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#F5F7F7]/65 mt-3 max-w-xl mx-auto">
            Ready to turn your ideas into a powerful digital solution? Reach out for a free discovery session and technical roadmap.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Direct Contact Info & Worldwide Badge */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Box */}
            <div className="bg-[#0F1E22] border border-[#58C1C3]/20 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#58C1C3]">
                Direct Channels
              </span>
              <h3 className="text-xl font-bold text-[#F5F7F7] mt-1 mb-6">
                Get In Touch Fast
              </h3>

              <div className="space-y-5">
                {/* Website */}
                <a
                  href="https://plexivia.online"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0C1618] border border-white/5 hover:border-[#58C1C3]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#58C1C3]/15 text-[#58C1C3] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F7F7]/40">
                      Official Domain
                    </p>
                    <p className="text-sm font-semibold text-[#F5F7F7] group-hover:text-[#58C1C3] transition-colors">
                      plexivia.online
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:plexivia@gmail.com"
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0C1618] border border-white/5 hover:border-[#58C1C3]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#97CC6F]/15 text-[#97CC6F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F7F7]/40">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-[#F5F7F7] group-hover:text-[#97CC6F] transition-colors">
                      plexivia@gmail.com
                    </p>
                  </div>
                </a>

                {/* Phone / WhatsApp */}
                <a
                  href="https://wa.me/8801823110115"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0C1618] border border-white/5 hover:border-[#58C1C3]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#58C1C3]/15 text-[#58C1C3] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F7F7]/40">
                      Phone / WhatsApp (24/7)
                    </p>
                    <p className="text-sm font-semibold text-[#F5F7F7] group-hover:text-[#58C1C3] transition-colors">
                      +880 1823-110115
                    </p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#0C1618] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#97CC6F]/15 text-[#97CC6F] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F7F7]/40">
                      Headquarters
                    </p>
                    <p className="text-sm font-semibold text-[#F5F7F7]">
                      Dhaka, Bangladesh
                    </p>
                    <p className="text-xs text-[#97CC6F] mt-0.5">
                      Serving clients worldwide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp CTA Button */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <a
                  href="https://wa.me/8801823110115?text=Hello%20Plexivia!%20I%20would%20like%20to%20consult%20on%20a%20digital%20solution."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-[0_0_20px_rgba(151,204,111,0.3)] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
              </div>
            </div>

            {/* Global Reach Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#58C1C3]/10 to-[#97CC6F]/10 border border-[#58C1C3]/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#58C1C3]/20 flex items-center justify-center text-[#58C1C3] flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#F5F7F7]">Worldwide Remote Collaboration</p>
                <p className="text-[#F5F7F7]/60 mt-0.5">
                  Seamless communication across all time zones with weekly sprint reviews.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Proposal & Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0F1E22] border border-[#58C1C3]/20 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#97CC6F]/20 border border-[#97CC6F]/40 flex items-center justify-center mx-auto mb-5 text-[#97CC6F]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F7F7] mb-2">
                    Inquiry Received!
                  </h3>
                  <p className="text-sm text-[#F5F7F7]/70 max-w-md mx-auto mb-8">
                    Thank you, <span className="text-[#58C1C3] font-semibold">{formData.name || 'friend'}</span>. A lead architect from Plexivia will review your requirements and respond within 24 hours.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleWhatsAppDirect}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Speed Up via WhatsApp
                    </button>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 rounded-full border border-white/10 text-xs font-semibold text-[#F5F7F7]/70 hover:text-white cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-white/5 pb-4 mb-2">
                    <h3 className="text-xl font-bold text-[#F5F7F7]">
                      Send Us a Message
                    </h3>
                    <p className="text-xs text-[#F5F7F7]/60 mt-1">
                      Fill out the form below or chat directly on WhatsApp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#F5F7F7]/80 mb-1.5">
                        Your Name <span className="text-[#58C1C3]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#F5F7F7]/80 mb-1.5">
                        Email Address <span className="text-[#58C1C3]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#F5F7F7]/80 mb-1.5">
                      Service of Interest
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors cursor-pointer"
                    >
                      <option value="Custom Website Development">Custom Website Development</option>
                      <option value="Software & Web Application Development">Software & Web Application Development</option>
                      <option value="WordPress & Shopify Development">WordPress & Shopify Development</option>
                      <option value="ERP Solutions & Systems">ERP Solutions & Systems</option>
                      <option value="SEO (Search Engine Optimization)">SEO (Search Engine Optimization)</option>
                      <option value="Social Media Marketing">Social Media Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#F5F7F7]/80 mb-1.5">
                      Project Details & Vision <span className="text-[#58C1C3]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your project goals, scope, desired timeline, or any reference websites..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/20 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#58C1C3] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:bg-[#97CC6F] transition-all cursor-pointer shadow-[0_0_20px_rgba(88,193,195,0.3)]"
                    >
                      <Send className="w-4 h-4" />
                      Submit Project Brief
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppDirect}
                      className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer shadow-[0_0_20px_rgba(151,204,111,0.25)]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send via WhatsApp
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-[#F5F7F7]/40 pt-2">
                    Direct inquiries also welcomed at <a href="mailto:plexivia@gmail.com" className="text-[#58C1C3] hover:underline">plexivia@gmail.com</a> or <span className="text-[#97CC6F]">+880 1823-110115</span>.
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
