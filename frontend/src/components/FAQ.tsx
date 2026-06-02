'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 lg:p-6 text-left"
      >
        <span className="text-base lg:text-lg font-medium text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 lg:px-6 pb-5 lg:pb-6">
          <p className="text-dark-300 text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
    <section id="faq" ref={sectionRef} className="relative py-24 bg-dark-950 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="section-title gradient-text">{t.faq.title}</h2>
          <p className="section-subtitle">{t.faq.subtitle}</p>
        </div>

        {/* FAQ Items */}
        <div className="animate-on-scroll max-w-3xl mx-auto space-y-4">
          {t.faq.items.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
