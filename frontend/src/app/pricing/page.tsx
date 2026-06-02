'use client';
import { useLanguage } from '@/i18n/LanguageContext';
import Pricing from '@/components/Pricing';

export default function PricingPage() {
  const { t } = useLanguage();
  return (
    <div className="bg-black pt-20">
      {/* Pricing Hero */}
      <section className="py-20 sm:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">{t.pricing.title}</h1>
          <p className="text-white/40 max-w-xl mx-auto text-base sm:text-lg">{t.pricing.subtitle}</p>
        </div>
      </section>

      <Pricing />
    </div>
  );
}
