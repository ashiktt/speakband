// SpeakBand — Home Dashboard (Matching Mockup Screen 1)

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
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
  Play,
} from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { BandBadge } from '@/components/BandBadge';
import { TestHistorySummary } from '@/types/ielts';

export default function HomeDashboard() {
  const [currentBand, setCurrentBand] = useState<number | null>(null);
  const [targetBand, setTargetBand] = useState<number>(7.5);
  const [weakestSkill, setWeakestSkill] = useState<string | null>(null);
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
      {/* Hero Welcome Card (Matching Mockup Screen 1) */}
      <section className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden transition-colors">
        {/* Ambient lavender/purple glow */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Column: Title, Subtitle, and Primary Actions */}
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your AI IELTS <br className="hidden sm:inline" />
              Speaking Coach
            </h1>
            <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Practice. Improve. Achieve your target band.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/25 active:scale-98 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Full Test (11–14 mins)</span>
              </Link>

              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 font-bold text-xs sm:text-sm border border-purple-200 dark:border-purple-800 transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
                <span>Practice Mode (Skill Drills)</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Target Band Widget (Inside Hero as in Screen 1) */}
          <div className="self-center md:self-auto w-full md:w-auto flex flex-col items-center justify-center p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60 min-w-[140px] text-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Target className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
              <span>Target Band</span>
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-black text-[#7C3AED] dark:text-purple-300 my-1">
              {targetBand.toFixed(1)}
            </div>
            <button
              type="button"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="text-xs font-semibold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer"
            >
              {isEditingTarget ? 'Done' : 'Edit'}
            </button>

            {isEditingTarget && (
              <div className="flex flex-wrap items-center justify-center gap-1 mt-2.5 max-w-[150px]">
                {[6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => handleUpdateTargetBand(band)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                      targetBand === band
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KPI Metrics Dashboard (Matching Mockup Screen 1) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Current Band */}
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-100 dark:border-purple-800/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Current Band</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentBand !== null ? currentBand.toFixed(1) : '—'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentBand !== null ? 'AI Assessment' : 'No tests yet'}
            </div>
          </div>
        </div>

        {/* Card 2: Target Band */}
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-100 dark:border-purple-800/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Band</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#7C3AED] dark:text-purple-300 mt-0.5">
              {targetBand.toFixed(1)}
            </div>
            <button
              type="button"
              onClick={() => setIsEditingTarget(true)}
              className="text-[11px] font-semibold text-[#7C3AED] dark:text-purple-400 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Card 3: Improvement */}
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-100 dark:border-purple-800/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Improvement</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {progressDiff || 'Baseline'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {testHistory.length > 0 ? `${testHistory.length} test(s) taken` : 'Start your test'}
            </div>
          </div>
        </div>
      </section>

      {/* Weakest Skill Section (Matching Mockup Screen 1) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Weakest Skill</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Weakest Skill Recommendation Card */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-colors">
            {weakestSkill ? (
              <>
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full mb-3">
                    Focus Area
                  </span>
                  <div className="text-2xl font-bold text-[#7C3AED] dark:text-purple-300">
                    {weakestSkill}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Targeted speaking drills designed specifically to elevate this criterion based on your recorded performance.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/practice?skill=${encodeURIComponent(weakestSkill)}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all"
                  >
                    <span>Practice Focus Area</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full mb-3">
                    Baseline Needed
                  </span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    Discover Your Priority Area
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Complete your first simulated speaking test to diagnose your priority area across Fluency, Lexical Resource, Grammar, and Pronunciation.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/test"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all"
                  >
                    <span>Take Baseline Test</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Quick Part Practice Actions */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Targeted Part Practice</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practice individual IELTS sections to build confidence.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <Link
                  href="/practice?part=1"
                  className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                >
                  <div className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 uppercase tracking-wider">
                    Part 1
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300">
                    Interview
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Familiar topics & personal experiences.
                  </p>
                </Link>

                <Link
                  href="/practice?part=2"
                  className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/30 transition-all"
                >
                  <div className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 uppercase tracking-wider">
                    Part 2
                  </div>
                  <div className="font-bold text-[#7C3AED] dark:text-purple-300 text-sm mt-1">
                    2-Min Fluency
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    1-min prep & sustained speech without pauses.
                  </p>
                </Link>

                <Link
                  href="/practice?part=3"
                  className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                >
                  <div className="text-xs font-bold text-[#EC4899] dark:text-pink-400 uppercase tracking-wider">
                    Part 3
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 group-hover:text-[#EC4899] dark:group-hover:text-pink-300">
                    Discussion
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Complex ideas & societal issues.
                  </p>
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>IELTS-structured exam simulation</span>
              <Link
                href="/practice"
                className="text-[#7C3AED] dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
              >
                All 5 speaking drills <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step IELTS Preparation Roadmap for New Users */}
      {testHistory.length === 0 && (
        <section className="bg-gradient-to-br from-purple-50/70 via-white to-pink-50/40 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 font-bold text-[10px] uppercase tracking-wider mb-2">
                Your Roadmap to Band 7.5+
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                5-Step IELTS Speaking Mastery
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                How SpeakBand evaluates your performance and coaches you to score higher.
              </p>
            </div>

            <Link
              href="/test"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs shadow-sm hover:opacity-95 transition shrink-0"
            >
              <span>Step 1: Start Baseline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {[
              {
                step: '01',
                title: 'Baseline Test',
                desc: 'Full 11–14 min IELTS simulation covering Parts 1, 2, and 3.',
                active: true,
              },
              {
                step: '02',
                title: 'AI Scoring',
                desc: 'Official criteria scoring across Fluency, Lexical, Grammar, and Pronunciation.',
                active: false,
              },
              {
                step: '03',
                title: 'Identify Gaps',
                desc: 'Discover your exact weakest criterion based on spoken transcripts.',
                active: false,
              },
              {
                step: '04',
                title: 'Targeted Drills',
                desc: 'Practice bite-sized exercises with instant feedback & model Band 8.5+ phrasing.',
                active: false,
              },
              {
                step: '05',
                title: 'Track & Retest',
                desc: 'Measure improvements, monitor trajectory, and hit your target band.',
                active: false,
              },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-4 rounded-2xl border transition-all ${
                  s.active
                    ? 'bg-white dark:bg-slate-950 border-purple-300 dark:border-purple-700 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="font-mono text-xs font-black text-[#7C3AED] dark:text-purple-400">
                  {s.step}
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mt-1">
                  {s.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Test History */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Test History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only verified completed examinations are recorded.
            </p>
          </div>
          <Link
            href="/progress"
            className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View Full Progress <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {testHistory.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-purple-100 dark:border-slate-800 rounded-2xl">
            <Mic className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No completed tests yet</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Take your first simulated IELTS Speaking exam to generate your baseline band score and report.
            </p>
            <Link
              href="/test"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs mt-4 shadow-xs transition"
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
                      <span>P: {test.pronunciationBand !== null ? test.pronunciationBand.toFixed(1) : '—'}</span>
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
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-[#7C3AED] dark:text-purple-400 hover:text-purple-700 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center gap-1"
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
