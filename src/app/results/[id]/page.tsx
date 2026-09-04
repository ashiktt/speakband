// SpeakBand — IELTS Results & Full Answer Review Dashboard (QuizTube Styled)

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { IeltsEvaluationResult } from '@/types/ielts';
import { StorageService } from '@/lib/storage';
import { BandBadge } from '@/components/BandBadge';
import { CriterionCard } from '@/components/CriterionCard';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { CircularScoreRing } from '@/components/CircularScoreRing';
import { CRITERIA_DESCRIPTORS } from '@/lib/scoringEngine';

export default function ResultsDashboard() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const [evaluation, setEvaluation] = useState<IeltsEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadResult() {
      if (!resultId) return;
      const data = await StorageService.getTestResult(resultId);
      if (data) {
        setEvaluation(data);
        setExpandedReviews({ 0: true, 1: true });
      }
      setIsLoading(false);
    }
    loadResult();
  }, [resultId]);

  const toggleReviewExpand = (idx: number) => {
    setExpandedReviews((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500 dark:text-slate-400">
        <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Loading official evaluation report...</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Evaluation Report Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We could not locate this test record. You can start a new exam or check your progress dashboard.
        </p>
        <Link
          href="/test"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md"
        >
          Start New Examination
        </Link>
      </div>
    );
  }

  const weakestSkillName = evaluation.weakestArea.split('(')[0].trim() || 'Lexical Resource';

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Top Banner: AI Estimated IELTS Speaking Band (QuizTube Hero Style) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm sm:shadow-md relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Official IELTS Band Scale (0–9)
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI ESTIMATED IELTS SPEAKING BAND
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {evaluation.performanceSummary}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                href={`/practice?skill=${encodeURIComponent(weakestSkillName)}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
              >
                <span>Improve My Weakest Skill</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Take Another Test</span>
              </Link>
            </div>
          </div>

          <BandBadge score={evaluation.overallBand} size="hero" label="Overall Band" />
        </div>
      </section>

      {/* Circular Gauges Summary Row matching Mockup Screen 4 */}
      <section className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Criteria Score Gauges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official IELTS 0–9 scale circular performance breakdown.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#7C3AED] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-xl w-fit">
            Equal 25% Weighting
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center justify-items-center py-2">
          <CircularScoreRing label="Fluency & Coherence" score={evaluation.fluencyBand} size={84} />
          <CircularScoreRing label="Lexical Resource" score={evaluation.lexicalBand} size={84} />
          <CircularScoreRing label="Grammatical Range" score={evaluation.grammarBand} size={84} />
          <CircularScoreRing label="Pronunciation" score={evaluation.pronunciationBand} size={84} />
        </div>
      </section>

      {/* 4 Criteria Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            IELTS Assessment Criteria Breakdown
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Equal 25% Weighting per Criterion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <CriterionCard
            name="Fluency & Coherence"
            score={evaluation.fluencyBand}
            description={CRITERIA_DESCRIPTORS.fluency_coherence.description}
            evidence={evaluation.evidence.fluency}
            isWeakest={evaluation.weakestArea.toLowerCase().includes('fluency')}
            isStrongest={evaluation.strongestArea.toLowerCase().includes('fluency')}
            onPracticeClick={() => router.push('/practice?skill=Fluency%20%26%20Coherence')}
          />

          <CriterionCard
            name="Lexical Resource"
            score={evaluation.lexicalBand}
            description={CRITERIA_DESCRIPTORS.lexical_resource.description}
            evidence={evaluation.evidence.lexical}
            isWeakest={evaluation.weakestArea.toLowerCase().includes('lexical')}
            isStrongest={evaluation.strongestArea.toLowerCase().includes('lexical')}
            onPracticeClick={() => router.push('/practice?skill=Lexical%20Resource')}
          />

          <CriterionCard
            name="Grammatical Range"
            score={evaluation.grammarBand}
            description={CRITERIA_DESCRIPTORS.grammatical_range_accuracy.description}
            evidence={evaluation.evidence.grammar}
            isWeakest={evaluation.weakestArea.toLowerCase().includes('grammar')}
            isStrongest={evaluation.strongestArea.toLowerCase().includes('grammar')}
            onPracticeClick={() => router.push('/practice?skill=Grammatical%20Range%20%26%20Accuracy')}
          />

          <CriterionCard
            name="Pronunciation"
            score={evaluation.pronunciationBand}
            description={CRITERIA_DESCRIPTORS.pronunciation.description}
            evidence={evaluation.evidence.pronunciation}
            audioNote={evaluation.pronunciationNote}
            isWeakest={evaluation.weakestArea.toLowerCase().includes('pronunciation')}
            isStrongest={evaluation.strongestArea.toLowerCase().includes('pronunciation')}
            onPracticeClick={() => router.push('/practice?skill=Pronunciation')}
          />
        </div>
      </section>

      {/* Strongest & Weakest Analysis */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strongest Area</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{evaluation.strongestArea}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Consistently demonstrated confident control and natural delivery within this assessment domain.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Weakest Area</span>
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{evaluation.weakestArea}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Prioritize this criterion in your practice routine to see the fastest overall band score increase.
          </p>
        </div>
      </section>

      {/* Key Problems & Recommendations */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Key Observed Weaknesses</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {evaluation.keyProblems.map((prob, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>{prob}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Examiner Recommended Actions</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {evaluation.recommendedActions.map((act, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0 mt-1.5" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Actual Observed Grammatical Mistakes (NO FABRICATIONS) */}
      {evaluation.actualMistakes.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Actual Observed Spoken Errors ({evaluation.actualMistakes.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Only mistakes you actually spoke during the test are reported below. No simulated errors.
          </p>

          <div className="space-y-3">
            {evaluation.actualMistakes.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="font-bold uppercase text-rose-600 dark:text-rose-400">Spoken:</span>
                  <span className="text-slate-800 dark:text-slate-200">&ldquo;{m.original}&rdquo;</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">Correction:</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">&ldquo;{m.correction}&rdquo;</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
                  {m.explanation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Question-by-Question Answer Review Accordion */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Full Examination Answer Review</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review each response, observed issues, Band 8.5+ model phrasing, and high-utility collocations.
          </p>
        </div>

        <div className="space-y-3.5">
          {evaluation.answerReviews.map((rev, idx) => {
            const isExpanded = Boolean(expandedReviews[idx]);

            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-slate-950/70 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleReviewExpand(idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">
                      Part {rev.part} • {rev.topic}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{rev.question}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4 text-xs border-t border-slate-200 dark:border-slate-900">
                    {/* What Candidate Said */}
                    <div>
                      <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 text-[11px]">
                        What You Said:
                      </div>
                      <p className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic border border-slate-200 dark:border-slate-800">
                        &ldquo;{rev.candidateTranscript}&rdquo;
                      </p>
                    </div>

                    {/* Key Issues */}
                    {rev.keyIssues && rev.keyIssues.length > 0 && (
                      <div>
                        <div className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 text-[11px]">
                          Examiner Observations:
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                          {rev.keyIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Band 8.5 Model Phrasing */}
                    {rev.betterVersion && (
                      <div>
                        <div className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1.5 text-[11px]">
                          Band 8.5+ High-Scoring Phrasing:
                        </div>
                        <p className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                          {rev.betterVersion}
                        </p>
                      </div>
                    )}

                    {/* Useful Collocations */}
                    {rev.usefulLanguage && rev.usefulLanguage.length > 0 && (
                      <div>
                        <div className="font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-1.5 text-[11px]">
                          High-Yield Collocations & Phrasing:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {rev.usefulLanguage.map((lang, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 font-mono text-[11px] font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <DisclaimerBanner />
    </div>
  );
}
