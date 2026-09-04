// SpeakBand — Official IELTS Speaking Scoring Engine

export interface BandCriteriaScores {
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
}

/**
 * Calculates the official IELTS overall band score from the 4 criteria
 * using official British Council / Cambridge IELTS rounding rules:
 * - Average of 4 criteria
 * - If decimal fraction is < 0.25, round down to previous whole band (e.g. 6.125 -> 6.0)
 * - If decimal fraction is >= 0.25 and < 0.75, round to the half band (e.g. 6.25 -> 6.5, 6.625 -> 6.5)
 * - If decimal fraction is >= 0.75, round up to the next whole band (e.g. 6.75 -> 7.0)
 */
export function calculateOverallBand(scores: BandCriteriaScores): number {
  const { fluency, lexical, grammar, pronunciation } = scores;
  const rawMean = (fluency + lexical + grammar + pronunciation) / 4;

  const whole = Math.floor(rawMean);
  const frac = Number((rawMean - whole).toFixed(4));

  if (frac < 0.25) {
    return whole;
  } else if (frac < 0.75) {
    return whole + 0.5;
  } else {
    return whole + 1.0;
  }
}

/**
 * Ensures any individual band score conforms to official 0-9 in 0.5 intervals
 */
export function normalizeBandScore(score: number): number {
  if (isNaN(score)) return 6.0;
  const clamped = Math.max(0, Math.min(9, score));
  return Math.round(clamped * 2) / 2;
}

export const IELTS_DISCLAIMER_SHORT = 'AI ESTIMATED IELTS SPEAKING BAND';

export const IELTS_DISCLAIMER_FULL =
  'SpeakBand is an independent IELTS Speaking practice and AI assessment tool. It is not affiliated with, endorsed by, or officially connected to IELTS. Band scores shown by SpeakBand are AI-generated estimates based on IELTS Speaking assessment criteria and are not official IELTS results.';

export const CRITERIA_DESCRIPTORS: Record<
  string,
  { name: string; description: string; bandSummaries: Record<number, string> }
> = {
  fluency_coherence: {
    name: 'Fluency & Coherence',
    description: 'Continuity of speech, speech rate, hesitation, repetition, idea sequencing, and use of connectives.',
    bandSummaries: {
      9: 'Speaks fluently with only rare repetition or self-correction; hesitation is content-related only. Fully coherent discourse.',
      8: 'Speaks fluently with only occasional repetition or self-correction. Develops topics coherently and appropriately.',
      7: 'Speaks at length without noticeable effort. May demonstrate language-related hesitation or repetition. Uses connective discourse markers.',
      6: 'Willing to speak at length, though may lose coherence at times due to repetition, self-correction or hesitation. Uses range of connectives.',
      5: 'Usually maintains flow of speech but uses repetition, self-correction and slow speech to keep going. Overuses certain connectives.',
    },
  },
  lexical_resource: {
    name: 'Lexical Resource',
    description: 'Vocabulary range, accuracy, collocations, idiomatic phrasing, and flexibility of expression.',
    bandSummaries: {
      9: 'Uses vocabulary with full flexibility and precise nuance in all topics. Natural, sophisticated colloquialisms.',
      8: 'Uses a wide vocabulary readily and flexibly. Skilfully uses less common and idiomatic vocabulary with few inaccuracies.',
      7: 'Uses vocabulary resource flexibly to discuss a variety of topics. Uses less common and idiomatic vocabulary with awareness of style.',
      6: 'Has a wide enough vocabulary to discuss topics at length and make meaning clear, despite occasional inappropriate choices.',
      5: 'Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility. Attempts paraphrase with mixed success.',
    },
  },
  grammatical_range_accuracy: {
    name: 'Grammatical Range & Accuracy',
    description: 'Sentence structures variety, subordinate clauses, tense accuracy, and systematic grammatical control.',
    bandSummaries: {
      9: 'Consistently produces accurate structures along with full range of natural complex forms.',
      8: 'Consistently produces a wide range of complex structures with majority of error-free sentences.',
      7: 'Produces a range of complex structures flexibly. Frequently produces error-free sentences, though persistent minor errors may occur.',
      6: 'Uses a mix of simple and complex structures, but with limited flexibility. Frequently produces errors with complex structures though meaning remains clear.',
      5: 'Produces basic sentence forms with reasonable accuracy. Uses a limited range of more complex structures, often containing errors.',
    },
  },
  pronunciation: {
    name: 'Pronunciation',
    description: 'Intelligibility, rhythm, sentence stress, word stress, chunking, and phonological clarity without native-accent bias.',
    bandSummaries: {
      9: 'Uses a full range of pronunciation features with precision and subtlety. Effortless to understand throughout.',
      8: 'Uses a wide range of pronunciation features. Can be sustained throughout with only minor lapses. Very easy to understand.',
      7: 'Shows all the positive features of Band 6 and some but not all features of Band 8. Generally easy to understand.',
      6: 'Uses a range of pronunciation features with mixed control. Shows some effective use of features, can generally be understood throughout.',
      5: 'Shows all the positive features of Band 4 and some but not all features of Band 6. Pronunciation may cause occasional strain for listener.',
    },
  },
};
