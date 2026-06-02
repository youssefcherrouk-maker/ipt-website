'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { submitContact } from '@/utils/api';

export default function Contact() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setLoading(true);
    const result = await submitContact(email, message);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } else {
      alert(result.message || 'Failed to send message');
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="relative py-24 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="animate-on-scroll text-center mb-16">
          <h2 className="section-title gradient-text">{t.contact.title}</h2>
          <p className="section-subtitle">{t.contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="animate-on-scroll">
            <form onSubmit={handleSubmit} className="glass-card p-6 lg:p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">{t.contact.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.contact.emailPlaceholder}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">{t.contact.message}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  rows={5}
                  className="input-field resize-none"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t.pricing.processing : t.contact.send}
              </button>
              {success && (
                <div className="flex items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-300">{t.contact.success}</span>
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="animate-on-scroll flex flex-col justify-center space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-6">{t.contact.info.title}</h3>
              <div className="space-y-5">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-dark-300">{t.contact.info.email}</p>
                    <a href="mailto:support@iptvpremium.com" className="text-white hover:text-purple-300 transition-colors">
                      support@iptvpremium.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-green-600/20 border border-green-500/20 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-dark-300">WhatsApp</p>
                    <p className="text-white">{t.contact.info.whatsapp}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-dark-300">{t.contact.info.response}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
