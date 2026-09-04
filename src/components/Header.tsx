// SpeakBand — QuizTube-Styled Navigation Bar with Light/Dark Mode Toggle

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
  User,
  LogOut,
  LogIn,
  Sparkles,
  Layers,
} from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { useTheme } from './ThemeProvider';
import { getSupabaseClient } from '@/lib/supabase';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [targetBand, setTargetBand] = useState<number>(7.5);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-purple-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                <span>SpeakBand</span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-md border border-indigo-200/60 dark:border-indigo-800">
                  IELTS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block">
                Your AI IELTS Speaking Coach
              </p>
            </div>
          </Link>

          {/* Desktop Center Navigation Pills (QuizTube Style) */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition shadow-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-indigo-500/20'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
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
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Target Band, Theme Toggle, Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Target Band Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 rounded-xl text-xs">
              <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Target:</span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                {targetBand.toFixed(1)}
              </span>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center gap-1.5 text-xs font-semibold"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-xs text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden xl:inline text-xs text-slate-700">Dark</span>
                </>
              )}
            </button>

            {/* Auth / Account Button */}
            {userEmail ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0">
                  {userEmail[0]}
                </div>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">
                  {userEmail.split('@')[0]}
                </span>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-sm transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Account</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Native Mobile Bottom Navigation Bar (Matching QuizTube Android layout) */}
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
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-indigo-50 dark:bg-indigo-950/80' : ''
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
    </>
  );
};
