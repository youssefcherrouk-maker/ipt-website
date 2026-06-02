'use client';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { submitContact } from '@/utils/api';

export default function ContactPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <div className="bg-black pt-20">
      {/* Hero */}
      <section className="py-16 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">{t.contact.title}</h1>
          <p className="text-white/40 max-w-xl mx-auto">{t.contact.subtitle}</p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">{t.contact?.email || 'Email'}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contact?.emailPlaceholder || 'your@email.com'}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">{t.contact?.message || 'Message'}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.contact?.messagePlaceholder || 'How can we help you?'}
                    rows={5}
                    className="input-field resize-none"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? t.pricing?.processing || 'Sending...' : t.contact?.send || 'Send Message'}
                </button>
                {success && (
                  <div className="flex items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-300">{t.contact?.success || 'Message sent!'}</span>
                  </div>
                )}
              </form>
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <h3 className="text-2xl font-bold text-white">{t.contact?.info?.title || 'Contact Information'}</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/40">{t.contact?.info?.email || 'Email'}</p>
                    <p className="text-white">support@iptvpremium.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-600/20 border border-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/40">WhatsApp</p>
                    <p className="text-white">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/40">Response Time</p>
                    <p className="text-white">Average: &lt; 5 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
