// SpeakBand — Circular Criteria Score Gauge (Matching QuizTube Design Mockup)

import React from 'react';

interface CircularScoreRingProps {
  label: string;
  score: number | null | undefined;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularScoreRing: React.FC<CircularScoreRingProps> = ({
  label,
  score,
  maxScore = 9,
  size = 72,
  strokeWidth = 5,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validScore = typeof score === 'number' && !isNaN(score) && score > 0 ? score : 0;
  const percentage = Math.min(Math.max(validScore / maxScore, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-purple-100 dark:text-purple-950/60"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Gradient Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#purplePinkGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="purplePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Centered Score */}
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
          {typeof score === 'number' && !isNaN(score) && score > 0 ? score.toFixed(1) : '—'}
        </div>
      </div>

      {/* Label */}
      <span className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-[80px] leading-tight">
        {label}
      </span>
    </div>
  );
};
