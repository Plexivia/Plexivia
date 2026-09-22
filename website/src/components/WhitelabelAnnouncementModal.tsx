import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight, Zap, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WhitelabelAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore: () => void;
}

export default function WhitelabelAnnouncementModal({
  isOpen,
  onClose,
  onExplore,
}: WhitelabelAnnouncementModalProps) {
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

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0C1618]/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 25 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-gradient-to-b from-[#14262A] via-[#0F1E22] to-[#0C1618] border-2 border-[#58C1C3]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_45px_rgba(88,193,195,0.25)] z-10 overflow-hidden text-left"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#58C1C3]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#97CC6F]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close announcement"
              className="absolute top-5 right-5 p-2 rounded-full bg-[#0C1618]/70 border border-white/10 text-[#F5F7F7]/60 hover:text-[#58C1C3] hover:border-[#58C1C3]/50 transition-all cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#58C1C3]/15 border border-[#58C1C3]/35 text-[#58C1C3] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#97CC6F] animate-pulse" />
              <span>নতুন সলিউশন লঞ্চিং • Plexivia Whitelabel</span>
            </div>

            {/* Headline (Bangla) */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
              শপিফাইয়ের ডলার খরচ ও কমিশন বাদ দিয়ে—{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] via-[#85D9B0] to-[#97CC6F]">
                নিজের ব্র্যান্ডে শুরু করুন ই-কমার্স!
              </span>
            </h3>

            {/* Bengali Subtitle / Description */}
            <p className="text-xs sm:text-sm text-[#F5F7F7]/80 leading-relaxed font-light mb-6">
              প্রতি মাসে শপিফাইয়ের অ্যাপ সাবস্ক্রিপশন ও ২% কমিশন দিয়ে লাভ নষ্ট করার দিন শেষ। প্লেক্সিভিয়া নিয়ে এলো সম্পূর্ণ নিজস্ব ব্র্যান্ডেড হোয়াইটলেবেল ই-কমার্স ইঞ্জিন—যেখানে পাবেন ১-ক্লিক মোবাইল চেকআউট, লোকাল কুরিয়ার অটোমেশন এবং ফেক অর্ডার প্রতিরোধ ব্যবস্থা।
            </p>

            {/* 4 Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7 bg-[#0C1618]/70 p-4 rounded-2xl border border-white/5">
              <div className="flex items-start gap-2.5 text-xs text-[#F5F7F7]/90">
                <CheckCircle2 className="w-4 h-4 text-[#97CC6F] shrink-0 mt-0.5" />
                <span><strong>০% প্ল্যাটফর্ম ফি:</strong> বিক্রির সম্পূর্ণ লাভ আপনার</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-[#F5F7F7]/90">
                <Truck className="w-4 h-4 text-[#58C1C3] shrink-0 mt-0.5" />
                <span><strong>স্টিভফাস্ট ও পাঠাও:</strong> ১-ক্লিক অটো কুরিয়ার ডিসপ্যাচ</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-[#F5F7F7]/90">
                <Zap className="w-4 h-4 text-[#97CC6F] shrink-0 mt-0.5" />
                <span><strong>১-ক্লিক ফাস্ট চেকআউট:</strong> ৩ গুণ বেশি সেলস কনভার্সন</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-[#F5F7F7]/90">
                <ShieldCheck className="w-4 h-4 text-[#58C1C3] shrink-0 mt-0.5" />
                <span><strong>ফেক অর্ডার শিল্ড:</strong> সিওডি রিটার্ন লস কমান ৬৫% পর্যন্ত</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  onExplore();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#58C1C3] to-[#97CC6F] text-[#0C1618] font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(88,193,195,0.4)] hover:shadow-[0_0_35px_rgba(151,204,111,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>ফিচার ও ডেমো বিস্তারিত দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-[#0C1618] border border-white/10 text-[#F5F7F7]/65 hover:text-white text-xs font-semibold hover:border-white/20 transition-all cursor-pointer text-center"
              >
                পরে দেখবো
              </button>
            </div>

            {/* Bottom Guarantee Note */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#F5F7F7]/55">
              <span>🚀 ৪৮-৭২ ঘণ্টার মধ্যে লাইভ সেটআপ</span>
              <span className="text-[#97CC6F] font-semibold">১০০% ডেটা ও সোর্স ওনারশিপ</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
