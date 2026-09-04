// SpeakBand — Candidate Progress & Criterion Analytics (QuizTube Styled)

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
  Layers,
} from 'lucide-react';
import { IeltsEvaluationResult } from '@/types/ielts';
import { StorageService } from '@/lib/storage';
import { BandBadge } from '@/components/BandBadge';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

export default function ProgressPage() {
  const [tests, setTests] = useState<IeltsEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const data = await StorageService.getAllTests();
      setTests(data);
      setIsLoading(false);
    }
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500 dark:text-slate-400">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium">Loading progress analytics...</p>
      </div>
    );
  }

  const totalTests = tests.length;
  const latestTest = totalTests > 0 ? tests[0] : null;
  const oldestTest = totalTests > 0 ? tests[totalTests - 1] : null;
  const bandDifference =
    latestTest && oldestTest && totalTests > 1
      ? (latestTest.overallBand - oldestTest.overallBand).toFixed(1)
      : null;

  const avgFluency =
    totalTests > 0
      ? (tests.reduce((acc, t) => acc + t.fluencyBand, 0) / totalTests).toFixed(1)
      : '—';
  const avgLexical =
    totalTests > 0
      ? (tests.reduce((acc, t) => acc + t.lexicalBand, 0) / totalTests).toFixed(1)
      : '—';
  const avgGrammar =
    totalTests > 0
      ? (tests.reduce((acc, t) => acc + t.grammarBand, 0) / totalTests).toFixed(1)
      : '—';
  const avgPronunciation =
    totalTests > 0
      ? (tests.reduce((acc, t) => acc + t.pronunciationBand, 0) / totalTests).toFixed(1)
      : '—';

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header (QuizTube Style) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm sm:shadow-md relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Verified Performance Trajectory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              IELTS Speaking Analytics & Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Track your band progression across all 4 official assessment criteria. No simulated or artificial progress points are generated.
            </p>
          </div>

          <Link
            href="/test"
            className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Take Another Test</span>
          </Link>
        </div>
      </section>

      {/* KPI Cards (QuizTube Style) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Exams Taken
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-slate-900 dark:text-white">{totalTests}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Full 11–14 min simulated exams</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Band
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {latestTest ? latestTest.overallBand.toFixed(1) : '—'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Latest AI estimated band</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Band Trajectory
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {bandDifference !== null
              ? Number(bandDifference) > 0
                ? `+${bandDifference}`
                : bandDifference
              : 'Baseline'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Since initial diagnostic</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Improvement Need
          </span>
          <div className="mt-2 font-serif text-lg font-bold text-amber-600 dark:text-amber-400 truncate">
            {latestTest ? latestTest.weakestArea.split('(')[0] : '—'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Based on latest test evidence</p>
        </div>
      </section>

      {/* Criteria Breakdown Average Cards */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
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
      {totalTests > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Band Progression Pathway</span>
          </h2>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {tests
              .slice(0, 8)
              .reverse()
              .map((t, idx, arr) => (
                <div key={t.id} className="flex items-center gap-3 shrink-0">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
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
      )}

      {/* Complete Historical Exams List (QuizTube Study Library Style) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Completed Examination Log</h2>

        {totalTests === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Award className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No completed exams logged</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Simulate your first IELTS Speaking exam to generate permanent assessment records.
            </p>
            <Link
              href="/test"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs mt-4 shadow-sm"
            >
              Start Full Exam
            </Link>
          </div>
        ) : (
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
                      {t.grammarBand.toFixed(1)} • P: {t.pronunciationBand.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Weakest Skill
                    </div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{t.weakestArea}</div>
                  </div>

                  <Link
                    href={`/results/${t.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 hover:text-purple-700 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition flex items-center gap-1"
                  >
                    <span>View Evaluation</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <DisclaimerBanner />
    </div>
  );
}
