'use client';
import { useState } from 'react';
import Link from 'next/link';

const SHOWS = [
  { title: 'Stranger Things', seasons: '5', genre: 'Sci-Fi', rating: '9.1', img: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&q=80' },
  { title: 'The Last of Us', seasons: '2', genre: 'Drama', rating: '9.3', img: 'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=500&q=80' },
  { title: 'House of the Dragon', seasons: '2', genre: 'Fantasy', rating: '8.9', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
  { title: 'The Crown', seasons: '6', genre: 'Drama', rating: '8.7', img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80' },
  { title: 'Wednesday', seasons: '1', genre: 'Comedy', rating: '8.5', img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&q=80' },
  { title: 'Succession', seasons: '4', genre: 'Drama', rating: '9.4', img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80' },
  { title: 'The Witcher', seasons: '3', genre: 'Fantasy', rating: '8.4', img: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=500&q=80' },
  { title: 'Squid Game', seasons: '1', genre: 'Thriller', rating: '8.8', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80' },
  { title: 'The Mandalorian', seasons: '3', genre: 'Sci-Fi', rating: '8.9', img: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=500&q=80' },
  { title: 'Breaking Bad', seasons: '5', genre: 'Crime', rating: '9.5', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80' },
  { title: 'Game of Thrones', seasons: '8', genre: 'Fantasy', rating: '9.2', img: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=500&q=80' },
  { title: 'Rick and Morty', seasons: '7', genre: 'Animation', rating: '8.9', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80' },
];

const GENRES = ['All', 'Drama', 'Sci-Fi', 'Fantasy', 'Comedy', 'Thriller', 'Crime', 'Animation'];

export default function TvShowsPage() {
  const [activeGenre, setActiveGenre] = useState('All');
  const filtered = activeGenre === 'All' ? SHOWS : SHOWS.filter(s => s.genre === activeGenre);

  return (
    <div className="bg-black pt-20">
      {/* Cinematic Hero */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80')] bg-cover bg-center scale-105 animate-slow-zoom" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-[90rem] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300 mb-4 backdrop-blur-sm">SERIES COLLECTION</div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-3">TV Shows</h1>
          <p className="text-white/40 max-w-xl text-base sm:text-lg">Binge-watch the best series from around the world. Full seasons available in 4K HDR.</p>
        </div>
      </section>

      {/* Genre Filter */}
      <section className="py-12">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeGenre === genre
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/10 border border-white/[0.06]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="content-grid">
            {filtered.map((show, i) => (
              <div key={i} className="content-card group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                  <img src={show.img} alt={show.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; img.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-900/40', 'to-cyan-900/40'); }} />
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-transparent" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Binge-Watch Now</h2>
          <p className="text-white/40 mb-6 text-lg">Full seasons available in 4K HDR. Start your free trial.</p>
          <Link href="/pricing" className="btn-gold px-8 py-3">View Plans</Link>
        </div>
      </section>
    </div>
  );
}
