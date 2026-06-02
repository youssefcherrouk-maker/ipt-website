'use client';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function FAQPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="bg-black pt-20">
      {/* Hero */}
      <section className="py-16 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">{t.faq.title}</h1>
          <p className="text-white/40 max-w-xl mx-auto">{t.faq.subtitle}</p>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {t.faq.items.map((item, i) => (
              <div key={i} className="glass-card overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="text-base sm:text-lg font-medium text-white pr-4">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
