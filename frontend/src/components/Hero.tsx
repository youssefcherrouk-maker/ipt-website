'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-900"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container-custom relative z-10 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="animate-on-scroll inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
          <span className="text-sm text-dark-200">{t.hero.badge}</span>
        </div>

        {/* Title */}
        <h1 className="animate-on-scroll text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
          <span className="gradient-text">{t.hero.title}</span>
          <br />
          <span className="text-white">{t.hero.title2}</span>
          <br />
          <span className="text-white/40">{t.hero.title3}</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-on-scroll text-lg sm:text-xl text-dark-200 max-w-3xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a href="#pricing" className="btn-gold text-lg px-8 py-4 shadow-gold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.hero.ctaTrial}
          </a>
          <a href="#features" className="btn-outline text-lg px-8 py-4">
            {t.hero.ctaBrowse}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div className="animate-on-scroll grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '20,000+', label: t.home.statsChannels },
            { value: '50,000+', label: t.home.statsUsers },
            { value: '99.9%', label: t.home.statsUptime },
            { value: '4K HDR', label: t.home.statsQuality },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-dark-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
