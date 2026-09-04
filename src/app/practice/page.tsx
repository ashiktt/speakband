// SpeakBand — Personalized IELTS Speaking Drills & Coaching (Matching Mockup Screens 2, 3 & 4)

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Mic,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Award,
  Layers,
  ChevronRight,
  ArrowLeft,
  Volume2,
  Check,
} from 'lucide-react';
import { PracticeDrill, PracticeFeedback, MicState, DrillType } from '@/types/ielts';
import { StorageService } from '@/lib/storage';
import { SpeechRecognitionManager } from '@/lib/speech/stt';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { CircularScoreRing } from '@/components/CircularScoreRing';
import { reconcilePracticeFeedback } from '@/lib/scoringEngine';
import { PracticeSessionMemory } from '@/lib/practiceCoach';
import { getUnusedPracticeQuestion, PART_1_TOPICS, Part1TopicName } from '@/lib/questionBank';

interface DrillConfig {
  type: DrillType;
  title: string;
  subtitle: string;
  focusSkill: string;
  icon: React.ComponentType<{ className?: string }>;
  timeSeconds: number;
  samplePrompt: string;
  sampleTips: string[];
}

const DRILL_CONFIGS: DrillConfig[] = [
  {
    type: 'vocabulary_challenge',
    title: 'Topic Vocabulary',
    subtitle: 'Enrich lexical precision and C1/C2 topical vocabulary.',
    focusSkill: 'Lexical Resource',
    icon: BookOpen,
    timeSeconds: 90,
    samplePrompt: 'Discuss the environmental impact of urban expansion and suggest sustainable alternatives.',
    sampleTips: ['urban sprawl', 'ecological footprint', 'renewable infrastructure', 'biodiversity loss'],
  },
  {
    type: 'fluency_challenge',
    title: '2-Min Fluency',
    subtitle: 'Speak on the given topic for 2 minutes without stopping.',
    focusSkill: 'Fluency & Coherence',
    icon: Clock,
    timeSeconds: 120,
    samplePrompt: 'Describe a memorable journey you took that did not go according to plan.',
    sampleTips: ['unexpected events', 'how you handled it', 'what you learned', 'would you do it again'],
  },
  {
    type: 'grammar_challenge',
    title: 'Complex Sentences',
    subtitle: 'Demonstrate subordinate clauses, conditionals, and passive voice.',
    focusSkill: 'Grammatical Range & Accuracy',
    icon: Layers,
    timeSeconds: 90,
    samplePrompt: 'Compare the benefits of traditional classroom learning with modern AI-assisted education.',
    sampleTips: ['conditional structures', 'relative clauses', 'concession markers', 'passive voice'],
  },
  {
    type: 'pronunciation_challenge',
    title: 'Pronunciation & Stress',
    subtitle: 'Focus on syllable stress, connected speech, and phonological rhythm.',
    focusSkill: 'Pronunciation',
    icon: Volume2,
    timeSeconds: 60,
    samplePrompt: 'Explain why learning a second language can be challenging for adult learners.',
    sampleTips: ['word stress', 'intonation rises', 'connected speech', 'vowel clarity'],
  },
  {
    type: 'cue_card_challenge',
    title: 'Part 2 Cue Card',
    subtitle: 'Authentic 2-minute uninterrupted monologue with cue prompts.',
    focusSkill: 'Part 2 Long Turn',
    icon: Award,
    timeSeconds: 120,
    samplePrompt: 'Describe an accomplishment you are particularly proud of. You should say what it was, when it happened, and why it was meaningful.',
    sampleTips: ['preparation details', 'obstacles overcome', 'personal significance', 'future impact'],
  },
];

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSkill = searchParams.get('skill');
  const requestedPart = searchParams.get('part');

  // Mode: 'selection' (Screen 2) | 'challenge' (Screen 3) | 'feedback' (Screen 4)
  const [activeDrill, setActiveDrill] = useState<DrillConfig | null>(null);
  const [currentDrillData, setCurrentDrillData] = useState<PracticeDrill | null>(null);
  const [sessionMemory, setSessionMemory] = useState<PracticeSessionMemory | null>(null);
  const [isLoadingDrill, setIsLoadingDrill] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  // Spoken response state
  const [micState, setMicState] = useState<MicState>('IDLE');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [candidateTranscript, setCandidateTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sttRef = useRef<SpeechRecognitionManager | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sttRef.current = new SpeechRecognitionManager();

    // If navigated with URL parameter (e.g. from Dashboard), select the matching drill
    if (requestedSkill) {
      const match = DRILL_CONFIGS.find((d) =>
        d.focusSkill.toLowerCase().includes(requestedSkill.toLowerCase().split(' ')[0])
      );
      if (match) {
        handleOpenDrill(match);
      }
    } else if (requestedPart === '2') {
      const match = DRILL_CONFIGS.find((d) => d.type === 'cue_card_challenge');
      if (match) {
        handleOpenDrill(match);
      }
    }

    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [requestedSkill, requestedPart]);

  const handleOpenDrill = async (drill: DrillConfig) => {
    setActiveDrill(drill);
    setFeedback(null);
    setCandidateTranscript('');
    setErrorMessage(null);
    setIsLoadingDrill(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const recentlyUsedTopics = StorageService.getRecentlyUsedTopics();

    try {
      const res = await fetch('/api/coaching/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_drill',
          weakestSkill: drill.focusSkill,
          focusSkill: drill.focusSkill,
          drillType: drill.type,
          recentlyUsedTopics,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success && data.drill) {
        setCurrentDrillData(data.drill);
        if (data.memory) {
          setSessionMemory(data.memory);
          if (data.memory.currentTopic) {
            StorageService.addRecentlyUsedTopics([data.memory.currentTopic]);
          }
        }
      } else {
        // Fallback using dynamic question from questionBank
        const availableTopics = PART_1_TOPICS.filter((t) => !recentlyUsedTopics.includes(t));
        const selectedTopic = (availableTopics.length > 0 ? availableTopics[0] : 'free_time') as Part1TopicName;
        const dynamicFallback = getUnusedPracticeQuestion(selectedTopic, []);

        setCurrentDrillData({
          id: dynamicFallback.id,
          drillType: drill.type,
          focusSkill: drill.focusSkill,
          title: drill.title === '2-Min Fluency' ? '2-Minute Fluency & Continuity Challenge' : drill.title + ' Challenge',
          description: drill.subtitle,
          instructions: drill.subtitle,
          prompt: dynamicFallback.question,
          timeLimitSeconds: drill.timeSeconds,
          targetCollocations: drill.sampleTips,
          modelAnswer: '',
        });
        setSessionMemory({
          currentTopic: selectedTopic,
          topicQuestionCount: 1,
          askedQuestions: [dynamicFallback.question],
          recentTopics: recentlyUsedTopics,
          conversationHistory: [{ role: 'coach', text: dynamicFallback.question, topic: selectedTopic }],
        });
      }
    } catch {
      // Use dynamic question from questionBank
      const availableTopics = PART_1_TOPICS.filter((t) => !recentlyUsedTopics.includes(t));
      const selectedTopic = (availableTopics.length > 0 ? availableTopics[0] : 'free_time') as Part1TopicName;
      const dynamicFallback = getUnusedPracticeQuestion(selectedTopic, []);

      setCurrentDrillData({
        id: dynamicFallback.id,
        drillType: drill.type,
        focusSkill: drill.focusSkill,
        title: drill.title === '2-Min Fluency' ? '2-Minute Fluency & Continuity Challenge' : drill.title + ' Challenge',
        description: drill.subtitle,
        instructions: drill.subtitle,
        prompt: dynamicFallback.question,
        timeLimitSeconds: drill.timeSeconds,
        targetCollocations: drill.sampleTips,
        modelAnswer: '',
      });
      setSessionMemory({
        currentTopic: selectedTopic,
        topicQuestionCount: 1,
        askedQuestions: [dynamicFallback.question],
        recentTopics: recentlyUsedTopics,
        conversationHistory: [{ role: 'coach', text: dynamicFallback.question, topic: selectedTopic }],
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingDrill(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeDrill) return;

    setIsLoadingNext(true);
    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const recentlyUsedTopics = StorageService.getRecentlyUsedTopics();

    try {
      const res = await fetch('/api/coaching/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'next_question',
          memory: sessionMemory,
          focusSkill: activeDrill.focusSkill,
          drillType: activeDrill.type,
          candidateResponse: candidateTranscript || undefined,
          recentlyUsedTopics,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success && data.drill) {
        setCurrentDrillData(data.drill);
        if (data.memory) {
          setSessionMemory(data.memory);
          if (data.memory.currentTopic) {
            StorageService.addRecentlyUsedTopics([data.memory.currentTopic]);
          }
        }
        setFeedback(null);
        setCandidateTranscript('');
        setRecordingSeconds(0);
        setMicState('IDLE');
      } else {
        throw new Error(data.error || 'Failed to load next question');
      }
    } catch (err) {
      console.warn('[SpeakBand Practice] Fallback for next question:', err);
      // Resilient fallback: rotate topic if topicQuestionCount >= 3 or pick next unused
      const asked = sessionMemory?.askedQuestions || [];
      const currentTopic = (sessionMemory?.currentTopic || 'free_time') as Part1TopicName;
      const count = sessionMemory?.topicQuestionCount || 0;

      let nextTopic = currentTopic;
      let nextCount = count + 1;
      if (count >= 3) {
        const pool = PART_1_TOPICS.filter((t) => t !== currentTopic && !recentlyUsedTopics.includes(t));
        nextTopic = (pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 'hometown') as Part1TopicName;
        nextCount = 1;
      }

      const fallback = getUnusedPracticeQuestion(nextTopic, asked);
      setCurrentDrillData({
        id: fallback.id,
        drillType: activeDrill.type,
        focusSkill: activeDrill.focusSkill,
        title: activeDrill.title === '2-Min Fluency' ? '2-Minute Fluency & Continuity Challenge' : activeDrill.title + ' Challenge',
        description: activeDrill.subtitle,
        instructions: activeDrill.subtitle,
        prompt: fallback.question,
        timeLimitSeconds: activeDrill.timeSeconds,
        targetCollocations: activeDrill.sampleTips,
        modelAnswer: '',
      });
      setSessionMemory({
        currentTopic: nextTopic,
        topicQuestionCount: nextCount,
        askedQuestions: [...asked, fallback.question],
        recentTopics: Array.from(new Set([...recentlyUsedTopics, nextTopic])),
        conversationHistory: [
          ...(sessionMemory?.conversationHistory || []),
          ...(candidateTranscript ? [{ role: 'student' as const, text: candidateTranscript }] : []),
          { role: 'coach' as const, text: fallback.question, topic: nextTopic },
        ],
      });
      setFeedback(null);
      setCandidateTranscript('');
      setRecordingSeconds(0);
      setMicState('IDLE');
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingNext(false);
    }
  };

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setCandidateTranscript('');
    setRecordingSeconds(0);
    setFeedback(null);

    if (sttRef.current) {
      const started = await sttRef.current.startRecording({
        onTranscript: (txt) => setCandidateTranscript(txt),
        onAudioLevel: (lvl) => setAudioLevel(lvl),
        onError: (err) => {
          setErrorMessage(err);
          setMicState('ERROR');
        },
      });

      if (started) {
        setMicState('RECORDING');
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => {
            const next = prev + 1;
            const maxTime = activeDrill?.timeSeconds || 120;
            if (next >= maxTime) {
              handleStopRecordingAndEvaluate();
            }
            return next;
          });
        }, 1000);
      }
    }
  };

  const handleStopRecordingAndEvaluate = async (textOverride?: string) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setMicState('PROCESSING');
    setIsEvaluating(true);

    let finalTranscript = candidateTranscript;
    let audioBase64: string | undefined = undefined;
    let audioMimeType: string | undefined = undefined;
    let durationSeconds: number | undefined = undefined;

    if (sttRef.current && sttRef.current.isRecording()) {
      const res = await sttRef.current.stopRecording();
      finalTranscript = textOverride || res.transcript || candidateTranscript;
      audioBase64 = res.audioBase64 || undefined;
      audioMimeType = res.audioMimeType;
      durationSeconds = res.durationSeconds;
    } else if (textOverride) {
      finalTranscript = textOverride;
    }

    if (!finalTranscript.trim()) {
      setErrorMessage('Please speak into your microphone before requesting evaluation.');
      setMicState('IDLE');
      setIsEvaluating(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch('/api/coaching/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_drill',
          drill: currentDrillData,
          candidateResponse: finalTranscript,
          audioBase64,
          audioMimeType,
          durationSeconds,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedback(data.feedback);
      } else {
        throw new Error(data.error || 'Evaluation failed. Please try speaking again.');
      }
    } catch (err: any) {
      console.error('[SpeakBand Practice] Evaluation error:', err);
      setErrorMessage(
        err.name === 'AbortError'
          ? 'The evaluation request timed out. Please try speaking again.'
          : err.message || 'Evaluation could not be completed. Please try again.'
      );
    } finally {
      setIsEvaluating(false);
      setMicState('IDLE');
    }
  };

  // =========================================================================
  // SCREEN 4: RESULTS / FEEDBACK VIEW
  // =========================================================================
  if (feedback && activeDrill) {
    const practiceBand = feedback.practiceBandEstimate ?? feedback.fluencyScore ?? 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-400">
        {/* Top Header: Back Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Practice Drills ({activeDrill.title})</span>
          </button>

          <Link
            href="/test"
            className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:underline"
          >
            Take Full Exam →
          </Link>
        </div>

        {/* Feedback Card (Matching Mockup Screen 4) */}
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          {/* Title & Score Header */}
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Practice Drill Feedback
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 font-bold text-[10px] uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                Practice Band Estimate
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Single-drill evaluation • Not an official IELTS exam result
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 pt-1">
              <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                {practiceBand > 0 ? practiceBand.toFixed(1) : '—'}
              </span>
              <span className="text-xs font-semibold text-[#7C3AED] dark:text-purple-300">
                {practiceBand >= 7.5
                  ? 'Demonstrated strong grammatical control and natural fluency.'
                  : practiceBand >= 6.0
                  ? 'Competent effort. Focus on targeted corrections below.'
                  : practiceBand >= 4.5
                  ? 'Identified key priority areas to refine on your next attempt.'
                  : 'Basic communicative attempt. Needs substantial development in grammatical and lexical control.'}
              </span>
            </div>
          </div>

          {/* 4 Circular Score Indicators in a Row (Matching Mockup Screen 4) */}
          <div className="p-4 sm:p-6 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/40">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center justify-items-center">
              <CircularScoreRing label="Fluency" score={feedback.fluencyScore} />
              <CircularScoreRing
                label="Lexical Resource"
                score={feedback.lexicalScore}
              />
              <CircularScoreRing label="Grammar" score={feedback.grammarScore} />
              <CircularScoreRing
                label={feedback.pronunciationScore !== null ? "Pronunciation" : "Pronunciation (No Audio)"}
                score={feedback.pronunciationScore}
              />
            </div>
          </div>

          {/* Why you received this score (Evidence Breakdown) */}
          {feedback.criterionEvidence && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Why you received this score
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Fluency & Coherence — {typeof feedback.fluencyScore === 'number' ? feedback.fluencyScore.toFixed(1) : '—'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {feedback.criterionEvidence.fluency?.[0] || 'Evaluated on speech continuity, pauses, and flow.'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Lexical Resource — {typeof feedback.lexicalScore === 'number' ? feedback.lexicalScore.toFixed(1) : '—'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {feedback.criterionEvidence.lexical?.[0] || 'Evaluated on vocabulary choice, collocations, and range.'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Grammar — {typeof feedback.grammarScore === 'number' ? feedback.grammarScore.toFixed(1) : '—'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {feedback.criterionEvidence.grammar?.[0] || 'Evaluated on grammatical accuracy and complex sentence structures.'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Pronunciation — {typeof feedback.pronunciationScore === 'number' ? feedback.pronunciationScore.toFixed(1) : 'Not Evaluated (No Audio)'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {feedback.criterionEvidence.pronunciation?.[0] || (feedback.pronunciationScore === null ? 'Pronunciation was not evaluated because acoustic audio was not provided.' : '')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Feedback Section (Matching Mockup Screen 4) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Observed Strengths
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {feedback.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Priority Areas / Weaknesses if present */}
          {feedback.weaknesses && feedback.weaknesses.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 space-y-2.5 text-xs">
              <div className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Priority Areas for Next Attempt:
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {feedback.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grammar Corrections if present */}
          {feedback.corrections.length > 0 && (
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 space-y-2.5 text-xs">
              <div className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px]">
                Targeted Corrections (From Your Speech):
              </div>
              {feedback.corrections.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    <span className="text-rose-600 dark:text-rose-400">&ldquo;{c.original}&rdquo;</span>
                    <span className="text-slate-400"> → </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">&ldquo;{c.correction}&rdquo;</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{c.explanation}</div>
                </div>
              ))}
            </div>
          )}

          {/* Band 8.5 Polished Version */}
          {feedback.betterPhrasing && (
            <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/60 rounded-2xl p-5 space-y-2">
              <div className="text-xs font-bold text-[#7C3AED] dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Band 8.5+ Model Phrasing:
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-serif italic leading-relaxed">
                &ldquo;{feedback.betterPhrasing}&rdquo;
              </p>
            </div>
          )}

          {/* Bottom Action Buttons: Next Question (Primary) & Retry This Question (Secondary) */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setCandidateTranscript('');
                  setRecordingSeconds(0);
                  setMicState('IDLE');
                  setErrorMessage(null);
                }}
                disabled={isLoadingNext}
                className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-300 dark:border-purple-700 text-[#7C3AED] dark:text-purple-300 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry This Question</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isLoadingNext}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isLoadingNext ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading next question...</span>
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setActiveDrill(null);
                  setCandidateTranscript('');
                  setSessionMemory(null);
                }}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer transition"
              >
                ← Return to Drill Selection
              </button>
            </div>
          </div>
        </div>

        <DisclaimerBanner />
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3: SPECIFIC DRILL CHALLENGE VIEW (e.g. 2-Min Fluency Challenge)
  // =========================================================================
  if (activeDrill) {
    const promptText = currentDrillData?.prompt || activeDrill.samplePrompt;
    const tipsList = currentDrillData?.targetCollocations || activeDrill.sampleTips;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-400">
        {/* Top Header: Back link to drill selection + Timer Pill on right */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveDrill(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{activeDrill.title} Challenge</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#7C3AED] dark:text-purple-300 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{activeDrill.timeSeconds}s</span>
          </div>
        </div>

        {/* Challenge Container (Matching Mockup Screen 3) */}
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          {/* Pill Badge & Headline */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 font-bold text-[11px] uppercase tracking-wider">
                {activeDrill.title}
              </span>
              {sessionMemory?.currentTopic && (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 font-bold text-[10px] uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                  Topic: {sessionMemory.currentTopic.replace(/_/g, ' ')} • Q{sessionMemory.topicQuestionCount}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeDrill.title === '2-Min Fluency'
                ? '2-Minute Fluency & Continuity Challenge'
                : `${activeDrill.title} Challenge`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {activeDrill.subtitle}
            </p>
          </div>

          {/* Your Speaking Prompt Box (Matching Mockup Screen 3: Gradient Purple Box) */}
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white rounded-2xl p-6 shadow-md space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Your Speaking Prompt
            </div>
            <p className="text-base sm:text-lg font-bold leading-relaxed text-white">
              {promptText}
            </p>
          </div>

          {/* Tips to include (Matching Mockup Screen 3) */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Tips to include
            </div>
            <div className="flex flex-wrap gap-2">
              {tipsList.map((tip, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300 font-medium text-xs"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>

          {/* Live Recording Area & Transcript */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <AudioVisualizer
              audioLevel={audioLevel}
              isActive={micState === 'RECORDING'}
              className="w-full max-w-xs"
            />

            {micState === 'RECORDING' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Recording: {recordingSeconds}s / {activeDrill.timeSeconds}s</span>
              </div>
            )}

            {candidateTranscript && (
              <div className="w-full p-4 rounded-2xl bg-purple-50/30 dark:bg-slate-950 border border-purple-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-center">
                &ldquo;{candidateTranscript}&rdquo;
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bottom Full-Width Gradient Button (Matching Mockup Screen 3) */}
            {micState !== 'RECORDING' ? (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={isEvaluating || isLoadingDrill}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
              >
                {isLoadingDrill ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing drill...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Speaking</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStopRecordingAndEvaluate()}
                className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Stop & Evaluate Response</span>
              </button>
            )}
          </div>
        </div>

        <DisclaimerBanner />
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: PRACTICE MODE SELECTION (Personalized IELTS Speaking Drills)
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-400">
      {/* Top Header: Back Link + Logo */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">SpeakBand</span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-md">
            IELTS
          </span>
        </Link>

        <Link
          href="/test"
          className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 hover:underline"
        >
          Full Exam Mode →
        </Link>
      </div>

      {/* Main Title & Subtitle (Matching Mockup Screen 2) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Personalized IELTS <br />
          Speaking Drills
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Targeted practice with instant AI coaching & Band 8.5+ model phrasings.
        </p>
      </div>

      {/* Distinction Banner: Practice Mode vs Full Test */}
      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-[#7C3AED] dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Practice Mode vs Full Test: </strong>
          Practice individual IELTS criteria with immediate feedback and retry anytime. To take a complete, timed 11–14 min simulation under official test rules, use{' '}
          <Link href="/test" className="text-[#7C3AED] dark:text-purple-400 font-bold hover:underline">
            Full Exam Mode
          </Link>
          .
        </div>
      </div>

      {/* 5 Drill Selection Cards in Vertical List (Matching Mockup Screen 2) */}
      <div className="space-y-3">
        {DRILL_CONFIGS.map((drill) => {
          const Icon = drill.icon;
          const isFluency = drill.type === 'fluency_challenge';

          return (
            <button
              key={drill.type}
              type="button"
              onClick={() => handleOpenDrill(drill)}
              className={`w-full p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 transition-all text-left cursor-pointer border ${
                isFluency
                  ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-purple-50/30 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isFluency
                      ? 'bg-[#7C3AED] text-white shadow-xs'
                      : 'bg-purple-50 dark:bg-purple-950/70 text-[#7C3AED] dark:text-purple-400 border border-purple-100 dark:border-purple-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {drill.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    {drill.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold hidden sm:inline">
                  {drill.timeSeconds}s
                </span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      <DisclaimerBanner />
    </div>
  );
}

function PracticeSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-52 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PracticeModePage() {
  return (
    <Suspense fallback={<PracticeSkeleton />}>
      <PracticeContent />
    </Suspense>
  );
}
