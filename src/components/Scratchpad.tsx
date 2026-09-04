// SpeakBand — Part 2 Preparation Note-Taking Scratchpad (QuizTube Styled)

import React from 'react';
import { Edit3 } from 'lucide-react';

interface ScratchpadProps {
  notes: string;
  onChange: (notes: string) => void;
  disabled?: boolean;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ notes, onChange, disabled = false }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Preparation Scratchpad (Optional Notes)</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Visible only to you
        </span>
      </div>

      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Jot down keywords, timeline, or key vocabulary for each bullet (e.g. 1. Kyoto, Japan | 2. Travel documentary | 3. Historic temples, matcha | 4. Spiritual serenity)..."
        rows={3}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono resize-none transition"
      />
    </div>
  );
};
