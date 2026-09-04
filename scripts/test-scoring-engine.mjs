// SpeakBand — Automated IELTS Scoring Engine Verification Suite
// Tests all 7 non-negotiable scoring cases required by the specification.

import {
  calculateOverallBand,
  auditGrammarQuality,
  auditLexicalQuality,
  auditFluencyQuality,
  reconcileEvaluationResult,
  reconcilePracticeFeedback,
  normalizeBandScore,
} from '../src/lib/scoringEngine.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('SPEAKBAND IELTS SCORING ENGINE — VERIFICATION SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST 1 — Strong speaker: Advanced vocabulary & complex structures
// ----------------------------------------------------
console.log('--- TEST 1: Strong Speaker (Band 7.5–8.5) ---');
{
  const strongTranscripts = [
    'Although urban density presents noticeable infrastructural challenges, modern metropolises can thrive if local authorities invest sustainably in renewable transport systems.',
    'Had municipal planners foreseen the exponential population influx, they might have instituted more stringent zoning regulations that are now desperately needed.',
    'It is widely acknowledged that cultural institutions play a pivotal role in fostering social cohesion, which in turn enhances overall civic well-being.',
  ];

  const grammarAudit = auditGrammarQuality(strongTranscripts, []);
  assert(
    grammarAudit.maxAllowedGrammarBand >= 8.0,
    `Strong speaker grammar cap is ${grammarAudit.maxAllowedGrammarBand} (expected >= 8.0)`
  );
  assert(
    grammarAudit.complexStructureMarkersFound >= 4,
    `Found ${grammarAudit.complexStructureMarkersFound} complex markers (expected >= 4)`
  );

  const lexicalAudit = auditLexicalQuality(strongTranscripts);
  assert(
    lexicalAudit.maxAllowedLexicalBand >= 8.0,
    `Strong speaker lexical cap is ${lexicalAudit.maxAllowedLexicalBand} (expected >= 8.0)`
  );

  const reconciled = reconcileEvaluationResult(
    {
      overallBand: 8.0,
      fluencyBand: 8.0,
      lexicalBand: 8.0,
      grammarBand: 8.0,
      pronunciationBand: 8.0,
      strongestArea: '',
      weakestArea: '',
      performanceSummary: 'Strong articulate performance throughout.',
      keyProblems: [],
      recommendedActions: [],
      actualMistakes: [],
      answerReviews: [],
      evidence: { fluency: [], lexical: [], grammar: [], pronunciation: [] },
      testDurationSeconds: 420,
    },
    strongTranscripts.map((t, idx) => ({
      id: `r-${idx}`,
      part: 3,
      topic: 'Urban Planning',
      question: 'Q',
      candidateTranscript: t,
      durationSeconds: 9,
      timestamp: Date.now(),
    }))
  );

  assert(
    reconciled.overallBand >= 7.5 && reconciled.overallBand <= 8.5,
    `Reconciled overall band is ${reconciled.overallBand} (expected 7.5–8.5)`
  );
}

// ----------------------------------------------------
// TEST 2 — Grammatically weak speaker (e.g. "I go there last year...")
// ----------------------------------------------------
console.log('\n--- TEST 2: Grammatically Weak Speaker (Capped at 5.0–5.5) ---');
{
  const weakTranscripts = [
    'I go there last year with my family. We was very happy and then we go restaurant. He don\'t like food but he eat anyway because he hungry.',
    'Yesterday I see my teacher and she tell me about exam. I no have time to study so I was very nervous.',
  ];

  const grammarAudit = auditGrammarQuality(weakTranscripts, [
    { original: 'I go there last year', correction: 'I went there last year', explanation: 'Past tense required' },
    { original: 'we was very happy', correction: 'we were very happy', explanation: 'Subject-verb agreement error' },
    { original: 'he don\'t like', correction: 'he doesn\'t like', explanation: 'Subject-verb agreement error' },
  ]);

  assert(
    grammarAudit.repeatedBasicErrors === true,
    'Repeated basic errors correctly flagged as true'
  );
  assert(
    grammarAudit.maxAllowedGrammarBand <= 5.5,
    `Grammar band capped at ${grammarAudit.maxAllowedGrammarBand} (expected <= 5.5)`
  );

  // Even if raw AI generously returned 7.0, reconciliation must clamp it to <= 5.5
  const reconciled = reconcileEvaluationResult(
    {
      overallBand: 7.0, // Inflated raw AI score
      fluencyBand: 6.5,
      lexicalBand: 6.0,
      grammarBand: 7.0, // Inflated raw grammar
      pronunciationBand: 6.0,
      strongestArea: 'Grammar',
      weakestArea: 'Lexical',
      performanceSummary: 'Strong grammar and good use of sentences.',
      keyProblems: [],
      recommendedActions: [],
      actualMistakes: [
        { original: 'I go there last year', correction: 'I went there last year', explanation: 'Past tense error' },
      ],
      answerReviews: [],
      evidence: { fluency: [], lexical: [], grammar: [], pronunciation: [] },
      testDurationSeconds: 120,
    },
    weakTranscripts.map((t, idx) => ({
      id: `r-${idx}`,
      part: 1,
      topic: 'Holidays',
      question: 'Tell me about a trip',
      candidateTranscript: t,
      durationSeconds: 30,
      timestamp: Date.now(),
    }))
  );

  assert(
    reconciled.grammarBand <= 5.5,
    `Reconciled grammar band is ${reconciled.grammarBand} (expected <= 5.5, NOT 7.0)`
  );
  assert(
    !reconciled.performanceSummary.includes('strong grammar'),
    'Praise contradictory to weak grammar was removed from performance summary'
  );
}

// ----------------------------------------------------
// TEST 3 — Basic repetitive vocabulary ("good, nice, very good...")
// ----------------------------------------------------
console.log('\n--- TEST 3: Repetitive Basic Vocabulary (Capped at 5.0–5.5) ---');
{
  const repetitiveTranscripts = [
    'It was a good day and the weather was good. The food was good and very good. The place was nice and my friends are good people. We had a good time in that nice restaurant.',
  ];

  const lexicalAudit = auditLexicalQuality(repetitiveTranscripts);
  assert(
    lexicalAudit.maxAllowedLexicalBand <= 5.5,
    `Repetitive lexical band capped at ${lexicalAudit.maxAllowedLexicalBand} (expected <= 5.5)`
  );
  assert(
    lexicalAudit.overusedWords.length >= 1,
    `Identified overused words: ${lexicalAudit.overusedWords.join(', ')}`
  );
}

// ----------------------------------------------------
// TEST 4 — Weak fluency: Heavy pausing and slow speech
// ----------------------------------------------------
console.log('\n--- TEST 4: Weak Fluency / Heavy Hesitation ---');
{
  const hesitantResponses = [
    {
      id: 'h-1',
      part: 1,
      topic: 'Work',
      question: 'What do you do?',
      candidateTranscript: 'I ... uh ... work ... in ... um ... office ... and ... uh ... do computer things ... er ... yes.',
      durationSeconds: 45, // 45 seconds for only 15 words = 20 WPM
      timestamp: Date.now(),
    },
    {
      id: 'h-2',
      part: 1,
      topic: 'Work',
      question: 'Do you enjoy it?',
      candidateTranscript: 'Um ... sometimes ... uh ... it is ... er ... okay ... but ... um ... tired.',
      durationSeconds: 35,
      timestamp: Date.now(),
    },
  ];

  const fluencyAudit = auditFluencyQuality(hesitantResponses);
  assert(
    fluencyAudit.wordsPerMinute < 65,
    `Speech rate measured as ${fluencyAudit.wordsPerMinute} WPM (expected < 65 WPM)`
  );
  assert(
    fluencyAudit.maxAllowedFluencyBand <= 5.0,
    `Fluency band capped at ${fluencyAudit.maxAllowedFluencyBand} (expected <= 5.0)`
  );
}

// ----------------------------------------------------
// TEST 5 — Mixed performance: Rich vocabulary + poor grammar
// ----------------------------------------------------
console.log('\n--- TEST 5: Mixed Performance (Rich Lexical + Poor Grammar) ---');
{
  const mixedTranscripts = [
    'Yesterday I go to the exhibition and we was experiencing an extraordinary culinary delight. However, my colleague don\'t appreciate the sophisticated ambiance or quintessential delicacies.',
  ];

  const grammarAudit = auditGrammarQuality(mixedTranscripts, [
    { original: 'yesterday I go', correction: 'yesterday I went', explanation: 'Past tense error' },
    { original: 'we was', correction: 'we were', explanation: 'Subject-verb agreement error' },
  ]);

  const lexicalAudit = auditLexicalQuality(mixedTranscripts);

  assert(
    grammarAudit.maxAllowedGrammarBand <= 5.5,
    `Mixed speaker grammar capped at ${grammarAudit.maxAllowedGrammarBand} (expected <= 5.5)`
  );
  assert(
    lexicalAudit.maxAllowedLexicalBand >= 7.5,
    `Mixed speaker lexical allowed ${lexicalAudit.maxAllowedLexicalBand} (expected >= 7.5)`
  );

  const rawMixed = {
    overallBand: 7.0,
    fluencyBand: 7.0,
    lexicalBand: 7.5,
    grammarBand: 7.0, // Inflated AI grammar
    pronunciationBand: 7.0,
    strongestArea: 'Lexical Resource',
    weakestArea: 'Grammar',
    performanceSummary: 'Mixed ability candidate.',
    keyProblems: [],
    recommendedActions: [],
    actualMistakes: [],
    answerReviews: [],
    evidence: { fluency: [], lexical: [], grammar: [], pronunciation: [] },
    testDurationSeconds: 180,
  };

  const reconciled = reconcileEvaluationResult(
    rawMixed,
    mixedTranscripts.map((t, idx) => ({
      id: `m-${idx}`,
      part: 2,
      topic: 'Events',
      question: 'Describe an event',
      candidateTranscript: t,
      durationSeconds: 40,
      timestamp: Date.now(),
    }))
  );

  assert(
    reconciled.grammarBand <= 5.5,
    `Reconciled grammar is ${reconciled.grammarBand} (expected <= 5.5)`
  );
  assert(
    reconciled.lexicalBand === 7.5,
    `Reconciled lexical is preserved at ${reconciled.lexicalBand} (expected 7.5)`
  );
  assert(
    reconciled.grammarBand !== reconciled.lexicalBand,
    `Criteria scores reflect genuine asymmetry (Grammar: ${reconciled.grammarBand}, Lexical: ${reconciled.lexicalBand})`
  );
}

// ----------------------------------------------------
// TEST 6 — Single isolated grammar mistake in 20+ sentences (Rule 13)
// ----------------------------------------------------
console.log('\n--- TEST 6: Single Isolated Slip in 20+ Accurate Sentences ---');
{
  const extensiveAccurateText = [
    'Although technological advancements have revolutionized contemporary communication, interpersonal connections continue to face substantial friction.',
    'If governments prioritize educational reforms, future generations will inevitably adapt more seamlessly to automation.',
    'In order to address demographic shifts, municipalities are developing innovative community engagement frameworks.',
    'Due to the fact that urban areas generate the vast majority of economic output, rural districts frequently experience systemic underfunding.',
    'I remember I go there last summer during a conference, which was an enlightening experience.', // 1 isolated slip
    'Public transport networks should be upgraded so as to mitigate greenhouse gas emissions.',
    'Whereas previous models relied primarily on fossil fuels, modern alternatives emphasize wind and solar reliability.',
    'Not only do green spaces enhance psychological well-being, but they also foster biodiversity within metropolitan centers.',
  ];

  const grammarAudit = auditGrammarQuality(extensiveAccurateText, [
    { original: 'I go there last summer', correction: 'I went there last summer', explanation: 'Minor slip' },
  ]);

  assert(
    grammarAudit.maxAllowedGrammarBand >= 7.5,
    `Single slip in complex speech allowed ${grammarAudit.maxAllowedGrammarBand} (expected >= 7.5, not dropped to Band 5)`
  );
}

// ----------------------------------------------------
// TEST 7 — Official IELTS Rounding Rules
// ----------------------------------------------------
console.log('\n--- TEST 7: Official IELTS Band Rounding Rules ---');
{
  const roundingCases = [
    { scores: { fluency: 6.5, lexical: 6.5, grammar: 6.0, pronunciation: 6.0 }, expected: 6.5, mean: 6.25 },
    { scores: { fluency: 7.0, lexical: 6.5, grammar: 6.5, pronunciation: 7.0 }, expected: 7.0, mean: 6.75 },
    { scores: { fluency: 6.0, lexical: 6.5, grammar: 6.0, pronunciation: 6.0 }, expected: 6.0, mean: 6.125 },
    { scores: { fluency: 6.0, lexical: 6.0, grammar: 6.0, pronunciation: 6.5 }, expected: 6.0, mean: 6.125 },
    { scores: { fluency: 6.5, lexical: 7.0, grammar: 6.5, pronunciation: 6.5 }, expected: 6.5, mean: 6.625 },
    { scores: { fluency: 7.0, lexical: 7.5, grammar: 7.5, pronunciation: 7.5 }, expected: 7.5, mean: 7.375 },
    { scores: { fluency: 7.5, lexical: 8.0, grammar: 7.5, pronunciation: 8.0 }, expected: 8.0, mean: 7.75 },
  ];

  for (const rc of roundingCases) {
    const calculated = calculateOverallBand(rc.scores);
    assert(
      calculated === rc.expected,
      `Scores [${Object.values(rc.scores).join(', ')}] mean=${rc.mean} -> Band ${calculated} (expected ${rc.expected})`
    );
  }
}

// ----------------------------------------------------
// PRACTICE MODE RECONCILIATION VERIFICATION
// ----------------------------------------------------
console.log('\n--- PRACTICE MODE: Anti-Inflation & Fallback Protection ---');
{
  const practiceWeakResult = reconcilePracticeFeedback(
    {
      fluencyScore: 7.0, // Inflated fallback
      grammarScore: 7.0,
      lexicalScore: 7.0,
      strengths: ['Accurate grammar throughout'],
      corrections: [
        { original: 'I go there last year', correction: 'I went there last year', explanation: 'Past tense required' },
        { original: 'we was happy', correction: 'we were happy', explanation: 'Agreement error' },
      ],
    },
    'I go there last year and we was happy.'
  );

  assert(
    practiceWeakResult.grammarScore <= 5.5,
    `Practice grammar score capped at ${practiceWeakResult.grammarScore} (expected <= 5.5, NOT 7.0)`
  );
  assert(
    practiceWeakResult.practiceBandEstimate <= 6.0,
    `Practice band estimate capped at ${practiceWeakResult.practiceBandEstimate} (expected <= 6.0)`
  );
  assert(
    !practiceWeakResult.strengths.some((s) => s.toLowerCase().includes('accurate grammar')),
    'Contradictory grammar praise removed from practice strengths'
  );
}

console.log('\n====================================================');
console.log(`SUMMARY: All ${passedTests}/${totalTests} tests passed successfully!`);
console.log('====================================================');
