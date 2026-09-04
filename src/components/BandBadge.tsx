// SpeakBand — Band Score Badge Component (QuizTube Gradient Styled)

import React from 'react';

interface BandBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  label?: string;
  className?: string;
}

export const BandBadge: React.FC<BandBadgeProps> = ({
  score,
  size = 'md',
  label,
  className = '',
}) => {
  const getBandGradient = (band: number) => {
    if (band >= 8.0) return 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/25';
    if (band >= 7.0) return 'from-indigo-600 via-purple-600 to-pink-600 text-white shadow-indigo-500/25';
    if (band >= 6.0) return 'from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-purple-500/20';
    return 'from-amber-500 to-orange-600 text-white shadow-amber-500/20';
  };

  const formattedScore = Number(score).toFixed(1);

  if (size === 'hero') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br ${getBandGradient(
            score
          )} flex flex-col items-center justify-center shadow-xl border-2 border-white/20`}
        >
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono leading-none">
            {formattedScore}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest mt-1 text-white/90">
            Band Score
          </span>
        </div>
        {label && (
          <span className="mt-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-center">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${getBandGradient(
            score
          )} flex items-center justify-center font-mono font-bold text-xl sm:text-2xl shadow-md border border-white/10`}
        >
          {formattedScore}
        </div>
        {label && <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg font-mono font-bold text-xs bg-gradient-to-r ${getBandGradient(
          score
        )} ${className}`}
      >
        {formattedScore}
      </span>
    );
  }

  // Default 'md'
  return (
    <div
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-mono font-bold text-sm bg-gradient-to-br ${getBandGradient(
        score
      )} shadow-sm ${className}`}
    >
      {formattedScore}
    </div>
  );
};
