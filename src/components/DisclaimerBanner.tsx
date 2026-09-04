// SpeakBand — Official IELTS Disclaimer Banner (QuizTube Styled)

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-amber-50/60 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800/80 rounded-xl px-3 py-2 transition-colors">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong className="text-slate-800 dark:text-slate-200">AI ESTIMATED IELTS SPEAKING BAND:</strong> SpeakBand is an independent practice tool not affiliated with or endorsed by IELTS. Scores are AI estimates.
        </span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Official Disclaimer"
      className="w-full bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-200">
            Official IELTS Disclaimer:
          </span>{' '}
          SpeakBand is an independent IELTS Speaking practice and AI assessment tool. It is not affiliated with, endorsed by, or officially connected to the British Council, IDP: IELTS Australia, or Cambridge University Press & Assessment. Band scores provided are AI-generated estimates based on published IELTS Speaking assessment criteria and do not constitute an official IELTS result.
        </div>
      </div>
    </aside>
  );
};
