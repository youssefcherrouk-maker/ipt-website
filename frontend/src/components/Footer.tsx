'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="relative bg-black border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent pointer-events-none" />
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">IPTV<span className="text-purple-400">Premium</span></span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">{t.nav.home}</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/movies', key: 'movies' as const },
                { href: '/tv-shows', key: 'tvShows' as const },
                { href: '/sports', key: 'sports' as const },
                { href: '/pricing', key: 'pricing' as const },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">{t.nav.contact}</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/faq', key: 'faq' as const },
                { href: '/contact', key: 'contact' as const },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">{t.nav.faq}</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-white/40 cursor-default">{t.footer.terms}</span></li>
              <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">{t.footer.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">&copy; {new Date().getFullYear()} IPTV Premium. {t.footer.rights}</p>
          <div className="flex items-center gap-3 text-xs text-white/20">
            <span>Secure payments via</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 font-semibold text-white/40">PayPal</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 font-semibold text-white/40">Visa</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 font-semibold text-white/40">MC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
