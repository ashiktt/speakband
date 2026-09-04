// SpeakBand — Personalized IELTS Coaching & Practice Mode (QuizTube Styled)

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Mic,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Clock,
  Loader2,
  Award,
  Layers,
  Flame,
} from 'lucide-react';
import { PracticeDrill, PracticeFeedback, MicState, DrillType } from '@/types/ielts';
import { StorageService } from '@/lib/storage';
import { SpeechRecognitionManager } from '@/lib/speech/stt';
import { MicrophoneButton } from '@/components/MicrophoneButton';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

function PracticeContent() {
  const searchParams = useSearchParams();
  const requestedSkill = searchParams.get('skill');
  const requestedPart = searchParams.get('part');

  const [activeSkill, setActiveSkill] = useState<string>('Lexical Resource');
  const [currentDrill, setCurrentDrill] = useState<PracticeDrill | null>(null);
  const [isLoadingDrill, setIsLoadingDrill] = useState(false);

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

  const DRILL_OPTIONS: { type: DrillType; label: string; skill: string }[] = [
    { type: 'vocabulary_challenge', label: 'Topic Vocabulary', skill: 'Lexical Resource' },
    { type: 'fluency_challenge', label: '2-Min Fluency', skill: 'Fluency & Coherence' },
    { type: 'grammar_challenge', label: 'Complex Sentences', skill: 'Grammatical Range & Accuracy' },
    { type: 'pronunciation_challenge', label: 'Pronunciation & Stress', skill: 'Pronunciation' },
    { type: 'cue_card_challenge', label: 'Part 2 Cue Card', skill: 'Part 2 Long Turn' },
  ];

  useEffect(() => {
    sttRef.current = new SpeechRecognitionManager();

    const initialSkill =
      requestedSkill ||
      (requestedPart === '2' ? 'Part 2 Long Turn' : StorageService.getWeakestSkill());
    setActiveSkill(initialSkill);
    loadDrillForSkill(initialSkill);

    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [requestedSkill, requestedPart]);

  const loadDrillForSkill = async (skill: string) => {
    setIsLoadingDrill(true);
    setFeedback(null);
    setCandidateTranscript('');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/coaching/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_drill', weakestSkill: skill }),
      });
      const data = await res.json();
      if (data.success && data.drill) {
        setCurrentDrill(data.drill);
      }
    } catch (e) {
      console.error('[SpeakBand Practice] Load drill error:', e);
      setErrorMessage('Could not load exercise. Please retry.');
    } finally {
      setIsLoadingDrill(false);
    }
  };

  const handleSelectSkill = (skill: string) => {
    setActiveSkill(skill);
    loadDrillForSkill(skill);
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
          setRecordingSeconds((prev) => prev + 1);
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
    if (sttRef.current && sttRef.current.isRecording()) {
      const res = await sttRef.current.stopRecording();
      finalTranscript = textOverride || res.transcript || candidateTranscript;
    } else if (textOverride) {
      finalTranscript = textOverride;
    }

    if (!finalTranscript.trim()) {
      setErrorMessage('Please speak or type a response before requesting evaluation.');
      setMicState('IDLE');
      setIsEvaluating(false);
      return;
    }

    try {
      const res = await fetch('/api/coaching/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_drill',
          drill: currentDrill,
          candidateResponse: finalTranscript,
        }),
      });

      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedback(data.feedback);
      } else {
        throw new Error(data.error || 'Evaluation failed');
      }
    } catch (err: any) {
      console.error('[SpeakBand Practice] Evaluation error:', err);
      setErrorMessage('Could not evaluate your practice response. Please try again.');
    } finally {
      setIsEvaluating(false);
      setMicState('IDLE');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Coaching Header (QuizTube Style) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm sm:shadow-md relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Personalized IELTS Speaking Drills
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Targeted Speaking Practice
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Unlike the official examination room, your AI coach provides instant pedagogical feedback, grammar corrections, model Band 8.5+ phrasing, and collocation tips.
            </p>
          </div>

          <Link
            href="/test"
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Switch to Test Mode</span>
          </Link>
        </div>

        {/* Skill Selector Tabs (QuizTube Pill Container Style) */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Target Skill:
          </span>
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {DRILL_OPTIONS.map((opt) => {
              const isSelected = activeSkill.toLowerCase().includes(opt.skill.toLowerCase().split(' ')[0]);

              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelectSkill(opt.skill)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Drill Card */}
      {isLoadingDrill ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-medium">Generating customized coaching drill with Gemini...</p>
        </div>
      ) : currentDrill ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm sm:shadow-md space-y-6 transition-colors">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
                {currentDrill.focusSkill} Focus
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{currentDrill.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentDrill.description}</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 shrink-0">
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Target: {currentDrill.timeLimitSeconds}s</span>
            </div>
          </div>

          {/* Drill Prompt */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Speaking Prompt:
            </div>
            <div className="text-base sm:text-lg font-serif font-medium text-slate-900 dark:text-slate-100 italic leading-relaxed">
              &ldquo;{currentDrill.prompt}&rdquo;
            </div>
          </div>

          {/* High-Band Target Collocations */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Try to incorporate these high-scoring collocations:
            </div>
            <div className="flex flex-wrap gap-2">
              {currentDrill.targetCollocations.map((col, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-mono text-xs font-semibold"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Audio Recording & Visualizer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <AudioVisualizer
              audioLevel={audioLevel}
              isActive={micState === 'RECORDING'}
              className="w-full max-w-xs"
            />

            <MicrophoneButton
              state={micState}
              audioLevel={audioLevel}
              durationSeconds={recordingSeconds}
              onStartRecording={handleStartRecording}
              onStopRecording={() => handleStopRecordingAndEvaluate()}
              disabled={isEvaluating}
            />

            {candidateTranscript && (
              <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed text-center font-medium">
                &ldquo;{candidateTranscript}&rdquo;
              </div>
            )}
          </div>

          {/* AI Pedagogical Feedback Section */}
          {feedback && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Coach Assessment & Feedback</span>
                </div>
                <div className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-xl">
                  Fluency Level: Band {feedback.fluencyScore.toFixed(1)}
                </div>
              </div>

              {/* Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-xs space-y-1.5">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                  Strengths Demonstrated:
                </div>
                <ul className="list-disc pl-5 text-emerald-900 dark:text-emerald-200 space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Corrections */}
              {feedback.corrections.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-xs space-y-2">
                  <div className="font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider text-[11px]">
                    Constructive Corrections:
                  </div>
                  {feedback.corrections.map((c, i) => (
                    <div key={i} className="text-slate-800 dark:text-slate-200 space-y-0.5">
                      <div className="font-mono">
                        <span className="text-rose-600 dark:text-rose-400">&ldquo;{c.original}&rdquo;</span>
                        <span className="text-slate-400"> → </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">&ldquo;{c.correction}&rdquo;</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Band 8.5 Polished Model Version */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Band 8.5+ Polished Model Answer:
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
                  &ldquo;{feedback.betterPhrasing}&rdquo;
                </p>
              </div>

              {/* Next Steps */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">{feedback.coachingAdvice}</p>
                <button
                  type="button"
                  onClick={() => loadDrillForSkill(activeSkill)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Generate Next Drill</span>
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </section>
      ) : null}

      <DisclaimerBanner />
    </div>
  );
}

export default function PracticeModePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading coaching mode...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
