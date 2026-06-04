'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { adminLogin } from '@/utils/api';

function useTilt(ref: React.RefObject<HTMLDivElement | null>, intensity = 15) {
  const handleMouse = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    ref.current.style.setProperty('--rot-x', `${(y - 0.5) * intensity}deg`);
    ref.current.style.setProperty('--rot-y', `${(0.5 - x) * intensity}deg`);
  }, [ref, intensity]);

  const handleLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--rot-x', '0deg');
    ref.current.style.setProperty('--rot-y', '0deg');
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouse);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouse);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [ref, handleMouse, handleLeave]);
}

interface FloatingShapeProps {
  src: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  depth: number;
}

function FloatingShape({ src, x, y, size, speed, delay, depth }: FloatingShapeProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: number | null = null;
    let anim: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      const dx = Math.sin(t * speed + delay) * 20 * depth;
      const dy = Math.cos(t * speed * 0.7 + delay) * 15 * depth;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, [speed, delay, depth]);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px`, zIndex: 1, opacity: 0.5 }}
    >
      <img src={src} alt="" className="w-full h-full object-contain" style={{ filter: 'brightness(0.7) saturate(1.2)' }} />
    </div>
  );
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useTilt(cardRef, 12);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouseX(e.clientX / window.innerWidth);
      setMouseY(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await adminLogin(username, password);
    setLoading(false);
    if (result.success && result.data?.token) {
      localStorage.setItem('admin_token', result.data.token);
      window.location.href = '/admin/orders';
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  const bgX = (mouseX - 0.5) * -3;
  const bgY = (mouseY - 0.5) * -3;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-black"
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${bgX}px, ${bgY}px) scale(1.05)`,
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920&q=85&auto=format"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-pink-900/30" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Floating 3D decorative images */}
      <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
        <FloatingShape
          src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=60&auto=format"
          x={8} y={15} size={140} speed={1.2} delay={0} depth={1.2}
        />
        <FloatingShape
          src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200&q=60&auto=format"
          x={78} y={12} size={110} speed={0.9} delay={1.5} depth={1}
        />
        <FloatingShape
          src="https://images.unsplash.com/photo-1611605698335-8b1569810432?w=200&q=60&auto=format"
          x={85} y={75} size={90} speed={1.5} delay={0.8} depth={0.8}
        />
        <FloatingShape
          src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&q=60&auto=format"
          x={5} y={78} size={120} speed={1.1} delay={2} depth={1.1}
        />
      </div>

      {/* Scan line overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      }} />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-[420px] transition-all duration-1000 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* 3D Tilt Card */}
        <div
          ref={cardRef}
          className="relative"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="relative bg-[#0a0a12]/85 backdrop-blur-2xl border border-[#ffffff10] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60"
            style={{
              transform: 'rotateX(var(--rot-x, 0deg)) rotateY(var(--rot-y, 0deg))',
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Glare effect */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at ${mouseX * 100}% ${mouseY * 100}%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)`,
                }}
              />
            </div>

            {/* Inner glow border */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              boxShadow: 'inset 0 0 0 1px rgba(168, 85, 247, 0.08), inset 0 0 60px rgba(168, 85, 247, 0.03)',
            }} />

            {/* Header */}
            <div className="text-center mb-9" style={{ transform: 'translateZ(40px)' }}>
              <div className="relative inline-flex mb-5">
                <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full scale-150" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 ring-1 ring-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
              <p className="text-sm text-white/30 mt-1.5 font-light">Sign in to manage your IPTV service</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/15 mb-6" style={{ transform: 'translateZ(20px)' }}>
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-300/90 leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5" style={{ transform: 'translateZ(25px)' }}>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#0a0a14]/80 border border-[#ffffff10] rounded-2xl text-white placeholder-[#ffffff20] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 text-sm tracking-wide"
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5" style={{ transform: 'translateZ(25px)' }}>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-[#0a0a14]/80 border border-[#ffffff10] rounded-2xl text-white placeholder-[#ffffff20] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 text-sm tracking-wide"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full mt-2 overflow-hidden group rounded-2xl"
                style={{ transform: 'translateZ(35px)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl" />
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/0 via-white/10 to-pink-600/0 group-hover:via-white/5 rounded-2xl blur-xl transition-all duration-700" />
                <div className="relative px-4 py-3.5 text-white font-semibold rounded-2xl flex items-center justify-center gap-2.5 text-sm tracking-wide">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#ffffff06]" style={{ transform: 'translateZ(15px)' }}>
              <p className="text-[10px] text-center text-white/15 tracking-wider uppercase">
                IPTV Premium Administration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
