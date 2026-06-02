'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildContentUrl } from '@/utils/contentUrl';
import { getSubscriptionStatus } from '@/utils/subscription';

export interface MediaItem {
  title: string;
  year?: string;
  genre?: string;
  rating?: string;
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
  const router = useRouter();
  const [subState, setSubState] = useState<ReturnType<typeof getSubscriptionStatus> | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    setSubState(getSubscriptionStatus());
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleWatch = () => {
    if (subState?.hasSubscription) return;
    const url = buildContentUrl(item);
    onClose();
    router.push(url);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              {item.genre && <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[10px] font-semibold text-white/70">{item.genre}</span>}
              {item.rating && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">{item.rating}</span>}
              {item.tag && <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.tag === 'LIVE' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70'}`}>{item.tag === 'LIVE' ? 'LIVE' : item.tag}</span>}
              {item.viewers && <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white/60">{item.viewers}</span>}
              {type === 'show' && item.seasons && (
                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-[10px] text-white/60">{item.seasons} Seasons</span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{item.title}</h2>
            <p className="text-sm text-white/50 mt-1">{item.year || ''}</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            {item.description || (item.match
              ? `Watch ${item.match} live in stunning 4K quality.`
              : `Experience ${item.title} in stunning 4K quality with Dolby Atmos sound. Part of our premium ${item.genre || ''} collection with thousands of titles available on demand.`)}
          </p>

          {subState?.hasSubscription ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You have access</h3>
              <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                Your subscription is active. You can watch this content instantly.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                Start Watching
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
