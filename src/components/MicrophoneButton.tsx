// SpeakBand — Central Tactile Microphone Component (QuizTube Gradient Styled)

import React from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { MicState } from '@/types/ielts';

interface MicrophoneButtonProps {
  state: MicState;
  audioLevel: number;
  durationSeconds: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  state,
  audioLevel,
  durationSeconds,
  onStartRecording,
  onStopRecording,
  disabled = false,
}) => {
  const isRecording = state === 'RECORDING';
  const isProcessing = state === 'PROCESSING';
  const isExaminerSpeaking = state === 'EXAMINER_SPEAKING';

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusLabel = () => {
    switch (state) {
      case 'RECORDING':
        return 'RECORDING — CLICK WHEN FINISHED';
      case 'PROCESSING':
        return 'PROCESSING SPEECH...';
      case 'EXAMINER_SPEAKING':
        return 'EXAMINER IS ASKING QUESTION';
      case 'LISTENING':
        return 'READY — CLICK MICROPHONE TO ANSWER';
      case 'ERROR':
        return 'MICROPHONE PERMISSION REQUIRED';
      default:
        return 'CLICK MICROPHONE TO ANSWER';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Visual pulse glow on recording */}
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <div
            className="absolute rounded-full bg-rose-500/20 animate-ping"
            style={{
              width: `${100 + audioLevel * 0.6}px`,
              height: `${100 + audioLevel * 0.6}px`,
              transition: 'all 100ms ease-out',
            }}
          />
        )}

        <button
          type="button"
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={disabled || isProcessing || isExaminerSpeaking}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl focus:outline-none focus:ring-4 ${
            isRecording
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-600/40 focus:ring-rose-400 scale-105 animate-pulse'
              : isExaminerSpeaking
              ? 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-800 cursor-not-allowed'
              : isProcessing
              ? 'bg-slate-100 dark:bg-slate-800 text-amber-500 border border-amber-300 dark:border-amber-800 cursor-wait'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 focus:ring-purple-400 hover:scale-105 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isExaminerSpeaking ? (
            <Volume2 className="w-8 h-8 animate-bounce" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Timer display during recording */}
      {isRecording && (
        <div className="font-mono text-xl font-bold text-rose-500 dark:text-rose-400 tracking-wider">
          {formatTimer(durationSeconds)}
        </div>
      )}

      {/* State badge */}
      <div
        className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
          isRecording
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            : isExaminerSpeaking
            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            : isProcessing
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
        }`}
      >
        {isRecording && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
        {isExaminerSpeaking && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
        {getStatusLabel()}
      </div>
    </div>
  );
};
