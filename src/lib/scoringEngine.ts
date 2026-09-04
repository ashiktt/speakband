// SpeakBand — Official IELTS Speaking Scoring & Evidence Validation Engine

import type {
  BandCriteriaScores,
  IeltsEvaluationResult,
  GrammarCorrection,
  PracticeFeedback,
  RecordedResponse,
} from '../types/ielts';

/**
 * Calculates the official IELTS overall band score from the 4 criteria
 * using official British Council / Cambridge IELTS rounding rules:
 * - Mean of the 4 criteria (Fluency, Lexical, Grammar, Pronunciation)
 * - If decimal fraction is < 0.25, round down to the whole band (e.g. 6.125 -> 6.0)
 * - If decimal fraction is >= 0.25 and < 0.75, round to the half band (e.g. 6.25 -> 6.5, 6.625 -> 6.5)
 * - If decimal fraction is >= 0.75, round up to next whole band (e.g. 6.75 -> 7.0)
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
  if (isNaN(score) || score === null || score === undefined) return 6.0;
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
      4: 'Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction.',
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
      4: 'Is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice.',
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
      4: 'Produces basic sentence forms and some correct simple sentences but subordinate clauses are rare; errors are frequent.',
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
      4: 'Uses a limited range of pronunciation features. Attempts at features are rarely sustained. Frequent mispronunciation.',
    },
  },
};

// =========================================================================
// DETERMINISTIC LINGUISTIC AUDIT & EVIDENCE EXTRACTION
// =========================================================================

export interface GrammarAudit {
  totalWords: number;
  totalSentences: number;
  errorCount: number;
  errorDensity: number; // errors per 100 words
  repeatedBasicErrors: boolean;
  complexStructureMarkersFound: number;
  maxAllowedGrammarBand: number;
  patternObservations: string[];
}

export interface LexicalAudit {
  totalTokens: number;
  uniqueTokenRatio: number; // Type-Token Ratio (TTR)
  elementaryRepetitionCount: number;
  overusedWords: string[];
  maxAllowedLexicalBand: number;
  observations: string[];
}

/**
 * Audits grammatical accuracy and structural range from transcripts and detected mistakes.
 * Enforces published IELTS descriptors:
 * - Band 7+ requires frequent error-free sentences AND a range of complex structures.
 * - Repeated basic errors (e.g. past tense failures, "we was", "he don't") restrict grammar to Band 5.0–5.5.
 * - A single isolated mistake in 20+ accurate sentences does NOT pull the candidate down to Band 5.
 */
export function auditGrammarQuality(
  transcripts: string[],
  mistakes: GrammarCorrection[] = []
): GrammarAudit {
  const combinedText = transcripts.join(' ');
  const words = combinedText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const totalWords = Math.max(1, words.length);

  // Approximate sentence count
  const sentences = combinedText.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const totalSentences = Math.max(1, sentences.length);

  // Scan for common systematic basic error patterns in spoken English
  const basicErrorPatterns = [
    /\b(I|he|she|we|they)\s+go\s+(there|to|last|yesterday)/i,
    /\b(we|they|you)\s+was\b/i,
    /\b(he|she|it)\s+don't\b/i,
    /\b(didn't|did not)\s+(went|saw|ate|had|came)\b/i,
    /\bhave\s+(went|saw|ate)\b/i,
    /\bgo\s+(restaurant|school|hospital|work|home)\b/i, // missing preposition/article
    /\b(yesterday|last\s+(year|month|week|summer|time))\s+I\s+(see|go|make|take|buy|eat|is)\b/i,
    /\bI\s+(see|go|make|take|buy|eat|is)\s+.*(yesterday|last\s+(year|month|week))\b/i,
    /\bmore\s+better\b/i,
    /\bno\s+have\b/i,
  ];

  let patternMatches = 0;
  const patternObservations: string[] = [];

  for (const pat of basicErrorPatterns) {
    if (pat.test(combinedText)) {
      patternMatches++;
    }
  }

  // Also check detected mistakes for basic tense / agreement tags
  const tenseOrAgreementErrors = mistakes.filter((m) => {
    const orig = m.original.toLowerCase();
    const exp = (m.explanation || '').toLowerCase();
    return (
      exp.includes('past tense') ||
      exp.includes('subject-verb') ||
      exp.includes('agreement') ||
      exp.includes('irregular verb') ||
      orig.includes('go ') ||
      orig.includes('was ') ||
      orig.includes('don\'t ')
    );
  });

  const hasRepeatedBasicErrors = patternMatches >= 2 || tenseOrAgreementErrors.length >= 2;

  // Scan for complex structure markers (subordination, conditionals, relatives, passives)
  const complexMarkers = [
    /\b(although|even though|whereas|while|despite|in spite of)\b/i,
    /\b(if|provided that|as long as|unless)\b/i,
    /\b(had I|were I to|would have|could have|should have)\b/i,
    /\b(which|who|whom|whose|where|that)\s+(is|are|was|were|has|have|can|could|would)\b/i,
    /\b(is considered|was developed|are required|have been observed|being)\b/i,
    /\b(not only\b.*\bbut also)\b/i,
    /\b(in order to|so as to|due to the fact that)\b/i,
  ];

  let complexStructureCount = 0;
  for (const marker of complexMarkers) {
    const matches = combinedText.match(new RegExp(marker, 'gi'));
    if (matches) {
      complexStructureCount += matches.length;
    }
  }

  const errorCount = Math.max(mistakes.length, patternMatches);
  const errorDensity = (errorCount / totalWords) * 100;

  // Determine evidence-based maximum allowable Grammar Band
  let maxAllowedGrammarBand = 9.0;

  if (totalWords >= 15) {
    if (hasRepeatedBasicErrors && errorDensity >= 4.0) {
      // Frequent basic errors in short responses (e.g. 2+ basic mistakes in 40 words)
      maxAllowedGrammarBand = 5.0;
      patternObservations.push('Persistent basic tense and agreement errors prevent Band 6+ control.');
    } else if (hasRepeatedBasicErrors || errorDensity >= 3.0) {
      // Multiple basic errors throughout the speech
      maxAllowedGrammarBand = 5.5;
      patternObservations.push('Repeated grammatical errors reduce overall control of sentence structures.');
    } else if (errorCount >= 3 && complexStructureCount === 0) {
      // Errors with simple structures and zero complex forms attempted
      maxAllowedGrammarBand = 5.5;
      patternObservations.push('Limited range of sentence forms with recurring inaccuracies.');
    } else if (errorCount >= 2 && complexStructureCount < 2) {
      // Mix of simple/complex with noticeable errors
      maxAllowedGrammarBand = 6.0;
      patternObservations.push('Noticeable inaccuracies in sentence formation; lacks flexible complex structures.');
    } else if (complexStructureCount === 0 && totalWords > 60) {
      // Error-free simple sentences only (lacks complex range for Band 7)
      maxAllowedGrammarBand = 6.5;
      patternObservations.push('Grammar is reasonably accurate but relies predominantly on simple structures.');
    } else if (errorCount === 1 && totalWords >= 60 && complexStructureCount >= 3) {
      // Single isolated slip in an otherwise extensive, complex answer (Rule 13)
      maxAllowedGrammarBand = 8.0;
      patternObservations.push('Isolated minor grammatical slip within an otherwise wide and accurate structural range.');
    }
  }

  return {
    totalWords,
    totalSentences,
    errorCount,
    errorDensity,
    repeatedBasicErrors: hasRepeatedBasicErrors,
    complexStructureMarkersFound: complexStructureCount,
    maxAllowedGrammarBand,
    patternObservations,
  };
}

/**
 * Audits vocabulary range, precision, and repetition.
 * Enforces IELTS descriptors:
 * - Avoids high scores for excessive repetition of elementary words ("good", "very good", "nice").
 * - Checks Type-Token Ratio (TTR).
 */
export function auditLexicalQuality(transcripts: string[]): LexicalAudit {
  const combinedText = transcripts.join(' ').toLowerCase();
  const tokens = combinedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const totalTokens = Math.max(1, tokens.length);
  const uniqueTokens = new Set(tokens);
  const uniqueTokenRatio = Number((uniqueTokens.size / totalTokens).toFixed(2));

  // Elementary adjective/filler repetition check
  const elementaryWords = ['good', 'nice', 'very', 'bad', 'happy', 'big', 'small', 'thing', 'things'];
  const wordCounts: Record<string, number> = {};

  for (const token of tokens) {
    if (elementaryWords.includes(token)) {
      wordCounts[token] = (wordCounts[token] || 0) + 1;
    }
  }

  let elementaryRepetitionCount = 0;
  const overusedWords: string[] = [];

  for (const [w, cnt] of Object.entries(wordCounts)) {
    if (cnt >= 3) {
      elementaryRepetitionCount += cnt;
      overusedWords.push(`${w} (${cnt}x)`);
    }
  }

  let maxAllowedLexicalBand = 9.0;
  const observations: string[] = [];

  if (totalTokens >= 20) {
    if (uniqueTokenRatio <= 0.35 || (overusedWords.length >= 2 && elementaryRepetitionCount >= 6)) {
      // Heavy repetition of basic vocabulary
      maxAllowedLexicalBand = 5.0;
      observations.push(`Heavy repetition of basic words: ${overusedWords.join(', ')}. Lacks vocabulary variety.`);
    } else if (uniqueTokenRatio <= 0.45 || overusedWords.length >= 1) {
      // Limited flexibility, some repetitive word choice
      maxAllowedLexicalBand = 5.5;
      observations.push(`Repeated elementary terms (${overusedWords.join(', ')}); vocabulary range is restricted.`);
    } else if (uniqueTokenRatio < 0.55 && totalTokens > 60) {
      // General vocabulary sufficient to discuss familiar topics, but lacks idiomatic/collocational range
      maxAllowedLexicalBand = 6.5;
      observations.push('Adequate vocabulary for the topic, but lacks less common collocations or stylistic precision.');
    }
  }

  return {
    totalTokens,
    uniqueTokenRatio,
    elementaryRepetitionCount,
    overusedWords,
    maxAllowedLexicalBand,
    observations,
  };
}

export interface FluencyAudit {
  wordsPerMinute: number;
  pauseOrHesitationMarkers: number;
  maxAllowedFluencyBand: number;
  observations: string[];
}

/**
 * Audits speech continuity, rate, and hesitation markers.
 * Enforces IELTS Fluency & Coherence descriptors:
 * - Normal speaking rate is ~110-150 words per minute.
 * - Heavy pausing, very slow speech (<75 wpm), or dense hesitation markers cap Fluency at Band 4.5-5.5.
 */
export function auditFluencyQuality(responses: RecordedResponse[]): FluencyAudit {
  let totalWords = 0;
  let totalDurationSeconds = 0;
  let hesitationCount = 0;

  for (const r of responses) {
    const text = r.candidateTranscript || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    totalDurationSeconds += r.durationSeconds || 0;

    // Detect hesitation markers (uh, um, er, ah, repeated ellipses, duplicate words)
    const hesitations = text.match(/\b(uh|um|er|ah|eh|mm)\b|\.{2,}|\b(\w+)\s+\2\b/gi);
    if (hesitations) {
      hesitationCount += hesitations.length;
    }
  }

  const durationMinutes = totalDurationSeconds > 0 ? totalDurationSeconds / 60 : 0;
  const wordsPerMinute = durationMinutes > 0.1 ? Math.round(totalWords / durationMinutes) : 120;

  let maxAllowedFluencyBand = 9.0;
  const observations: string[] = [];

  if (durationMinutes >= 0.25 || responses.length >= 2) {
    const hesitationDensity = (hesitationCount / Math.max(1, totalWords)) * 100;
    if (wordsPerMinute < 65 || hesitationDensity >= 10.0) {
      maxAllowedFluencyBand = 4.5;
      observations.push('Frequent noticeable pauses, slow speech rate, and hesitation significantly impair fluency.');
    } else if (wordsPerMinute < 85 || hesitationDensity >= 6.0) {
      maxAllowedFluencyBand = 5.5;
      observations.push('Speech flow is frequently slowed by pauses and language-related hesitation.');
    } else if (wordsPerMinute < 105) {
      maxAllowedFluencyBand = 6.5;
      observations.push('Maintains basic continuity though speech pace is somewhat deliberate with occasional pauses.');
    }
  }

  return {
    wordsPerMinute,
    pauseOrHesitationMarkers: hesitationCount,
    maxAllowedFluencyBand,
    observations,
  };
}

/**
 * Calculates evidence confidence based on word count, turns answered, and acoustic audio presence.
 * Returns a percentage 0 to 100.
 */
export function calculateEvaluationConfidence(
  responses: RecordedResponse[],
  totalDurationSeconds: number
): number {
  let score = 0.5;

  const totalWords = responses.reduce((acc, r) => {
    return acc + (r.candidateTranscript || '').trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  // Turn count contribution
  if (responses.length >= 8) score += 0.2;
  else if (responses.length >= 4) score += 0.1;
  else if (responses.length <= 2) score -= 0.15;

  // Word count contribution
  if (totalWords >= 250) score += 0.15;
  else if (totalWords >= 100) score += 0.05;
  else if (totalWords < 40) score -= 0.2;

  // Audio presence
  const hasAudio = responses.some((r) => r.audioBase64 && r.audioBase64.length > 500);
  if (hasAudio) score += 0.1;

  return Math.round(Math.max(0.2, Math.min(0.95, score)) * 100);
}

// =========================================================================
// EVALUATION RECONCILIATION & GUARDRAIL APPLICATION
// =========================================================================

/**
 * Reconciles and validates the raw evaluation result against deterministic linguistic evidence.
 * Ensures:
 * 1. Criterion scores do NOT exceed evidence-based caps.
 * 2. Overall band is calculated deterministically via official IELTS mean & rounding rules.
 * 3. Feedback comments and key weaknesses align with criterion scores.
 * 4. Positive encouragement NEVER overrides severe grammar or vocabulary deficiencies.
 */
export function reconcileEvaluationResult(
  rawResult: IeltsEvaluationResult,
  responses: RecordedResponse[]
): IeltsEvaluationResult {
  const transcripts = responses.map((r) => r.candidateTranscript || '');
  const grammarAudit = auditGrammarQuality(transcripts, rawResult.actualMistakes || []);
  const lexicalAudit = auditLexicalQuality(transcripts);
  const fluencyAudit = auditFluencyQuality(responses);
  const confidenceScore = calculateEvaluationConfidence(responses, rawResult.testDurationSeconds || 0);

  // Apply deterministic descriptor caps
  let grammarBand = normalizeBandScore(rawResult.grammarBand);
  if (grammarBand > grammarAudit.maxAllowedGrammarBand) {
    grammarBand = grammarAudit.maxAllowedGrammarBand;
  }

  let lexicalBand = normalizeBandScore(rawResult.lexicalBand);
  if (lexicalBand > lexicalAudit.maxAllowedLexicalBand) {
    lexicalBand = lexicalAudit.maxAllowedLexicalBand;
  }

  let fluencyBand = normalizeBandScore(rawResult.fluencyBand);
  if (fluencyBand > fluencyAudit.maxAllowedFluencyBand) {
    fluencyBand = fluencyAudit.maxAllowedFluencyBand;
  }

  const pronunciationBand = normalizeBandScore(rawResult.pronunciationBand);

  // Compute overall band deterministically via official IELTS rounding rules
  const overallBand = calculateOverallBand({
    fluency: fluencyBand,
    lexical: lexicalBand,
    grammar: grammarBand,
    pronunciation: pronunciationBand,
  });

  // Identify strongest & weakest criteria based on validated numbers
  const criteriaList = [
    { name: 'Fluency & Coherence', band: fluencyBand },
    { name: 'Lexical Resource', band: lexicalBand },
    { name: 'Grammatical Range & Accuracy', band: grammarBand },
    { name: 'Pronunciation', band: pronunciationBand },
  ];

  criteriaList.sort((a, b) => b.band - a.band);
  const strongestArea = `${criteriaList[0].name} (${criteriaList[0].band.toFixed(1)})`;
  const weakestArea = `${criteriaList[criteriaList.length - 1].name} (${criteriaList[criteriaList.length - 1].band.toFixed(1)})`;

  // Reconcile key problems & evidence
  const updatedProblems = [...(rawResult.keyProblems || [])];
  if (grammarAudit.patternObservations.length > 0) {
    for (const obs of grammarAudit.patternObservations) {
      if (!updatedProblems.some((p) => p.toLowerCase().includes(obs.toLowerCase().slice(0, 15)))) {
        updatedProblems.unshift(obs);
      }
    }
  }

  if (lexicalAudit.observations.length > 0) {
    for (const obs of lexicalAudit.observations) {
      if (!updatedProblems.some((p) => p.toLowerCase().includes(obs.toLowerCase().slice(0, 15)))) {
        updatedProblems.push(obs);
      }
    }
  }

  if (fluencyAudit.observations.length > 0) {
    for (const obs of fluencyAudit.observations) {
      if (!updatedProblems.some((p) => p.toLowerCase().includes(obs.toLowerCase().slice(0, 15)))) {
        updatedProblems.push(obs);
      }
    }
  }

  // Reconcile performance summary so positive language never contradicts low scores
  let performanceSummary = rawResult.performanceSummary || '';
  if (grammarBand <= 5.5 && (performanceSummary.includes('strong grammar') || performanceSummary.includes('excellent control') || performanceSummary.includes('Good use of grammar'))) {
    performanceSummary = `The candidate demonstrated communicative effort; however, recurring grammatical inaccuracies and tense inconsistency limit the grammatical performance to Band ${grammarBand.toFixed(1)}.`;
  } else if (overallBand <= 5.5 && performanceSummary.includes('excellent')) {
    performanceSummary = `The candidate demonstrated willingness to communicate, but frequent grammatical and lexical errors restrict the overall speaking performance to Band ${overallBand.toFixed(1)}.`;
  }

  return {
    ...rawResult,
    overallBand,
    fluencyBand,
    lexicalBand,
    grammarBand,
    pronunciationBand,
    strongestArea,
    weakestArea,
    performanceSummary,
    keyProblems: updatedProblems.slice(0, 4),
    confidenceScore,
  };
}

/**
 * Reconciles practice drill feedback with evidence-based scoring.
 * Prevents topic vocabulary or fluency drills from defaulting to Band 7.0 when broken English is spoken.
 */
export function reconcilePracticeFeedback(
  raw: Partial<PracticeFeedback>,
  candidateResponse: string,
  focusSkill: string = 'Lexical Resource'
): PracticeFeedback {
  const transcripts = [candidateResponse];
  const grammarAudit = auditGrammarQuality(transcripts, raw.corrections || []);
  const lexicalAudit = auditLexicalQuality(transcripts);

  // Compute baseline scores
  let grammarScore = normalizeBandScore(raw.grammarScore ?? (raw.fluencyScore || 6.5));
  let lexicalScore = normalizeBandScore(raw.lexicalScore ?? (raw.fluencyScore || 6.5));
  let fluencyScore = normalizeBandScore(raw.fluencyScore || 6.5);
  let pronunciationScore = normalizeBandScore(raw.pronunciationScore || 6.5);

  // Enforce grammar caps
  if (grammarScore > grammarAudit.maxAllowedGrammarBand) {
    grammarScore = grammarAudit.maxAllowedGrammarBand;
  }

  // Enforce lexical caps
  if (lexicalScore > lexicalAudit.maxAllowedLexicalBand) {
    lexicalScore = lexicalAudit.maxAllowedLexicalBand;
  }

  // If the candidate spoke fewer than 10 words, penalize accordingly
  const wordCount = candidateResponse.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) {
    fluencyScore = Math.min(fluencyScore, 5.0);
    lexicalScore = Math.min(lexicalScore, 5.0);
    grammarScore = Math.min(grammarScore, 5.0);
    pronunciationScore = Math.min(pronunciationScore, 5.5);
  }

  const practiceBandEstimate = calculateOverallBand({
    fluency: fluencyScore,
    lexical: lexicalScore,
    grammar: grammarScore,
    pronunciation: pronunciationScore,
  });

  // Reconcile strengths so positive praise never overrides poor scores
  const strengths = (raw.strengths || []).filter((s) => {
    const low = s.toLowerCase();
    if (grammarScore <= 5.5 && (low.includes('good grammar') || low.includes('accurate') || low.includes('excellent grammar'))) {
      return false;
    }
    if (lexicalScore <= 5.5 && (low.includes('rich vocabulary') || low.includes('advanced words'))) {
      return false;
    }
    return true;
  });

  if (strengths.length === 0) {
    strengths.push('Demonstrated willingness to produce spontaneous spoken English.');
  }

  const weaknesses = raw.weaknesses || [];
  if (grammarAudit.patternObservations.length > 0) {
    for (const obs of grammarAudit.patternObservations) {
      if (!weaknesses.includes(obs)) weaknesses.push(obs);
    }
  }

  // Construct evidence breakdown
  const criterionEvidence = {
    fluency: [
      wordCount >= 30
        ? 'Maintained continuous speech without long pauses.'
        : 'Response was brief; practice speaking at greater length.',
    ],
    lexical: [
      lexicalAudit.observations[0] ||
        (lexicalScore >= 7.0
          ? 'Used natural, topic-appropriate vocabulary.'
          : 'Vocabulary met basic requirements with room for more precise collocations.'),
    ],
    grammar: [
      grammarAudit.patternObservations[0] ||
        (grammarScore >= 7.0
          ? 'Demonstrated control of complex structures with few errors.'
          : 'Work on past tense consistency and subject-verb agreement.'),
    ],
    pronunciation: [
      pronunciationScore >= 7.0
        ? 'Clear and natural articulation throughout.'
        : 'Ensure clear word stress on key content words.',
    ],
  };

  return {
    practiceBandEstimate,
    fluencyScore,
    lexicalScore,
    grammarScore,
    pronunciationScore,
    strengths,
    weaknesses,
    corrections: raw.corrections || [],
    betterPhrasing: raw.betterPhrasing || 'In my experience, having a structured approach allows for meaningful progress.',
    coachingAdvice:
      grammarScore <= 5.5
        ? 'Focus especially on past simple tense and subject-verb agreement in your next attempt!'
        : raw.coachingAdvice || 'Good drill turn! Keep practicing to refine your fluency and sentence range.',
    criterionEvidence,
    confidence: wordCount > 40 ? 0.85 : 0.65,
  };
}
