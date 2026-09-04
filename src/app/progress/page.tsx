// SpeakBand — Candidate Progress & Criterion Analytics (Production UX & Empty States)

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  ChevronRight,
  Play,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { IeltsEvaluationResult } from '@/types/ielts';
import { StorageService } from '@/lib/storage';
import { BandBadge } from '@/components/BandBadge';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

export default function ProgressPage() {
  const [tests, setTests] = useState<IeltsEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await StorageService.getAllTests();
      setTests(data);
    } catch (err) {
      console.error('[SpeakBand Progress] Load error:', err);
      setError("We couldn't load your progress analytics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // 1. SKELETON LOADING STATE (Never a generic infinite spinner)
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-3/4 max-w-md h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="w-full max-w-lg h-4 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
            >
              <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="w-28 h-3 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>

        {/* Breakdown Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 space-y-2">
                <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (With actionable retry)
  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">We couldn&apos;t load your progress</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {error}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={loadHistory}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs shadow-xs transition hover:opacity-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 3. INTENTIONAL EMPTY STATE FOR NEW USERS (Zero Tests)
  if (tests.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-400">
        {/* Header */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 text-[#7C3AED] dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Performance Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            IELTS Speaking Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Track your score trajectory across all 4 IELTS criteria. Analytics are generated strictly from verified examination recordings.
          </p>
        </section>

        {/* Intentional Empty State Card */}
        <section className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-5 transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              No speaking tests yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete your first simulated IELTS Speaking test to generate your baseline score and progress analytics.
            </p>
          </div>

          {/* 4 Criteria Tracking Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Fluency & Coherence</div>
              <div className="font-mono text-lg font-bold text-slate-400 mt-1">Pending</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Lexical Resource</div>
              <div className="font-mono text-lg font-bold text-slate-400 mt-1">Pending</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Grammar & Accuracy</div>
              <div className="font-mono text-lg font-bold text-slate-400 mt-1">Pending</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pronunciation</div>
              <div className="font-mono text-lg font-bold text-slate-400 mt-1">Pending</div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>Take Full Test</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <DisclaimerBanner />
      </div>
    );
  }

  // 4. EXISTING USER WITH VERIFIED DATA (Strictly real stored analytics)
  const totalTests = tests.length;
  const latestTest = tests[0];
  const previousTest = totalTests > 1 ? tests[1] : null;
  const oldestTest = tests[totalTests - 1];

  const bandDifference =
    totalTests > 1
      ? (latestTest.overallBand - oldestTest.overallBand).toFixed(1)
      : null;

  const avgFluency = (tests.reduce((acc, t) => acc + t.fluencyBand, 0) / totalTests).toFixed(1);
  const avgLexical = (tests.reduce((acc, t) => acc + t.lexicalBand, 0) / totalTests).toFixed(1);
  const avgGrammar = (tests.reduce((acc, t) => acc + t.grammarBand, 0) / totalTests).toFixed(1);
  const pronunciationTests = tests.filter((t) => typeof t.pronunciationBand === 'number' && t.pronunciationBand !== null);
  const avgPronunciation = pronunciationTests.length > 0
    ? (pronunciationTests.reduce((acc, t) => acc + (t.pronunciationBand as number), 0) / pronunciationTests.length).toFixed(1)
    : '—';

  const weakestCriterion = latestTest.weakestArea.split('(')[0].trim() || 'General Speaking';

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-400">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 text-[#7C3AED] dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Verified Performance Trajectory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              IELTS Speaking Analytics & Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Track your band progression across all 4 official assessment criteria. Derived strictly from your completed tests.
            </p>
          </div>

          <Link
            href="/test"
            className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Take Another Test</span>
          </Link>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Exams Taken
          </span>
          <div className="mt-2 font-mono text-3xl font-black text-slate-900 dark:text-white">{totalTests}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Full 11–14 min simulated exams</p>
        </div>

        {/* Current Band */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Band
          </span>
          <div className="mt-2 font-mono text-3xl font-black text-[#7C3AED] dark:text-purple-400">
            {latestTest.overallBand.toFixed(1)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {previousTest ? `Previous: Band ${previousTest.overallBand.toFixed(1)}` : 'Initial baseline score'}
          </p>
        </div>

        {/* Band Trajectory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Band Trajectory
          </span>
          <div className="mt-2 font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {bandDifference !== null
              ? Number(bandDifference) > 0
                ? `+${bandDifference}`
                : bandDifference
              : 'Baseline'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {totalTests > 1 ? 'Net change across exams' : 'Initial diagnostic level'}
          </p>
        </div>

        {/* Weakest Criterion Recommendation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recommended Focus
          </span>
          <div className="mt-2 font-sans text-base font-bold text-amber-600 dark:text-amber-400 truncate">
            {weakestCriterion}
          </div>
          <Link
            href={`/practice?skill=${encodeURIComponent(weakestCriterion)}`}
            className="inline-flex items-center gap-1 text-[11px] text-[#7C3AED] dark:text-purple-400 font-semibold hover:underline mt-1"
          >
            <span>Practice Drills</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* Criteria Breakdown Average Cards */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Criterion Historical Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fluency & Coherence</div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgFluency}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Lexical Resource</div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgLexical}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Grammar & Accuracy</div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgGrammar}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pronunciation</div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgPronunciation}</div>
          </div>
        </div>
      </section>

      {/* Band Progression Pathway */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#7C3AED] dark:text-purple-400" />
          <span>Band Progression Pathway</span>
        </h2>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {tests
            .slice(0, 8)
            .reverse()
            .map((t, idx, arr) => (
              <div key={t.id} className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                  <BandBadge score={t.overallBand} size="sm" />
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(t.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                {idx < arr.length - 1 && <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>}
              </div>
            ))}
        </div>
      </section>

      {/* Complete Historical Exams List */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Completed Examination Log</h2>

        <div className="space-y-3">
          {tests.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <BandBadge score={t.overallBand} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Overall Band {t.overallBand.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    FC: {t.fluencyBand.toFixed(1)} • LR: {t.lexicalBand.toFixed(1)} • GRA:{' '}
                    {t.grammarBand.toFixed(1)} • P: {t.pronunciationBand !== null ? t.pronunciationBand.toFixed(1) : '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right hidden md:block">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Weakest Skill
                  </div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {t.weakestArea.split('(')[0]}
                  </div>
                </div>

                <Link
                  href={`/results/${t.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-[#7C3AED] dark:text-purple-400 hover:text-purple-700 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center gap-1"
                >
                  <span>View Evaluation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DisclaimerBanner />
    </div>
  );
}
