// SpeakBand — IELTS Part 2 Authentic Cue Card (QuizTube Styled)

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Part2CueCard } from '@/types/ielts';

interface CueCardProps {
  cueCard: Part2CueCard;
  isPrepPhase?: boolean;
}

export const CueCard: React.FC<CueCardProps> = ({ cueCard, isPrepPhase = false }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900/95 border-2 border-purple-200 dark:border-purple-800/60 rounded-3xl p-6 sm:p-7 shadow-sm sm:shadow-md relative overflow-hidden transition-colors">
      {/* Top task card badge */}
      <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            IELTS Speaking Part 2 — Candidate Task Card
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          Topic: {cueCard.topic}
        </span>
      </div>

      {/* Main Cue Card Prompt */}
      <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide mb-4 font-serif leading-snug">
        {cueCard.cuePrompt}
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">
        You should say:
      </div>

      {/* Bullet points */}
      <ul className="space-y-2.5 my-3 pl-4 list-disc list-outside text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">
        {cueCard.bulletPoints.map((point, index) => (
          <li key={index} className="pl-1">
            {point}
          </li>
        ))}
      </ul>

      {isPrepPhase && (
        <div className="mt-5 pt-3.5 border-t border-purple-100 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-700 dark:text-purple-300 font-semibold">
          <span>You have 1 minute to think and prepare your speaking points.</span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Digital notes available below
          </span>
        </div>
      )}
    </div>
  );
};
