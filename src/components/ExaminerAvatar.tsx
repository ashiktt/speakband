// SpeakBand — Academic IELTS Examiner Presence Component (QuizTube Styled)

import React from 'react';
import { Volume2, VolumeX, ShieldCheck, UserCheck } from 'lucide-react';

interface ExaminerAvatarProps {
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  examinerText?: string;
}

export const ExaminerAvatar: React.FC<ExaminerAvatarProps> = ({
  isSpeaking,
  isMuted,
  onToggleMute,
  examinerText,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm sm:shadow-md relative overflow-hidden backdrop-blur-sm transition-colors">
      {/* Background glow when examiner speaks */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-pink-500/10 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                isSpeaking
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 shadow-md shadow-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <UserCheck className="w-6 h-6" />
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                SpeakBand Examiner
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" /> Official Protocol
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isSpeaking ? 'Examiner is asking question...' : 'Listening attentively to your response'}
            </p>
          </div>
        </div>

        {/* Audio Mute Toggle Button */}
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Examiner Voice' : 'Mute Examiner Voice'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        </button>
      </div>

      {/* Spoken text subtitle */}
      {examinerText && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
          &ldquo;{examinerText}&rdquo;
        </div>
      )}
    </div>
  );
};
