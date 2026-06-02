'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface MediaItem {
  title: string;
  year?: string;
  genre: string;
  rating: string;
  img: string;
  seasons?: string;
  description?: string;
  match?: string;
  tag?: string;
  viewers?: string;
}

interface ContentDetailProps {
  item: MediaItem;
  type: 'movie' | 'show';
  onClose: () => void;
}

export default function ContentDetail({ item, type, onClose }: ContentDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleWatch = () => setShowPaywall(true);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Backdrop Image */}
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[10px] font-semibold text-white/70">{item.genre}</span>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">{item.rating}</span>
              {type === 'show' && item.seasons && (
                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[10px] text-white/60">{item.seasons} Seasons</span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{item.title}</h2>
            <p className="text-sm text-white/50 mt-1">{item.year || ''}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 relative">
          {!showPaywall ? (
            <>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                {item.description || `Experience ${item.title} in stunning 4K quality with Dolby Atmos sound. Part of our premium ${item.genre} collection with thousands of titles available on demand.`}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleWatch}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Watch Now
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/[0.04] text-white/60 font-medium rounded-xl border border-white/[0.08] hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Browse More
                </button>
              </div>
            </>
          ) : (
            /* Paywall */
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Subscribe to Watch</h3>
              <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                This content requires an active subscription. Choose a plan that works for you and get instant access to thousands of movies, TV shows, and live sports.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/20"
                >
                  View Plans
                </Link>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="px-8 py-3 bg-white/[0.04] text-white/60 font-medium rounded-xl border border-white/[0.08] hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
