// SpeakBand — Pre-Examination Microphone & System Readiness Verification

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ShieldCheck,
  Clock,
  Wifi,
  VolumeX,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface MicrophoneCheckProps {
  onVerified: () => void;
  onCancel?: () => void;
}

export const MicrophoneCheck: React.FC<MicrophoneCheckProps> = ({ onVerified, onCancel }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [maxDetectedLevel, setMaxDetectedLevel] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [testSpeechSample, setTestSpeechSample] = useState<string>('');

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsTesting(false);
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const handleStartTest = async () => {
    cleanupAudio();
    setPermissionError(null);
    setAudioLevel(0);
    setMaxDetectedLevel(0);
    setTestSpeechSample('');
    setIsTesting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let consecutiveHighSignals = 0;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedLevel = Math.min(100, Math.round((avg / 128) * 100));

        setAudioLevel(normalizedLevel);
        setMaxDetectedLevel((prev) => Math.max(prev, normalizedLevel));

        if (normalizedLevel > 18) {
          consecutiveHighSignals++;
          if (consecutiveHighSignals >= 10) {
            setIsVerified(true);
          }
        }

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();

      // Attempt WebSpeech for live transcript verification
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (evt: any) => {
            let transcript = '';
            for (let i = 0; i < evt.results.length; i++) {
              transcript += evt.results[i][0].transcript + ' ';
            }
            if (transcript.trim()) {
              setTestSpeechSample(transcript.trim());
              setIsVerified(true);
            }
          };
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          // Fallback on volume signal alone
        }
      }
    } catch (err: any) {
      console.error('[SpeakBand Mic Check] Access error:', err);
      setIsTesting(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setPermissionError(
          'Microphone permission was denied. Please click the lock or camera/mic icon in your browser address bar and select "Allow", then click "Try Again".'
        );
      } else {
        setPermissionError(
          'Could not detect an active microphone. Please make sure your headset or microphone is plugged in.'
        );
      }
    }
  };

  const handleStopAndConfirm = () => {
    cleanupAudio();
    onVerified();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Pre-Exam Readiness Check
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify your microphone and environment before commencing the official examination.
          </p>
        </div>
      </div>

      {/* 4 Checklist Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isVerified
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400'
            }`}
          >
            {isVerified ? <CheckCircle2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Working Microphone
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isVerified ? 'Audio verified & ready' : 'Test voice input below'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Quiet Environment
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Minimal echo and background talk
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              11–14 Minutes Free
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Uninterrupted 3-part test flow
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Reliable Internet
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              For live AI examiner responses
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Microphone Test Area */}
      <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-purple-300">
              Step 1: Test Your Voice
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Click the button and say: <em>&ldquo;Hello, I am ready for the test.&rdquo;</em>
            </p>
          </div>

          {!isTesting ? (
            <button
              type="button"
              onClick={handleStartTest}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
            >
              <Mic className="w-4 h-4" />
              <span>{isVerified ? 'Test Mic Again' : 'Test Microphone'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={cleanupAudio}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition shrink-0"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Stop Test</span>
            </button>
          )}
        </div>

        {/* Live Audio Visualizer & Level Bar */}
        {isTesting && (
          <div className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-800/40">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-[#7C3AED] dark:text-purple-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Listening for speech...
              </span>
              <span className="font-mono text-[11px]">Level: {audioLevel}%</span>
            </div>

            <AudioVisualizer
              audioLevel={audioLevel}
              isActive={isTesting}
              className="w-full max-w-sm mx-auto"
            />

            {testSpeechSample && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 text-xs text-slate-800 dark:text-slate-200 text-center font-medium">
                Detected: &ldquo;{testSpeechSample}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Verification Success Badge */}
        {isVerified && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Microphone is clear and working properly!</span>
              <span className="text-[11px] block text-emerald-700 dark:text-emerald-400">
                Audio level peak reached {maxDetectedLevel}%. You are ready for the test.
              </span>
            </div>
          </div>
        )}

        {/* Permission Error Message */}
        {permissionError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{permissionError}</span>
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 pl-6">
              Note: You can also use the typed input mode during the exam if your hardware does not support speech input.
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleStopAndConfirm}
          disabled={!isVerified && !permissionError}
          className={`w-full sm:flex-1 py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isVerified
              ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white hover:opacity-95 shadow-purple-500/25 active:scale-[0.98]'
              : permissionError
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
          }`}
        >
          <span>{isVerified ? 'Start Examination' : permissionError ? 'Continue Anyway (Typed Mode)' : 'Complete Mic Check to Start'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={() => {
              cleanupAudio();
              onCancel();
            }}
            className="w-full sm:w-auto py-3.5 sm:py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
