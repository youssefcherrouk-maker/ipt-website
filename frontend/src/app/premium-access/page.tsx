'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { getSubscriptionStatus, type SubscriptionState } from '@/utils/subscription';

function PremiumAccessContent() {
  const searchParams = useSearchParams();
  const [subState, setSubState] = useState<SubscriptionState>({ hasSubscription: false, status: 'guest' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setSubState(getSubscriptionStatus()); setMounted(true); }, []);

  const title = searchParams.get('title') || 'This Content';
  const img = searchParams.get('img') || '';
  const genre = searchParams.get('genre');
  const rating = searchParams.get('rating');
  const year = searchParams.get('year');
  const seasons = searchParams.get('seasons');
  const description = searchParams.get('description');
  const match = searchParams.get('match');
  const tag = searchParams.get('tag');
  const viewers = searchParams.get('viewers');

  const isLoggedIn = subState.status !== 'guest';
  const isExpired = subState.status === 'expired' || subState.status === 'cancelled';
  const isPaymentFailed = subState.status === 'payment_failed';
  const hasTrial = subState.status === 'trial';

  let heading: string;
  let subheading: string;
  if (isExpired) {
    heading = 'Your subscription has expired';
    subheading = 'Renew now to continue watching your favorite content in 4K quality.';
  } else if (isPaymentFailed) {
    heading = 'Payment issue detected';
    subheading = 'Please update your payment method to restore access.';
  } else if (hasTrial) {
    heading = 'Trial period ended';
    subheading = 'Upgrade to a paid plan to continue watching without interruption.';
  } else {
    heading = 'Subscribe to watch';
    subheading = 'This content is available exclusively to subscribers. Get instant access when you join.';
  }

  if (!mounted) return null;

  if (subState.hasSubscription) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">You already have access</h1>
          <p className="text-white/50 mb-8">Your subscription is active. You can watch {title} and thousands of other titles right now.</p>
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            Browse Content
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:gap-12">
            {/* Poster */}
            <div className="hidden lg:block w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/[0.06] mb-6 lg:mb-0">
              <div className="aspect-[2/3] bg-white/5">
                <img src={img} alt={title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300 backdrop-blur-sm tracking-wider uppercase">
                  Premium Content
                </span>
                {tag && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-md ${tag === 'LIVE' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white/70 border border-white/10'}`}>
                    {tag === 'LIVE' ? `LIVE` : tag}
                  </span>
                )}
                {rating && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-md text-xs font-bold">{rating}</span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight leading-[1.1]">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40 mb-4">
                {genre && <span>{genre}</span>}
                {year && <span>{year}</span>}
                {seasons && <span>{seasons} Seasons</span>}
                {match && <span>{match}</span>}
                {viewers && <span className="text-white/30">{viewers} watching</span>}
              </div>

              <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-6 max-w-xl">
                {description || (match
                  ? `Watch ${match} live in stunning 4K quality.`
                  : `Experience ${title} in stunning 4K quality with Dolby Atmos sound.`)}
              </p>

              <p className="text-purple-300 text-sm font-medium flex items-center gap-2 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {heading}
              </p>

              <p className="text-white/40 text-sm mb-8">{subheading}</p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-base"
                >
                  View Plans
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                {!isLoggedIn && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-white/70 font-semibold rounded-xl hover:border-white/30 hover:text-white transition-all duration-300 text-base"
                  >
                    Start Free Trial
                  </Link>
                )}

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.04] text-white/50 font-medium rounded-xl border border-white/[0.06] hover:bg-white/10 hover:text-white transition-all duration-300 text-sm"
                >
                  {isLoggedIn ? 'Manage Plan' : 'Sign In'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto">
              One subscription unlocks the ultimate entertainment experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { icon: '∞', title: 'Unlimited Streaming', desc: 'Watch as much as you want, anytime. No caps, no limits.' },
              { icon: '4K', title: '4K HDR Quality', desc: 'Stunning visuals with Dolby Vision and Dolby Atmos sound.' },
              { icon: '🚫', title: 'No Interruptions', desc: 'Zero ads. Zero buffering. Just pure entertainment.' },
              { icon: '🎬', title: 'Full Library Access', desc: 'Thousands of movies, series, and live sports on demand.' },
              { icon: '📱', title: 'All Devices', desc: 'Watch on TV, laptop, tablet, or phone. Up to 4 simultaneous streams.' },
              { icon: '↩', title: 'Cancel Anytime', desc: 'No long-term contracts. Cancel online in 2 clicks.' },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/10 flex items-center justify-center mb-4 text-lg font-bold text-purple-400">
                  {benefit.icon === '4K' ? <span className="text-xs tracking-widest">4K</span> : benefit.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST & SOCIAL PROOF ===== */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
            {[
              { value: '50,000+', label: 'Active Subscribers' },
              { value: '99.9%', label: 'Uptime Guaranteed' },
              { value: '20,000+', label: 'Channels & Content' },
              { value: '30-Day', label: 'Money-Back Guarantee' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  {stat.value}
                </p>
                <p className="text-xs text-white/40 mt-1 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/20">
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              SSL Secured
            </div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              Secure Payments
            </div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              30-Day Guarantee
            </div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              Data Protection
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING TEASE ===== */}
      <section className="py-20 sm:py-28 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />

        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to watch?
          </h2>
          <p className="text-white/40 text-lg mb-8 max-w-md mx-auto">
            Plans start from $9.99/month. No hidden fees. Cancel anytime.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25 text-lg"
          >
            View Plans & Pricing
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-white/20 text-xs mt-4">
            Secure checkout · PayPal accepted · No long-term commitment
          </p>
        </div>
      </section>

      {/* ===== FOOTER NAV ===== */}
      <section className="py-8 border-t border-white/5">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">
            ← Back to Home
          </Link>
          <div className="flex gap-4 text-xs text-white/20">
            <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
            <Link href="/pricing" className="hover:text-white/40 transition-colors">Pricing</Link>
            <Link href="/movies" className="hover:text-white/40 transition-colors">Movies</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PremiumAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <PremiumAccessContent />
    </Suspense>
  );
}
