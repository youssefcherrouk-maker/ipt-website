'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Header() {
  const { t, lang, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('header')) setMobileOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileOpen]);

  const navLinks = [
    { href: '#features', label: t.nav.features },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#faq', label: t.nav.faq },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-900/90 backdrop-blur-xl border-b border-dark-600/30 shadow-lg shadow-dark-900/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-dark-100 bg-clip-text text-transparent">
              IPTV Premium
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-dark-200 hover:text-white rounded-lg hover:bg-dark-700/50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-dark-700/50 rounded-lg p-0.5 border border-dark-500/30">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  lang === 'en'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  lang === 'fr'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                FR
              </button>
            </div>

            {/* Free Trial Button (Desktop) */}
            <a
              href="#pricing"
              className="hidden lg:inline-flex items-center px-5 py-2 bg-gradient-to-r from-premium-gold to-yellow-500 text-dark-900 text-sm font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-premium-gold/20"
            >
              {t.nav.freeTrial}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-dark-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom py-4 border-t border-dark-600/30 bg-dark-900/95 backdrop-blur-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm text-dark-200 hover:text-white rounded-lg hover:bg-dark-700/50 transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-4 py-3 bg-gradient-to-r from-premium-gold to-yellow-500 text-dark-900 text-sm font-semibold rounded-xl text-center"
            >
              {t.nav.freeTrial}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
