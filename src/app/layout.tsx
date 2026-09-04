// SpeakBand — Main Application Layout with Theme Provider

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { ExternalLink } from 'lucide-react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export const metadata: Metadata = {
  title: 'SpeakBand — Your AI IELTS Speaking Coach',
  description:
    'Simulate authentic IELTS Speaking examinations, receive official criteria scoring, and improve your speaking band score with personalized AI coaching.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
            {children}
          </main>
          <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-12 mb-16 sm:mb-0">
            <div className="max-w-7xl mx-auto space-y-4">
              <DisclaimerBanner />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span>© {new Date().getFullYear()} SpeakBand. Crafted with care by</span>
                  <a
                    href="https://personal-portfolio-blue-eight-9p8guawbf5.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white font-bold text-xs shadow-xs shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="View Ashikur's Portfolio"
                  >
                    <span>Ashikur</span>
                    <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  </a>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 font-medium">
                  <span>AI-Estimated Band Scores (0–9)</span>
                  <span>IELTS-structured exam simulation</span>
                  <span>AI speech analysis</span>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
