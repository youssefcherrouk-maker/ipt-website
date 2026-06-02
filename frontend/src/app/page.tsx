'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import ContentDetail from '@/components/ContentDetail';
import type { MediaItem } from '@/components/ContentDetail';

const FEATURED = [
  { title: 'Interstellar', genre: 'Sci-Fi', year: '2014', rating: '9.3', img: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=500&q=80' },
  { title: 'The Matrix', genre: 'Action', year: '1999', rating: '9.0', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80' },
  { title: 'Dune', genre: 'Adventure', year: '2021', rating: '9.1', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
  { title: 'Inception', genre: 'Thriller', year: '2010', rating: '9.2', img: 'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=500&q=80' },
  { title: 'Blade Runner', genre: 'Sci-Fi', year: '2017', rating: '8.8', img: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=500&q=80' },
  { title: 'The Dark Knight', genre: 'Action', year: '2008', rating: '9.5', img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80' },
];

const SPORTS = [
  { title: 'UEFA Champions League', match: 'Real Madrid vs Man City', tag: 'LIVE', viewers: '124K', img: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80' },
  { title: 'Premier League', match: 'Arsenal vs Liverpool', tag: 'UPCOMING', viewers: '89K', img: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80' },
  { title: 'La Liga', match: 'Barcelona vs Atlético', tag: 'LIVE', viewers: '67K', img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80' },
];

export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrolled = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-black">
      {/* Cinematic Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 transition-transform duration-300">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80')] bg-cover bg-center scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-white/50 uppercase tracking-widest">{t.hero.badge}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.85] tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">{t.hero.title}</span>
              <br />
              <span className="text-white">{t.hero.title2}</span>
              <br />
              <span className="text-white/40">{t.hero.title3}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/40 max-w-xl mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/pricing" className="btn-gold text-base px-8 py-4">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                {t.hero.ctaTrial}
              </Link>
              <Link href="/movies" className="btn-outline text-base px-8 py-4">
                {t.hero.ctaBrowse}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Movies Row */}
      <section className="relative -mt-32 z-20 pb-12">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-purple-500 rounded-full" />
              <h2 className="text-xl font-bold text-white">{t.home.featuredMovies}</h2>
            </div>
            <Link href="/movies" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">{t.home.viewAll} →</Link>
          </div>
          <div className="content-grid">
            {FEATURED.map((item, i) => (
              <div key={i} onClick={() => setSelectedItem(item)} className="content-card group cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                  <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; img.parentElement?.classList.add('bg-gradient-to-br', 'from-purple-900/40', 'to-pink-900/40'); }} />
                  <div className="card-overlay" />
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-yellow-400">{item.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                    <p className="text-white/50 text-xs mt-1">{item.genre} · {item.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Sports Row */}
      <section className="py-12">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 bg-red-500 rounded-full" />
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-bold text-white">{t.home.liveSports}</h2>
            </div>
            <Link href="/sports" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">{t.home.viewAll} →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPORTS.map((item, i) => (
              <div key={i} onClick={() => setSelectedItem(item)} className="content-card group cursor-pointer">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-white/5">
                  <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; img.parentElement?.classList.add('bg-gradient-to-br', 'from-red-900/40', 'to-orange-900/40'); }} />
                  <div className="card-overlay" />
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md ${item.tag === 'LIVE' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70'}`}>
                      {item.tag === 'LIVE' ? '🔴 LIVE' : item.tag}
                    </span>
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white/60">{item.viewers}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{item.title}</p>
                    <p className="text-white font-bold text-base">{item.match}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative py-16 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 via-transparent to-transparent" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: t.home.statsChannels, value: '20,000+' },
              { label: t.home.statsUsers, value: '50,000+' },
              { label: t.home.statsUptime, value: '99.9%' },
              { label: t.home.statsQuality, value: '4K HDR' },
            ].map((stat, i) => (
              <div key={i} className="reveal animate-on-scroll group">
                <p className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 group-hover:scale-110 transition-transform duration-500">{stat.value}</p>
                <p className="text-sm text-white/40 mt-2 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight">{t.home.ctaTitle}</h2>
          <p className="text-white/40 max-w-md mx-auto mb-8 text-lg">{t.home.ctaSubtitle}</p>
          <Link href="/pricing" className="btn-gold text-base px-10 py-4">
            {t.home.ctaButton}
          </Link>
        </div>
      </section>

      {selectedItem && (
        <ContentDetail item={selectedItem} type={selectedItem.match ? 'movie' : 'movie'} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
