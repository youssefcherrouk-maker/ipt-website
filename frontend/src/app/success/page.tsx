'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import Navbar from '@/components/Navbar';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid opacity-30" />
      <div className="relative z-10 max-w-lg w-full">
        <div className="glass-card p-8 lg:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-dark-700/50 mx-auto mb-6 animate-pulse" />
          <div className="h-8 bg-dark-700/50 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-dark-700/50 rounded w-full mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-dark-700/50 rounded w-5/6 mx-auto mb-6 animate-pulse" />
          <div className="h-16 bg-dark-700/50 rounded-xl w-full mb-6 animate-pulse" />
          <div className="h-12 bg-dark-700/50 rounded-xl w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SuccessContent() {
  const { t, lang, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const orderId = searchParams.get('orderId');
  const plan = searchParams.get('plan');
  const email = searchParams.get('email');
  const isTrial = plan === 'free';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-30" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="max-w-lg w-full">
          <div className="glass-card p-8 lg:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-glow">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
              {isTrial ? t.success.trialTitle : t.success.title}
            </h1>

            <p className="text-dark-200 mb-6 leading-relaxed">
              {isTrial ? t.success.trialMessage : t.success.message}
            </p>

            {email && (
              <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-600/30 mb-6">
                <p className="text-sm text-dark-300 mb-1">{t.success.emailSent}</p>
                <p className="text-base font-semibold text-white">{decodeURIComponent(email)}</p>
              </div>
            )}

            {orderId && (
              <div className="text-xs text-dark-400 mb-6">
                Order ID: {orderId}
              </div>
            )}

            {!isTrial && (
              <div className="flex items-start p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 text-left">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-200">{t.success.checkEmail}</p>
              </div>
            )}

            <div className="mb-8">
              <p className="text-sm text-dark-300 mb-2">{t.success.needHelp}</p>
              <a
                href={`mailto:${t.success.supportEmail}`}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                {t.success.supportEmail}
              </a>
            </div>

            <a href="/" className="btn-primary w-full inline-flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.success.backHome}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuccessContent />
    </Suspense>
  );
}
