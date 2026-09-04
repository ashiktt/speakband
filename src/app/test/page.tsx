// SpeakBand — The Official IELTS Speaking Examination Room (QuizTube Styled)

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  TestState,
  MicState,
  Part1Question,
  Part2CueCard,
  Part3Question,
  RecordedResponse,
} from '@/types/ielts';
import { ExaminationStateMachine, STATE_LABELS } from '@/lib/stateMachine';
import { getPart1Curriculum, getRandomCueCard } from '@/lib/questionBank';
import { createTimestampTimer, formatTime, TimerInstance } from '@/lib/timerEngine';
import { SpeechRecognitionManager } from '@/lib/speech/stt';
import { SpeechSynthesisManager } from '@/lib/speech/tts';
import { StorageService } from '@/lib/storage';
import { MicrophoneButton } from '@/components/MicrophoneButton';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { ExaminerAvatar } from '@/components/ExaminerAvatar';
import { CueCard } from '@/components/CueCard';
import { Scratchpad } from '@/components/Scratchpad';
import {
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Keyboard,
  Send,
  Play,
} from 'lucide-react';

export default function ExaminationRoom() {
  const router = useRouter();

  // Core examination state machine
  const [stateMachine, setStateMachine] = useState<ExaminationStateMachine | null>(null);
  const [testState, setTestState] = useState<TestState>('IDLE');

  // Question curriculum
  const [part1Questions, setPart1Questions] = useState<Part1Question[]>([]);
  const [currentPart1Index, setCurrentPart1Index] = useState<number>(0);
  const [activeCueCard, setActiveCueCard] = useState<Part2CueCard | null>(null);
  const [part3Questions, setPart3Questions] = useState<Part3Question[]>([]);
  const [currentPart3Index, setCurrentPart3Index] = useState<number>(0);

  // Active question & prompt
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [scratchpadNotes, setScratchpadNotes] = useState<string>('');

  // Voice & Audio state
  const [micState, setMicState] = useState<MicState>('IDLE');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [showTextFallback, setShowTextFallback] = useState<boolean>(false);

  // Timers
  const [prepSecondsRemaining, setPrepSecondsRemaining] = useState<number>(60);
  const [speakingSecondsRemaining, setSpeakingSecondsRemaining] = useState<number>(120);
  const [totalTestSeconds, setTotalTestSeconds] = useState<number>(0);

  // Evaluation state
  const [evalProgressStep, setEvalProgressStep] = useState<string>('Preparing responses...');

  // Hardware & service managers
  const sttRef = useRef<SpeechRecognitionManager | null>(null);
  const ttsRef = useRef<SpeechSynthesisManager | null>(null);
  const prepTimerRef = useRef<TimerInstance | null>(null);
  const speakingTimerRef = useRef<TimerInstance | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Synchronous response buffer
  const recordedResponsesRef = useRef<RecordedResponse[]>([]);

  // 1. Initialize Examination System
  useEffect(() => {
    const saved = ExaminationStateMachine.loadPersistedSession();
    let sm: ExaminationStateMachine;

    if (saved && !saved.isComplete && saved.state !== 'IDLE') {
      sm = new ExaminationStateMachine(saved);
      recordedResponsesRef.current = saved.responses || [];
      setScratchpadNotes(saved.scratchpadNotes || '');
    } else {
      sm = new ExaminationStateMachine();
    }

    setStateMachine(sm);
    setTestState(sm.getState());

    sttRef.current = new SpeechRecognitionManager();
    ttsRef.current = new SpeechSynthesisManager();

    const p1 = getPart1Curriculum('studies');
    setPart1Questions(p1.questions);

    const p2p3 = getRandomCueCard();
    setActiveCueCard(p2p3.cueCard);
    setPart3Questions(p2p3.part3Questions);
    sm.setCueCard(p2p3.cueCard);

    totalTimerRef.current = setInterval(() => {
      setTotalTestSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (prepTimerRef.current) prepTimerRef.current.destroy();
      if (speakingTimerRef.current) speakingTimerRef.current.destroy();
      if (ttsRef.current) ttsRef.current.stop();
    };
  }, []);

  // 2. Examiner Speech Helper
  const speakExaminer = (text: string, onDone?: () => void) => {
    setActivePrompt(text);
    setIsExaminerSpeaking(true);
    setMicState('EXAMINER_SPEAKING');

    if (ttsRef.current) {
      ttsRef.current.speak(text, {
        onStart: () => setIsExaminerSpeaking(true),
        onEnd: () => {
          setIsExaminerSpeaking(false);
          setMicState('LISTENING');
          if (onDone) onDone();
        },
        onError: () => {
          setIsExaminerSpeaking(false);
          setMicState('LISTENING');
          if (onDone) onDone();
        },
      });
    } else {
      setIsExaminerSpeaking(false);
      setMicState('LISTENING');
      if (onDone) onDone();
    }
  };

  // 3. START EXAMINATION TRIGGER
  const handleStartExam = () => {
    if (!stateMachine) return;
    setErrorMessage(null);

    stateMachine.transition('INTRODUCTION');
    setTestState('INTRODUCTION');

    const introText =
      'Good morning. My name is SpeakBand Examiner. Can you tell me your full name, please?';
    speakExaminer(introText);
  };

  // 4. RECORDING CONTROLS
  const startRecording = async () => {
    setErrorMessage(null);
    setCurrentTranscript('');
    setRecordingSeconds(0);

    if (sttRef.current) {
      const started = await sttRef.current.startRecording({
        onTranscript: (text) => setCurrentTranscript(text),
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

  const stopRecordingAndSubmit = async (overrideTranscript?: string) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setMicState('PROCESSING');

    let recordingResult = {
      transcript: currentTranscript,
      audioBase64: null as string | null,
      audioMimeType: 'audio/webm',
      durationSeconds: recordingSeconds,
    };

    if (sttRef.current && sttRef.current.isRecording()) {
      const res = await sttRef.current.stopRecording();
      recordingResult = {
        transcript: overrideTranscript || res.transcript || currentTranscript,
        audioBase64: res.audioBase64,
        audioMimeType: res.audioMimeType,
        durationSeconds: Math.max(recordingSeconds, res.durationSeconds),
      };
    } else if (overrideTranscript) {
      recordingResult.transcript = overrideTranscript;
    }

    const candidateAnswer = (recordingResult.transcript || manualText).trim();

    const newResponse: RecordedResponse = {
      id: `resp_${Date.now()}`,
      part: (stateMachine?.getSession().currentPart || 1) as 1 | 2 | 3,
      topic: getCurrentTopic(),
      question: activePrompt,
      candidateTranscript: candidateAnswer,
      audioBase64: recordingResult.audioBase64 || undefined,
      audioMimeType: recordingResult.audioMimeType,
      durationSeconds: recordingResult.durationSeconds || 15,
      timestamp: Date.now(),
    };

    recordedResponsesRef.current.push(newResponse);
    stateMachine?.addResponse(newResponse);
    setManualText('');
    setCurrentTranscript('');

    advanceExamination(candidateAnswer);
  };

  const getCurrentTopic = (): string => {
    if (testState === 'INTRODUCTION') return 'Identity Verification';
    if (testState === 'PART_1') return part1Questions[currentPart1Index]?.topic || 'Studies';
    if (testState.startsWith('PART_2')) return activeCueCard?.topic || 'Part 2 Cue Card';
    return part3Questions[currentPart3Index]?.subTopic || 'Analytical Discussion';
  };

  // 5. DETERMINISTIC EXAM FLOW CONTROLLER
  const advanceExamination = async (lastAnswer: string) => {
    if (!stateMachine) return;
    const currentState = stateMachine.getState();

    // INTRODUCTION
    if (currentState === 'INTRODUCTION') {
      if (!recordedResponsesRef.current.some((r) => r.question.includes('identification'))) {
        const idQuestion = 'Thank you. And can I see your identification?';
        speakExaminer(idQuestion);
        return;
      }

      stateMachine.transition('PART_1');
      setTestState('PART_1');

      const firstPart1 = part1Questions[0]?.question || 'What do you enjoy most about your studies?';
      const speech = `Thank you. Now, in this first part, I would like to ask you some questions about yourself. Let's talk about ${part1Questions[0]?.topic || 'studies'}. ${firstPart1}`;
      speakExaminer(speech);
      return;
    }

    // PART 1
    if (currentState === 'PART_1') {
      const nextIndex = currentPart1Index + 1;
      if (nextIndex >= 6 || nextIndex >= part1Questions.length) {
        stateMachine.transition('PART_2_INSTRUCTIONS');
        setTestState('PART_2_INSTRUCTIONS');

        const part2Intro =
          "Thank you. Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you are going to say. You can make some notes if you wish.";
        speakExaminer(part2Intro, () => {
          startPart2Preparation();
        });
        return;
      }

      setCurrentPart1Index(nextIndex);
      const nextQ = part1Questions[nextIndex];
      const prevTopic = part1Questions[currentPart1Index]?.topic;
      const topicTransition =
        nextQ.topic !== prevTopic ? `Thank you. Let's move on to discuss ${nextQ.topic}. ` : 'Thank you. ';

      speakExaminer(`${topicTransition}${nextQ.question}`);
      return;
    }

    // PART 2 LONG TURN
    if (currentState === 'PART_2_LONG_TURN') {
      if (speakingTimerRef.current) speakingTimerRef.current.destroy();

      stateMachine.transition('PART_2_CLOSING');
      setTestState('PART_2_CLOSING');

      const closingQ =
        activeCueCard?.closingQuestions[0] ||
        'Thank you. Do you think you will visit this place in the near future?';
      speakExaminer(`Thank you. ${closingQ}`);
      return;
    }

    // PART 2 CLOSING -> PART 3
    if (currentState === 'PART_2_CLOSING') {
      stateMachine.transition('PART_3');
      setTestState('PART_3');

      const firstPart3 =
        part3Questions[0]?.question || 'Why do you think people enjoy travelling to unfamiliar places?';
      const part3Intro = `Thank you. We've been talking about ${activeCueCard?.topic || 'this topic'}, and now I'd like to discuss with you one or two more general questions related to this. First of all, ${firstPart3}`;
      speakExaminer(part3Intro);
      return;
    }

    // PART 3 DISCUSSION
    if (currentState === 'PART_3') {
      const nextIndex = currentPart3Index + 1;
      if (nextIndex >= 4 || nextIndex >= part3Questions.length) {
        finishExamination();
        return;
      }

      setCurrentPart3Index(nextIndex);
      const nextP3 = part3Questions[nextIndex];
      speakExaminer(`Thank you. ${nextP3.question}`);
      return;
    }
  };

  // 6. PART 2 PREPARATION (60 SECONDS)
  const startPart2Preparation = () => {
    if (!stateMachine) return;
    stateMachine.transition('PART_2_PREPARATION');
    setTestState('PART_2_PREPARATION');
    setPrepSecondsRemaining(60);

    speakExaminer('Here is your topic. You have one minute to prepare.', () => {
      const prepTimer = createTimestampTimer({
        durationSeconds: 60,
        onTick: (remaining) => {
          setPrepSecondsRemaining(remaining);
        },
        onComplete: () => {
          startPart2LongTurn();
        },
      });

      prepTimerRef.current = prepTimer;
      prepTimer.start();
    });
  };

  // 7. PART 2 LONG TURN (UP TO 120 SECONDS)
  const startPart2LongTurn = () => {
    if (!stateMachine) return;
    if (prepTimerRef.current) prepTimerRef.current.destroy();

    stateMachine.transition('PART_2_LONG_TURN');
    setTestState('PART_2_LONG_TURN');
    setSpeakingSecondsRemaining(120);

    const startPrompt =
      "Alright. Remember you have one to two minutes for this, so don't worry if I stop you. You can start speaking now.";

    speakExaminer(startPrompt, () => {
      startRecording();

      const speakingTimer = createTimestampTimer({
        durationSeconds: 120,
        onTick: (remaining) => {
          setSpeakingSecondsRemaining(remaining);
        },
        onComplete: () => {
          stopRecordingAndSubmit();
        },
      });

      speakingTimerRef.current = speakingTimer;
      speakingTimer.start();
    });
  };

  // 8. TEST COMPLETION & EVALUATION
  const finishExamination = async () => {
    if (!stateMachine) return;
    stateMachine.transition('TEST_COMPLETE');
    setTestState('TEST_COMPLETE');

    const conclusion = 'Thank you very much. That is the end of the IELTS speaking test.';
    speakExaminer(conclusion, async () => {
      stateMachine.transition('EVALUATION');
      setTestState('EVALUATION');
      await triggerEvaluation();
    });
  };

  const triggerEvaluation = async () => {
    setEvalProgressStep('Compiling official IELTS candidate dossier...');
    const allResponses = recordedResponsesRef.current;

    try {
      setEvalProgressStep('Assessing Fluency & Coherence against IELTS Band Descriptors...');
      setTimeout(() => {
        setEvalProgressStep('Evaluating Lexical Resource range & collocations...');
      }, 3000);
      setTimeout(() => {
        setEvalProgressStep('Auditing Grammatical Range and structural accuracy...');
      }, 6000);
      setTimeout(() => {
        setEvalProgressStep('Acoustic Pronunciation Analysis on audio features...');
      }, 9000);

      const res = await fetch('/api/examiner/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: allResponses,
          testDurationSeconds: totalTestSeconds,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.evaluation) {
        throw new Error(data.error || 'Evaluation processing failed');
      }

      await StorageService.saveTestResult(data.evaluation);
      ExaminationStateMachine.clearPersistedSession();
      router.push(`/results/${data.evaluation.id}`);
    } catch (err: any) {
      console.error('[SpeakBand Examination] Evaluation error:', err);
      setErrorMessage(
        'Your test answers have been safely preserved. Evaluation can be retried without losing your spoken audio.'
      );
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (ttsRef.current) {
      ttsRef.current.setMuted(nextMuted);
    }
  };

  // RENDER: IDLE (QuizTube Styled Setup Card)
  if (testState === 'IDLE') {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm sm:shadow-md space-y-6 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                IELTS Speaking Examination
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Duration: 11–14 minutes • 3 Standard Official Parts
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Standard IELTS Examination Conditions
            </div>
            <p>
              • <strong>Part 1 (4–5 mins):</strong> Short questions on familiar everyday topics.
            </p>
            <p>
              • <strong>Part 2 (3–4 mins):</strong> Cue card with 1 minute to prepare and up to 2 minutes to speak.
            </p>
            <p>
              • <strong>Part 3 (4–5 mins):</strong> In-depth two-way analytical discussion linked to Part 2.
            </p>
            <p className="text-purple-700 dark:text-purple-400 text-xs pt-1 font-semibold">
              * The examiner operates strictly in official examination mode (no coaching or correction during the test).
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleStartExam}
              className="w-full sm:w-auto flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all"
            >
              Begin Examination Now
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto py-3.5 sm:py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: EVALUATION IN PROGRESS (QuizTube Styled)
  if (testState === 'EVALUATION') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center animate-in fade-in duration-500 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto shadow-md animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Evaluating IELTS Speaking Exam</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            AI assessment applying published IELTS Speaking Band Descriptors (0.0–9.0).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono text-purple-700 dark:text-purple-300 shadow-sm">
          {evalProgressStep}
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {errorMessage}
            <button
              type="button"
              onClick={triggerEvaluation}
              className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm"
            >
              Retry Evaluation
            </button>
          </div>
        )}
      </div>
    );
  }

  // RENDER: ACTIVE EXAMINATION ROOM (QuizTube Styled)
  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* State Progress Header (QuizTube Pill Style) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 sm:px-5 py-3 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {STATE_LABELS[testState] || testState}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            {formatTime(totalTestSeconds)}
          </span>

          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          </button>
        </div>
      </div>

      {/* Examiner Avatar & Spoken Prompt */}
      <ExaminerAvatar
        isSpeaking={isExaminerSpeaking}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        examinerText={activePrompt}
      />

      {/* PART 2 CUE CARD & PREPARATION PHASE */}
      {testState === 'PART_2_PREPARATION' && activeCueCard && (
        <div className="space-y-4">
          {/* 60-Second Preparation Countdown Banner */}
          <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 flex items-center justify-between text-purple-800 dark:text-purple-300 shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>PREPARATION TIME REMAINING:</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-300">
              00:{String(prepSecondsRemaining).padStart(2, '0')}
            </div>
          </div>

          <CueCard cueCard={activeCueCard} isPrepPhase={true} />
          <Scratchpad notes={scratchpadNotes} onChange={setScratchpadNotes} />

          <div className="text-right">
            <button
              type="button"
              onClick={startPart2LongTurn}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Skip remaining preparation time & speak now →
            </button>
          </div>
        </div>
      )}

      {/* PART 2 LONG TURN ACTIVE PHASE */}
      {testState === 'PART_2_LONG_TURN' && activeCueCard && (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex items-center justify-between text-indigo-800 dark:text-indigo-300 shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>LONG TURN (MAX 2 MINUTES):</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {formatTime(speakingSecondsRemaining)}
            </div>
          </div>

          <CueCard cueCard={activeCueCard} isPrepPhase={false} />
          {scratchpadNotes && (
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200">Your Notes: </span>
              {scratchpadNotes}
            </div>
          )}
        </div>
      )}

      {/* Live Audio Activity & Centerpiece Microphone */}
      {testState !== 'PART_2_PREPARATION' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm sm:shadow-md flex flex-col items-center justify-center gap-6 transition-colors">
          {/* Audio Waveform */}
          <AudioVisualizer
            audioLevel={audioLevel}
            isActive={micState === 'RECORDING'}
            className="w-full max-w-sm"
          />

          {/* Central Tactile Microphone */}
          <MicrophoneButton
            state={micState}
            audioLevel={audioLevel}
            durationSeconds={recordingSeconds}
            onStartRecording={startRecording}
            onStopRecording={() => stopRecordingAndSubmit()}
            disabled={isExaminerSpeaking}
          />

          {/* Live spoken transcript preview */}
          {currentTranscript && (
            <div className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans text-center leading-relaxed font-medium">
              &ldquo;{currentTranscript}&rdquo;
            </div>
          )}

          {/* Text Input Fallback Toggle (Accessibility / Silent Environments) */}
          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowTextFallback(!showTextFallback)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{showTextFallback ? 'Hide typed response mode' : 'Microphone issue? Type answer'}</span>
            </button>

            {showTextFallback && (
              <div className="w-full mt-3 space-y-2">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => stopRecordingAndSubmit(manualText)}
                  disabled={!manualText.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Typed Answer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
