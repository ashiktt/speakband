// SpeakBand — Home Dashboard (QuizTube Design System)

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  Play,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  Activity,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { BandBadge } from '@/components/BandBadge';
import { TestHistorySummary } from '@/types/ielts';

export default function HomeDashboard() {
  const [currentBand, setCurrentBand] = useState<number | null>(null);
  const [targetBand, setTargetBand] = useState<number>(7.5);
  const [weakestSkill, setWeakestSkill] = useState<string>('Lexical Resource');
  const [testHistory, setTestHistory] = useState<TestHistorySummary[]>([]);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  useEffect(() => {
    const latest = StorageService.getLatestEstimatedBand();
    const target = StorageService.getTargetBand();
    const weakest = StorageService.getWeakestSkill();
    const history = StorageService.getTestHistorySummaries();

    setCurrentBand(latest);
    setTargetBand(target);
    setWeakestSkill(weakest);
    setTestHistory(history);
  }, []);

  const handleUpdateTargetBand = (newBand: number) => {
    setTargetBand(newBand);
    StorageService.setTargetBand(newBand);
    setIsEditingTarget(false);
  };

  const calculateProgress = () => {
    if (testHistory.length < 2) return null;
    const latest = testHistory[0].overallBand;
    const initial = testHistory[testHistory.length - 1].overallBand;
    const diff = latest - initial;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  const progressDiff = calculateProgress();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome Card (QuizTube Style) */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm sm:shadow-md transition-colors">
        {/* Subtle QuizTube purple ambient blur in background */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Official IELTS Band Descriptors (0–9)
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            SpeakBand
          </h1>
          <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mt-1">
            Your AI IELTS Speaking Coach.
          </p>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            Simulate authentic IELTS Speaking examinations under real exam conditions. The examination operates inside a controlled, rule-based exam engine—with AI evaluating your fluency, lexical resource, grammatical accuracy, and acoustic pronunciation.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6">
            <Link
              href="/test"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>START FULL TEST (11–14 MINS)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Practice Speaking</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Metrics Dashboard (QuizTube Style Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Current Band Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Current Estimated Band
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {currentBand !== null ? currentBand.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {currentBand !== null ? 'AI Assessment' : 'Diagnostic needed'}
              </span>
            </div>
          </div>
          {currentBand !== null && <BandBadge score={currentBand} size="lg" />}
        </div>

        {/* Target Band Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Target className="w-4 h-4 text-amber-500" />
              Target Band
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                {targetBand.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingTarget(!isEditingTarget)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isEditingTarget ? 'Close' : 'Adjust'}
              </button>
            </div>
            {isEditingTarget && (
              <div className="flex items-center gap-1 mt-2">
                {[6.5, 7.0, 7.5, 8.0, 8.5].map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => handleUpdateTargetBand(band)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                      targetBand === band
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center">
            <Target className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Improvement Trend Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Improvement Trend
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {progressDiff || 'Baseline'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {testHistory.length > 0 ? `${testHistory.length} test(s) taken` : 'Start your first test'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </section>

      {/* Weakest Skill Spotlight & Quick Part Drills */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Weakest Skill Recommendation Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full mb-3">
              Identified Focus Area
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Weakest Skill</h2>
            <div className="font-serif text-2xl text-purple-700 dark:text-purple-300 font-bold mt-2">
              {weakestSkill}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Targeted speaking exercises designed specifically to elevate this criterion based on your actual speech patterns.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={`/practice?skill=${encodeURIComponent(weakestSkill)}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              <span>Practice Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Part Practice Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Targeted Part Practice</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Prefer practicing individual IELTS sections? Choose a specific part to rehearse.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <Link
                href="/practice?part=1"
                className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
              >
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Part 1
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Introduction & Interview
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Familiar topics, daily routines & personal preferences.
                </p>
              </Link>

              <Link
                href="/practice?part=2"
                className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
              >
                <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Part 2
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Cue Card Long Turn
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  1-min preparation & sustained 2-min uninterrupted speech.
                </p>
              </Link>

              <Link
                href="/practice?part=3"
                className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
              >
                <div className="text-xs font-extrabold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                  Part 3
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                  Two-Way Discussion
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Analytical, abstract & societal issue exploration.
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Official examiners do not coach or interrupt during tests.</span>
            <Link
              href="/practice"
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              Explore all coaching drills <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Test History (QuizTube Study Library Style) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Test History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only verified completed examinations are recorded.
            </p>
          </div>
          <Link
            href="/progress"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View Full Progress <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {testHistory.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Mic className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No completed tests yet</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Take your first simulated IELTS Speaking exam to generate your baseline band score and evidence report.
            </p>
            <Link
              href="/test"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs mt-4 shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Begin Full Exam</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {testHistory.slice(0, 4).map((test) => (
              <div
                key={test.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 transition"
              >
                <div className="flex items-center gap-3">
                  <BandBadge score={test.overallBand} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                        Band {test.overallBand.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(test.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(test.testDurationSeconds / 60)} mins
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>FC: {test.fluencyBand.toFixed(1)}</span>
                      <span>LR: {test.lexicalBand.toFixed(1)}</span>
                      <span>GRA: {test.grammarBand.toFixed(1)}</span>
                      <span>P: {test.pronunciationBand.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Weakest Criterion</div>
                    <div className="text-xs font-bold text-amber-500">{test.weakestSkill}</div>
                  </div>
                  <Link
                    href={`/results/${test.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:text-purple-700 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition flex items-center gap-1"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
