import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MessageSquare, Mail, Sparkles, ArrowRight } from 'lucide-react';

interface ProjectEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

const serviceOptions = [
  'Custom Website Development',
  'Web Application Development',
  'WordPress Development',
  'Shopify Development',
  'UI/UX Design',
  'Graphics Design',
  'SEO Optimization',
  'Video Editing & Motion Graphics',
  'Social Media Marketing',
  'Business Solutions',
];

const budgetRanges = [
  '$500 - $1,500 (Starter)',
  '$1,500 - $3,500 (Growth)',
  '$3,500 - $8,000 (Enterprise)',
  '$8,000+ (Full-Scale Custom)',
];

const timelineOptions = [
  'Urgent (< 2 weeks)',
  '2 - 4 weeks',
  '1 - 2 months',
  'Flexible / Ongoing',
];

export default function ProjectEstimatorModal({
  isOpen,
  onClose,
  defaultService,
}: ProjectEstimatorModalProps) {
  const [selectedService, setSelectedService] = useState<string>(
    defaultService || 'Custom Website Development'
  );
  const [selectedBudget, setSelectedBudget] = useState<string>(budgetRanges[1]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>(timelineOptions[1]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const generateMessage = () => {
    return `Hello Plexivia Team!

I'm interested in starting a project:
- Service: ${selectedService}
- Estimated Budget: ${selectedBudget}
- Preferred Timeline: ${selectedTimeline}
${clientName ? `- Name: ${clientName}` : ''}
${clientEmail ? `- Email: ${clientEmail}` : ''}
${projectNotes ? `- Project Brief: ${projectNotes}` : ''}

Looking forward to your quotation and consultation!`;
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/8801608098281?text=${text}`, '_blank');
  };

  const handleEmailInquiry = () => {
    const subject = encodeURIComponent(`Project Inquiry: ${selectedService} - Plexivia`);
    const body = encodeURIComponent(generateMessage());
    window.open(`mailto:plexivia@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0C1618]/85 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-[#0C1618] border border-[#58C1C3]/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(88,193,195,0.15)] z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#58C1C3]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#97CC6F]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 relative">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/30 text-[10px] font-semibold uppercase tracking-widest text-[#58C1C3] mb-2">
                  <Sparkles className="w-3 h-3 text-[#97CC6F]" />
                  Instant Project Estimation
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F7F7]">
                  Let's Scope Your <span className="text-[#58C1C3]">Digital Solution</span>
                </h3>
                <p className="text-sm text-[#F5F7F7]/60 mt-1">
                  Tell us what you're looking to build. We'll provide tailored recommendations within 24 hours.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#F5F7F7]/50 hover:text-[#F5F7F7] hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-[#97CC6F]/20 border border-[#97CC6F]/40 flex items-center justify-center mx-auto mb-4 text-[#97CC6F]">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#F5F7F7] mb-2">Inquiry Prepared!</h4>
                <p className="text-sm text-[#F5F7F7]/70 max-w-md mx-auto mb-6">
                  Click below to send directly via WhatsApp or Email for fastest response from our lead architects.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-sm hover:brightness-105 transition-all cursor-pointer shadow-[0_0_20px_rgba(151,204,111,0.3)]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open WhatsApp Chat (+880 1608-098281)
                  </button>
                  <button
                    onClick={handleEmailInquiry}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#58C1C3] text-[#0C1618] font-bold text-sm hover:brightness-105 transition-all cursor-pointer shadow-[0_0_20px_rgba(88,193,195,0.3)]"
                  >
                    <Mail className="w-4 h-4" />
                    Send via Email (plexivia@gmail.com)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative">
                {/* Select Service */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-2.5">
                    1. Select Service Needed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serviceOptions.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`text-left text-xs p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedService === srv
                            ? 'bg-[#58C1C3]/15 border-[#58C1C3] text-[#F5F7F7] font-semibold'
                            : 'bg-white/[0.02] border-white/5 text-[#F5F7F7]/60 hover:bg-white/[0.06] hover:text-[#F5F7F7]'
                        }`}
                      >
                        <span>{srv}</span>
                        {selectedService === srv && <Check className="w-3.5 h-3.5 text-[#58C1C3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-2.5">
                    2. Estimated Project Budget
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {budgetRanges.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBudget(b)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          selectedBudget === b
                            ? 'bg-[#97CC6F]/15 border-[#97CC6F] text-[#F5F7F7] font-semibold'
                            : 'bg-white/[0.02] border-white/5 text-[#F5F7F7]/60 hover:bg-white/[0.05]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-2.5">
                    3. Target Timeline
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timelineOptions.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTimeline(t)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          selectedTimeline === t
                            ? 'bg-[#58C1C3]/15 border-[#58C1C3] text-[#F5F7F7] font-semibold'
                            : 'bg-white/[0.02] border-white/5 text-[#F5F7F7]/60 hover:bg-white/[0.05]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#F5F7F7]/70 mb-1">
                      Your Name / Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins (Acme Corp)"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#F5F7F7]/70 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sarah@acme.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#F5F7F7]/70 mb-1">
                    Brief Project Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your goals, features, or reference links..."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/20 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer shadow-[0_0_25px_rgba(151,204,111,0.25)]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inquire via WhatsApp (+880 1608-098281)
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailInquiry}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#58C1C3] text-[#0C1618] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer shadow-[0_0_25px_rgba(88,193,195,0.25)]"
                  >
                    <Mail className="w-4 h-4" />
                    Send to plexivia@gmail.com
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
