'use client';
import { useState } from 'react';
import Link from 'next/link';
import ContentDetail from '@/components/ContentDetail';
import type { MediaItem } from '@/components/ContentDetail';

const MATCHES = [
  { league: 'UEFA Champions League', match: 'Real Madrid vs Manchester City', time: 'LIVE', viewers: '124K', img: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80' },
  { league: 'Premier League', match: 'Arsenal vs Liverpool', time: '20:45', viewers: '89K', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80' },
  { league: 'La Liga', match: 'Barcelona vs Atlético Madrid', time: 'LIVE', viewers: '67K', img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80' },
  { league: 'Serie A', match: 'Juventus vs AC Milan', time: '21:00', viewers: '45K', img: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80' },
  { league: 'Bundesliga', match: 'Bayern vs Dortmund', time: 'LIVE', viewers: '78K', img: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80' },
  { league: 'Ligue 1', match: 'PSG vs Olympique Marseille', time: 'LIVE', viewers: '52K', img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80' },
];

const CHANNELS = [
  { name: 'beIN SPORTS', color: 'text-red-400' },
  { name: 'Sky Sports', color: 'text-blue-400' },
  { name: 'ESPN', color: 'text-green-400' },
  { name: 'Canal+', color: 'text-yellow-400' },
  { name: 'DAZN', color: 'text-purple-400' },
  { name: 'Fox Sports', color: 'text-orange-400' },
  { name: 'Sport TV', color: 'text-cyan-400' },
  { name: 'RMC Sport', color: 'text-pink-400' },
];

export default function SportsPage() {
  const [selectedMatch, setSelectedMatch] = useState<MediaItem | null>(null);

  const toMediaItem = (m: typeof MATCHES[0]): MediaItem => ({
    title: m.league,
    match: m.match,
    tag: m.time === 'LIVE' ? 'LIVE' : 'UPCOMING',
    viewers: m.viewers,
    img: m.img,
    rating: m.time === 'LIVE' ? 'LIVE' : '',
    description: `Watch ${m.match} ${m.time === 'LIVE' ? 'live now' : 'on ' + m.time} in stunning 4K quality. Every goal, every tackle, every moment.`,
  });
  return (
    <div className="bg-black pt-20">
      {/* Stadium Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1920&q=80')] bg-cover bg-center scale-105 animate-slow-zoom" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-[90rem] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-xs text-red-300 mb-4 backdrop-blur-sm animate-pulse-glow">LIVE SPORTS</div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-3">Sports</h1>
          <p className="text-white/40 max-w-xl text-base sm:text-lg">Every match. Every league. Live and on demand in 4K.</p>
          <div className="flex flex-wrap gap-2 mt-6">
            {CHANNELS.map((ch) => (
              <span key={ch.name} className={`px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs font-semibold ${ch.color}`}>{ch.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Live Matches */}
      <section className="py-12">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 bg-red-500 rounded-full" />
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-2xl font-bold text-white">Live & Upcoming Matches</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MATCHES.map((m, i) => (
              <div key={i} onClick={() => setSelectedMatch(toMediaItem(m))} className="content-card group cursor-pointer">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-white/5">
                  <img src={m.img} alt={m.match} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; img.parentElement?.classList.add('bg-gradient-to-br', 'from-red-900/40', 'to-orange-900/40'); }} />
                  <div className="card-overlay" />
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${m.time === 'LIVE' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-black/60 backdrop-blur-sm text-white/70'}`}>
                      {m.time === 'LIVE' ? '🔴 LIVE' : m.time}
                    </span>
                    {m.time === 'LIVE' && (
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white/60">{m.viewers} watching</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{m.league}</p>
                    <p className="text-white font-bold text-base">{m.match}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leagues Grid */}
      <section className="py-16 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/5 via-transparent to-transparent" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-red-500 rounded-full" />
            <h2 className="text-2xl font-bold text-white">All Leagues & Tournaments</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
              { name: 'La Liga', flag: '🇪🇸' },
              { name: 'Serie A', flag: '🇮🇹' },
              { name: 'Bundesliga', flag: '🇩🇪' },
              { name: 'Ligue 1', flag: '🇫🇷' },
              { name: 'UCL', flag: '⭐' },
              { name: 'Europa League', flag: '🏆' },
              { name: 'World Cup', flag: '🌍' },
              { name: 'NBA', flag: '🏀' },
              { name: 'NFL', flag: '🏈' },
              { name: 'Formula 1', flag: '🏎️' },
              { name: 'UFC', flag: '🥊' },
            ].map((league, i) => (
              <div key={i} className="glass-card p-4 sm:p-5 text-center hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer group">
                <span className="text-2xl block mb-2 group-hover:scale-125 transition-transform duration-300">{league.flag}</span>
                <p className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{league.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-transparent" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Never Miss a Match</h2>
          <p className="text-white/40 mb-6 text-lg">All major leagues and tournaments live in 4K.</p>
          <Link href="/pricing" className="btn-gold px-8 py-3">View Plans</Link>
        </div>
      </section>

      {selectedMatch && (
        <ContentDetail item={selectedMatch} type="movie" onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
