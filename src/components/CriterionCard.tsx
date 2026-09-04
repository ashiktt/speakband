// SpeakBand — IELTS Assessment Criterion Card (QuizTube Styled)

import React from 'react';
import { BandBadge } from './BandBadge';
import { CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';

interface CriterionCardProps {
  name: string;
  score: number | null | undefined;
  description: string;
  evidence: string[];
  audioNote?: string;
  isWeakest?: boolean;
  isStrongest?: boolean;
  onPracticeClick?: () => void;
}

export const CriterionCard: React.FC<CriterionCardProps> = ({
  name,
  score,
  description,
  evidence,
  audioNote,
  isWeakest = false,
  isStrongest = false,
  onPracticeClick,
}) => {
  return (
    <div
      className={`relative bg-white dark:bg-slate-900/90 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
        isWeakest
          ? 'border-amber-400 dark:border-amber-500/50 bg-gradient-to-b from-amber-50/40 dark:from-amber-950/10 to-white dark:to-slate-900/90'
          : isStrongest
          ? 'border-emerald-400 dark:border-emerald-500/50 bg-gradient-to-b from-emerald-50/40 dark:from-emerald-950/10 to-white dark:to-slate-900/90'
          : 'border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Top Status Pill */}
      {isWeakest && (
        <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-sm">
          Improvement Focus
        </span>
      )}
      {isStrongest && (
        <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
          Strongest Skill
        </span>
      )}

      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
          </div>
          <BandBadge score={score} size="md" />
        </div>

        {audioNote && (
          <div className="flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 rounded-lg px-2.5 py-1 mb-3 font-medium">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>{audioNote}</span>
          </div>
        )}

        {/* Evidence list */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Assessment Evidence:
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {evidence.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {onPracticeClick && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onPracticeClick}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 hover:text-purple-800 border border-slate-200 dark:border-slate-700 transition"
          >
            <span>Practice this skill</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
