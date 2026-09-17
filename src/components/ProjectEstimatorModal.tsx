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
    window.open(`mailto:support@plexivia.online?subject=${subject}&body=${body}`, '_blank');
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-slate-900"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 relative">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-semibold uppercase tracking-widest text-cyan-800 mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Instant Project Estimation
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Let's Scope Your <span className="text-cyan-700">Digital Solution</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Tell us what you're looking to build. We'll provide tailored recommendations within 24 hours.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto mb-4 text-emerald-700">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Inquiry Prepared!</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Click below to send directly via WhatsApp or Email for fastest response from our lead architects.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-md shadow-emerald-600/25"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open WhatsApp Chat (+880 1608-098281)
                  </button>
                  <button
                    onClick={handleEmailInquiry}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 transition-all cursor-pointer shadow-md shadow-cyan-600/25"
                  >
                    <Mail className="w-4 h-4" />
                    Send via Email (support@plexivia.online)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative">
                {/* Select Service */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
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
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <span>{srv}</span>
                        {selectedService === srv && <Check className="w-3.5 h-3.5 text-cyan-700" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
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
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
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
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Your Name / Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins (Acme Corp)"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sarah@acme.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Brief Project Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your goals, features, or reference links..."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all cursor-pointer shadow-md shadow-emerald-600/25"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inquire via WhatsApp (+880 1608-098281)
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailInquiry}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-cyan-700 transition-all cursor-pointer shadow-md shadow-cyan-600/25"
                  >
                    <Mail className="w-4 h-4" />
                    Send via Email (support@plexivia.online)
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
