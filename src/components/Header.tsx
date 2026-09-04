// SpeakBand — QuizTube Navigation Bar matching exact visual mockup

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  BookOpen,
  BarChart3,
  Award,
  Sun,
  Moon,
  Target,
  LogIn,
  Key,
} from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { useTheme } from './ThemeProvider';
import { getSupabaseClient } from '@/lib/supabase';
import { ApiKeyModal } from './ApiKeyModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [targetBand, setTargetBand] = useState<number>(7.5);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    setTargetBand(StorageService.getTargetBand());
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      });
    }
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Award },
    { label: 'Start Full Test', href: '/test', icon: Mic, highlight: true },
    { label: 'Practice Mode', href: '/practice', icon: BookOpen },
    { label: 'Progress', href: '/progress', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Logo matching Mockup: SPEAKBAND [IELTS] */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  SpeakBand
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-md leading-none">
                  IELTS
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-normal hidden sm:inline-block mt-0.5 leading-none">
                IELTS Speaking Coach
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Pills */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-purple-500/25'
                        : 'bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white hover:opacity-95'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-[#7C3AED] dark:text-purple-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Start Full Test Button, Theme Toggle, Target Band */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Start Full Test CTA (as seen in Mockup Screen 1) */}
            <Link
              href="/test"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 rounded-xl shadow-sm shadow-purple-500/20 transition active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Full Test</span>
            </Link>

            {/* Target Band Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 rounded-xl text-xs">
              <Target className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Target:</span>
              <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300">
                {targetBand.toFixed(1)}
              </span>
            </div>

            {/* Gemini API Key Configuration Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Configure Gemini API Key"
              aria-label="Gemini API Key Settings"
            >
              <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C3AED]" />
              )}
            </button>

            {/* Account Profile / Login */}
            {userEmail ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 rounded-xl text-xs">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                  {userEmail[0]}
                </div>
                <span className="font-bold text-purple-700 dark:text-purple-300 max-w-[80px] truncate hidden sm:inline">
                  {userEmail.split('@')[0]}
                </span>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 gap-1 transition rounded-xl ${
                  isActive
                    ? 'text-[#7C3AED] dark:text-purple-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-purple-50 dark:bg-purple-950/80' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </>
  );
};
