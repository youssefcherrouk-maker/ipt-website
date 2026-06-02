'use client';
import { useState } from 'react';
import Link from 'next/link';
import ContentDetail from '@/components/ContentDetail';
import type { MediaItem } from '@/components/ContentDetail';

const SHOWS: MediaItem[] = [
  { title: 'Game of Thrones', seasons: '8', genre: 'Fantasy', rating: '9.5', img: 'https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=500&q=80', description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.' },
  { title: 'Breaking Bad', seasons: '5', genre: 'Crime', rating: '9.7', img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80', description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family future.' },
  { title: 'Stranger Things', seasons: '4', genre: 'Sci-Fi', rating: '9.1', img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80', description: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces to get him back.' },
  { title: 'The Crown', seasons: '6', genre: 'Drama', rating: '8.9', img: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=500&q=80', description: 'Follows the political rivalries and romance of Queen Elizabeth II reign and the events that shaped the second half of the twentieth century.' },
  { title: 'The Mandalorian', seasons: '3', genre: 'Sci-Fi', rating: '9.0', img: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=500&q=80', description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.' },
  { title: 'House of the Dragon', seasons: '2', genre: 'Fantasy', rating: '9.2', img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&q=80', description: 'The story of the House Targaryen set 200 years before the events of Game of Thrones, following the civil war that nearly destroyed their dynasty.' },
  { title: 'The Last of Us', seasons: '1', genre: 'Action', rating: '9.4', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80', description: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity last hope.' },
  { title: 'Squid Game', seasons: '1', genre: 'Thriller', rating: '8.8', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80', description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children games. Inside, a tempting prize awaits with deadly high stakes.' },
  { title: 'The Witcher', seasons: '3', genre: 'Fantasy', rating: '8.7', img: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=500&q=80', description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.' },
  { title: 'Succession', seasons: '4', genre: 'Drama', rating: '9.3', img: 'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=500&q=80', description: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down.' },
  { title: 'Wednesday', seasons: '1', genre: 'Comedy', rating: '8.6', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80', description: 'While attending Nevermore Academy, Wednesday Addams attempts to solve a murder mystery that involves her parents and unleashes a monster rampage.' },
  { title: 'Peaky Blinders', seasons: '6', genre: 'Crime', rating: '9.4', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80', description: 'A gangster family epic set in 1900s Birmingham, England, following the notorious Peaky Blinders gang and their ambitious leader Tommy Shelby.' },
];

const CATEGORIES = ['All', 'Fantasy', 'Crime', 'Sci-Fi', 'Drama', 'Action', 'Thriller', 'Comedy'];

export default function TvShowsPage() {
  const [activeCat, setActiveCat] = useState('All');
  const [selectedShow, setSelectedShow] = useState<MediaItem | null>(null);

  const filtered = activeCat === 'All' ? SHOWS : SHOWS.filter(s => s.genre === activeCat);

  return (
    <div className="bg-black pt-20">
      {/* Cinematic Hero Banner */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=1920&q=80')] bg-cover bg-center scale-105 animate-slow-zoom" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-[90rem] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300 mb-4 backdrop-blur-sm">SERIES COLLECTION</div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-3">TV Shows</h1>
          <p className="text-white/40 max-w-xl text-base sm:text-lg">Binge-watch the most acclaimed series from around the world. Every season, every episode, on demand.</p>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-12">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeCat === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/10 border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="content-grid">
            {filtered.map((show, i) => (
              <div key={i} onClick={() => setSelectedShow(show)} className="content-card group cursor-pointer" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                  <img src={show.img} alt={show.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; img.parentElement?.classList.add('bg-gradient-to-br', 'from-purple-900/40', 'to-pink-900/40'); }} />
                  <div className="card-overlay" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[10px] font-semibold text-white/70">{show.genre}</span>
                  </div>
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-yellow-400">{show.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm leading-tight">{show.title}</p>
                    <p className="text-white/40 text-xs mt-1">{show.seasons} Seasons</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-transparent" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Binge Without Limits</h2>
          <p className="text-white/40 mb-6 text-lg">Subscribe now and get access to every season of every show.</p>
          <Link href="/pricing" className="btn-gold px-8 py-3">View Plans</Link>
        </div>
      </section>

      {selectedShow && (
        <ContentDetail item={selectedShow} type="show" onClose={() => setSelectedShow(null)} />
      )}
    </div>
  );
}
