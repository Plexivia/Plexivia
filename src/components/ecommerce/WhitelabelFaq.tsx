import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Can I use my own custom domain, logo, and branding?',
    a: 'Absolutely. It is 100% white-labeled. Your customers, staff, and partners will only see your brand identity, logo, domain, and colors. Your storefront, admin dashboard, automated SMS, email invoices, and shipping labels contain zero mention of Plexivia.',
  },
  {
    q: 'How does automated courier dispatch work with Steadfast, Pathao, and RedX?',
    a: 'You simply input your courier API credentials in your admin dashboard once. When orders arrive, you can click "Dispatch" individually or select 50+ orders simultaneously for bulk booking. The system connects directly to the courier API, books the parcels, assigns tracking numbers, sends automated SMS to customers, and generates thermal barcode shipping slips ready for your label printer.',
  },
  {
    q: 'Do you take any percentage cut or transaction fees from my sales?',
    a: 'No. Zero percent (0%). Unlike Shopify which penalizes you with a 0.5% - 2.0% transaction fee unless you use their proprietary gateway, Plexivia White-label charges zero commission. You keep 100% of your hard-earned revenue.',
  },
  {
    q: 'How does the Fake Order / Return Prevention shield protect my COD profit?',
    a: 'Cash on delivery return rates (RTO) are the biggest profit killer in Bangladesh eCommerce. Our shield checks the customer phone number against courier delivery success records, flags serial cancelers or fake competitor orders, and warns your team before dispatching. You can also toggle 1-click SMS OTP verification for high-risk orders.',
  },
  {
    q: 'Can I migrate my existing products and customer data from Shopify or WooCommerce?',
    a: 'Yes, seamlessly. Our technical team handles the data migration for you, importing all product listings, images, variants, categories, and customer order history so you experience zero downtime and zero data loss.',
  },
  {
    q: 'Can we customize the platform or add custom features later?',
    a: 'Yes! Unlike rigid SaaS platforms that restrict code access, Plexivia White-label is built on a modern TypeScript, React/Next.js, and Node.js architecture. Our team can build custom ERP bridges, specialized checkout workflows, multi-vendor marketplaces, or unique product configurators anytime.',
  },
  {
    q: 'How fast can our eCommerce store go live?',
    a: 'Our turnkey starter setup is typically fully deployed, configured, and live under your domain within 48 to 72 hours after product catalog submission.',
  },
];

export default function WhitelabelFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-12 bg-[#0C1618] relative overflow-hidden w-full">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58C1C3]/10 border border-[#58C1C3]/20 text-[#58C1C3] text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F7F7] tracking-tight">
            Everything You Need To Know Before{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58C1C3] to-[#97CC6F]">
              Launching
            </span>
          </h2>

          <p className="text-[#F5F7F7]/70 text-sm sm:text-base mt-4">
            Have questions about architecture, courier integrations, or data ownership? Here are the facts.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#0F1E22] border border-[#58C1C3]/15 hover:border-[#58C1C3]/40 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white pr-2">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg bg-[#14262A] border border-white/5 flex items-center justify-center text-[#58C1C3] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#58C1C3] text-[#0C1618]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#F5F7F7]/75 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
