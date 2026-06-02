'use client';
import { useState } from 'react';
import Link from 'next/link';
import ContentDetail from '@/components/ContentDetail';
import type { MediaItem } from '@/components/ContentDetail';

const MOVIES: MediaItem[] = [
  { title: 'Interstellar', year: '2014', genre: 'Sci-Fi', rating: '9.3', img: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=500&q=80', description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked with piloting a spacecraft, along with a team of researchers, to find a new planet for humans.' },
  { title: 'The Matrix', year: '1999', genre: 'Action', rating: '9.0', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80', description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth—the life he knows is the elaborate deception of an evil cyber-intelligence.' },
  { title: 'Dune: Part Two', year: '2024', genre: 'Adventure', rating: '9.1', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80', description: 'Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family. Transforming the desert planet Arrakis into a war zone.' },
  { title: 'Inception', year: '2010', genre: 'Thriller', rating: '9.2', img: 'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=500&q=80', description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.' },
  { title: 'Blade Runner 2049', year: '2017', genre: 'Sci-Fi', rating: '8.8', img: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=500&q=80', description: 'Young Blade Runner K discovers a long-buried secret that has the potential to plunge what is left of society into chaos.' },
  { title: 'The Dark Knight', year: '2008', genre: 'Action', rating: '9.5', img: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80', description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.' },
  { title: 'Avatar: The Way of Water', year: '2022', genre: 'Fantasy', rating: '8.7', img: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=500&q=80', description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started.' },
  { title: 'Oppenheimer', year: '2023', genre: 'Drama', rating: '9.4', img: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80', description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.' },
  { title: 'Gladiator II', year: '2024', genre: 'Action', rating: '8.9', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80', description: 'Years after the events of the original, a new generation of warriors rises in the Colosseum to fight for honor and freedom.' },
  { title: 'The Batman', year: '2022', genre: 'Crime', rating: '8.6', img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&q=80', description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city hidden corruption.' },
  { title: 'Tenet', year: '2020', genre: 'Sci-Fi', rating: '8.3', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80', description: 'Armed with only one word—Tenet—and fighting for the survival of the entire world, the Protagonist journeys through a twilight world of international espionage.' },
  { title: 'Mad Max: Fury Road', year: '2015', genre: 'Action', rating: '8.9', img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=500&q=80', description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners.' },
];

const CATEGORIES = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Drama', 'Fantasy', 'Crime', 'Adventure'];

export default function MoviesPage() {
  const [activeCat, setActiveCat] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState<MediaItem | null>(null);

  const filtered = activeCat === 'All' ? MOVIES : MOVIES.filter(m => m.genre === activeCat);

  return (
    <div className="bg-black pt-20">
      {/* Cinematic Hero Banner */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80')] bg-cover bg-center scale-105 animate-slow-zoom" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-[90rem] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300 mb-4 backdrop-blur-sm">CINEMA COLLECTION</div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-3">Movies</h1>
          <p className="text-white/40 max-w-xl text-base sm:text-lg">Explore our blockbuster collection in stunning 4K quality. Thousands of titles available on demand.</p>
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
            {filtered.map((movie, i) => (
              <div key={i} onClick={() => setSelectedMovie(movie)} className="content-card group cursor-pointer" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                  <img src={movie.img} alt={movie.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; img.parentElement?.classList.add('bg-gradient-to-br', 'from-purple-900/40', 'to-pink-900/40'); }} />
                  <div className="card-overlay" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[10px] font-semibold text-white/70">{movie.genre}</span>
                  </div>
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-yellow-400">{movie.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm leading-tight">{movie.title}</p>
                    <p className="text-white/40 text-xs mt-1">{movie.year}</p>
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
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Start Watching</h2>
          <p className="text-white/40 mb-6 text-lg">Get instant access to thousands of movies in 4K.</p>
          <Link href="/pricing" className="btn-gold px-8 py-3">View Plans</Link>
        </div>
      </section>

      {selectedMovie && (
        <ContentDetail item={selectedMovie} type="movie" onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
