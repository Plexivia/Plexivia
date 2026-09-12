import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Mail, Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import TurnstileWidget from './TurnstileWidget';

interface ProjectEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

const serviceOptions = [
  'Ecommerce Whitelabel Platform',
  'Custom Website Development',
  'Software & Web Application Development',
  'WordPress & Shopify Development',
  'ERP Solutions & Systems',
  'SEO (Search Engine Optimization)',
  'Social Media Marketing',
];

const timelineOptions = [
  'Urgent (< 2 weeks)',
  '2 - 4 weeks',
  '1 - 2 months',
  'Flexible / Ongoing',
];

const countryCodes = [
  { code: '+880', label: 'BD (+880)', flag: '🇧🇩' },
  { code: '+1', label: 'US/CA (+1)', flag: '🇺🇸' },
  { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: '+966', label: 'KSA (+966)', flag: '🇸🇦' },
  { code: '+91', label: 'IN (+91)', flag: '🇮🇳' },
  { code: '+61', label: 'AU (+61)', flag: '🇦🇺' },
  { code: '+49', label: 'DE (+49)', flag: '🇩🇪' },
  { code: '+33', label: 'FR (+33)', flag: '🇫🇷' },
  { code: '+65', label: 'SG (+65)', flag: '🇸🇬' },
  { code: '+60', label: 'MY (+60)', flag: '🇲🇾' },
  { code: '+974', label: 'QA (+974)', flag: '🇶🇦' },
  { code: '+965', label: 'KW (+965)', flag: '🇰🇼' },
  { code: '+31', label: 'NL (+31)', flag: '🇳🇱' },
  { code: '+39', label: 'IT (+39)', flag: '🇮🇹' },
  { code: '+34', label: 'ES (+34)', flag: '🇪🇸' },
  { code: '+41', label: 'CH (+41)', flag: '🇨🇭' },
  { code: '+46', label: 'SE (+46)', flag: '🇸🇪' },
  { code: '+81', label: 'JP (+81)', flag: '🇯🇵' },
  { code: '+82', label: 'KR (+82)', flag: '🇰🇷' },
  { code: '+86', label: 'CN (+86)', flag: '🇨🇳' },
  { code: '+92', label: 'PK (+92)', flag: '🇵🇰' },
];

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ProjectEstimatorModal({
  isOpen,
  onClose,
  defaultService,
}: ProjectEstimatorModalProps) {
  const [selectedService, setSelectedService] = useState<string>(
    defaultService || 'Custom Website Development'
  );
  const [selectedTimeline, setSelectedTimeline] = useState<string>(timelineOptions[1]);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    if (defaultService) {
      setSelectedService(defaultService);
    }
  }, [defaultService, isOpen]);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};

    if (!clientName.trim()) {
      newErrors.name = 'Please enter your name';
    }

    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    if (!digitsOnly) {
      newErrors.phone = 'Phone number is required';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clientEmail.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailPattern.test(clientEmail.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMessage = () => {
    return `Hello Plexivia Team!
I am interested in commissioning a project:

- Selected Service: ${selectedService}
- Target Timeline: ${selectedTimeline}
- Client Name: ${clientName.trim()}
${clientCompany.trim() ? `- Company / Organization: ${clientCompany.trim()}\n` : ''}- Phone: ${countryCode} ${phoneNumber.trim()}
- Email: ${clientEmail.trim()}
${projectNotes.trim() ? `\nProject Brief / Message:\n${projectNotes.trim()}` : ''}

Looking forward to your quotation and consultation!`;
  };

  const handleWhatsAppInquiry = () => {
    if (!validateForm()) return;
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/8801823110115?text=${text}`, '_blank');
  };

  const handleSendMessage = async () => {
    if (!validateForm()) return;
    if (!turnstileToken) {
      setSubmitError('Please complete the Cloudflare CAPTCHA verification.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clientName.trim(),
          email: clientEmail.trim(),
          phone: `${countryCode} ${phoneNumber.trim()}`,
          service: selectedService,
          message: generateMessage(),
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Failed to submit inquiry. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'A network error occurred. Please try again or connect via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setSubmitError('');
      setTurnstileToken('');
      setErrors({});
    }, 300);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#0C1618]/85 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-[#0C1618] border border-[#58C1C3]/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(88,193,195,0.15)] z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden"
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
                onClick={handleClose}
                aria-label="Close modal"
                className="p-2 text-[#97CC6F] border border-[#97CC6F] hover:bg-[#97CC6F] hover:text-[#0C1618] rounded-full transition-all cursor-pointer shadow-[0_0_10px_rgba(151,204,111,0.2)]"
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
                  Thank you, <span className="text-[#58C1C3] font-semibold">{clientName || 'friend'}</span>. Your inquiry has been generated. You can also connect directly on WhatsApp for an immediate response.
                </p>
                <div className="flex flex-row gap-3 justify-center max-w-md mx-auto w-full">
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="w-1/2 flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#58C1C3] transition-all cursor-pointer shadow-[0_0_20px_rgba(151,204,111,0.25)] hover:shadow-[0_0_20px_rgba(88,193,195,0.35)]"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-1/2 flex-1 inline-flex items-center justify-center py-3 px-4 rounded-full border border-[#97CC6F] text-xs sm:text-sm font-bold uppercase tracking-wider text-[#97CC6F] hover:bg-[#97CC6F] hover:text-[#0C1618] cursor-pointer transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative">
                {/* 1. Select Service */}
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

                {/* 2. Timeline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58C1C3] mb-2.5">
                    2. Target Timeline
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

                {/* Form Input Fields */}
                <div className="space-y-4 pt-1">
                  {/* Name & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#F5F7F7]/80 mb-1.5">
                        Name <span className="text-[#58C1C3]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        value={clientName}
                        onChange={(e) => {
                          setClientName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full bg-[#0C1618] border rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7F7] focus:outline-none transition-colors placeholder:text-white/25 ${
                          errors.name
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-white/10 focus:border-[#58C1C3]'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F5F7F7]/80 mb-1.5">
                        Company <span className="text-white/40 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/25"
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#F5F7F7]/80 mb-1.5">
                        Phone <span className="text-[#58C1C3]">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-[#0C1618] border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors cursor-pointer max-w-[105px]"
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code} value={c.code} className="bg-[#0C1618] text-[#F5F7F7]">
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                          }}
                          className={`flex-1 min-w-0 bg-[#0C1618] border rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7F7] focus:outline-none transition-colors placeholder:text-white/25 ${
                            errors.phone
                              ? 'border-rose-500 focus:border-rose-500'
                              : 'border-white/10 focus:border-[#58C1C3]'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#F5F7F7]/80 mb-1.5">
                        Email <span className="text-[#58C1C3]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. sarah@acme.com"
                        value={clientEmail}
                        onChange={(e) => {
                          setClientEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        className={`w-full bg-[#0C1618] border rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7F7] focus:outline-none transition-colors placeholder:text-white/25 ${
                          errors.email
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-white/10 focus:border-[#58C1C3]'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Message (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F7F7]/80 mb-1.5">
                      Message <span className="text-white/40 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe your goals, features, or reference links..."
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      className="w-full bg-[#0C1618] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7F7] focus:outline-none focus:border-[#58C1C3] transition-colors placeholder:text-white/25 resize-none"
                    />
                  </div>
                </div>

                {/* Cloudflare Turnstile Anti-Spam CAPTCHA */}
                <div className="pt-1">
                  <TurnstileWidget
                    onVerify={(token) => {
                      setTurnstileToken(token);
                      setSubmitError('');
                    }}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setSubmitError('Cloudflare CAPTCHA verification failed. Please refresh.')}
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* 50-50 Action Buttons with Invert Hover */}
                <div className="pt-2 flex flex-row gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="w-1/2 flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#97CC6F] text-[#0C1618] font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#58C1C3] transition-all cursor-pointer shadow-[0_0_20px_rgba(151,204,111,0.25)] hover:shadow-[0_0_20px_rgba(88,193,195,0.35)]"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSendMessage}
                    className="w-1/2 flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#58C1C3] text-[#0C1618] font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#97CC6F] transition-all cursor-pointer shadow-[0_0_20px_rgba(88,193,195,0.25)] hover:shadow-[0_0_20px_rgba(151,204,111,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
