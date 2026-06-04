import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'IPTV Premium - Premium IPTV Streaming Service | 20,000+ Channels',
  description: 'Premium IPTV service with 20,000+ live channels, movies & series in 4K Ultra HD. Start your free 24-hour trial today.',
  keywords: 'IPTV, streaming, live TV, 4K, IPTV service, premium IPTV, free trial IPTV, channels, movies',
  openGraph: {
    title: 'IPTV Premium - Premium IPTV Streaming Service',
    description: 'Unlimited access to 20,000+ live channels, movies, and series in 4K Ultra HD.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-black text-white">
        <LanguageProvider>
          <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
