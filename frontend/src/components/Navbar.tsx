'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';

const NAV_ITEMS = [
  { href: '/', key: 'home' as const },
  { href: '/movies', key: 'movies' as const },
  { href: '/tv-shows', key: 'tvShows' as const },
  { href: '/sports', key: 'sports' as const },
  { href: '/pricing', key: 'pricing' as const },
  { href: '/faq', key: 'faq' as const },
  { href: '/contact', key: 'contact' as const },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t, lang, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      if (currentY > 200) {
        setHidden(currentY > lastScrollY.current);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:shadow-purple-500/50 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
              IPTV<span className="text-purple-400">Premium</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-white bg-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {t.nav[item.key]}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  lang === 'en' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  lang === 'fr' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  lang === 'es' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                ES
              </button>
            </div>

            <Link
              href="/pricing"
              className="hidden lg:inline-flex items-center px-5 py-2 bg-gradient-to-r from-premium-gold to-yellow-500 text-black text-sm font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-premium-gold/20 hover:shadow-premium-gold/40 active:scale-95"
            >
              {t.nav.freeTrial}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            mobileOpen ? 'max-h-screen opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1 pt-2 border-t border-white/10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.nav[item.key]}
              </Link>
            ))}
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-4 py-3 bg-gradient-to-r from-premium-gold to-yellow-500 text-black text-sm font-semibold rounded-xl text-center"
            >
              {t.nav.freeTrial}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
