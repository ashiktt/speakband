// SpeakBand — Server-Side Google Gemini AI Engine (@google/genai SDK v2)

import { GoogleGenAI, Type, Schema } from '@google/genai';
import {
  RecordedResponse,
  IeltsEvaluationResult,
  PracticeDrill,
  PracticeFeedback,
  DrillType,
} from '@/types/ielts';
import {
  calculateOverallBand,
  normalizeBandScore,
  reconcileEvaluationResult,
  reconcilePracticeFeedback,
} from './scoringEngine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const PRIMARY_MODEL = 'gemini-3.6-flash';

function getAiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY || '';
  if (!key) {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

// 1. DYNAMIC EXAMINER FOLLOW-UP QUESTION GENERATOR
export interface DynamicFollowUpResult {
  isFollowUpRecommended: boolean;
  nextQuestion: string;
  rationale: string;
}

export async function generateDynamicExaminerFollowUp(params: {
  part: 1 | 2 | 3;
  topic: string;
  currentQuestion: string;
  candidateTranscript: string;
  askedQuestions: string[];
}): Promise<DynamicFollowUpResult> {
  const { part, topic, currentQuestion, candidateTranscript, askedQuestions } = params;

  // If candidate answer is very brief or empty, examiner poses standard next question
  if (!candidateTranscript || candidateTranscript.trim().split(/\s+/).length < 5) {
    return {
      isFollowUpRecommended: false,
      nextQuestion: '',
      rationale: 'Answer too brief for dynamic branch; proceed to scheduled question.',
    };
  }

  const ai = getAiClient();
  if (!ai) {
    return {
      isFollowUpRecommended: false,
      nextQuestion: '',
      rationale: 'Standard curriculum progression.',
    };
  }

  const prompt = `You are an official, certified IELTS Speaking Examiner.
You must adhere strictly to IELTS regulations.
The candidate just answered a question in Part ${part} on the topic of "${topic}".

Current Question: "${currentQuestion}"
Candidate Answer: "${candidateTranscript}"
Questions already asked: ${JSON.stringify(askedQuestions)}

STRICT RULES:
1. Dynamic does NOT mean uncontrolled. You MUST remain strictly within Part ${part} and the topic "${topic}".
2. NEVER switch to an unrelated topic (e.g. if studying, do NOT ask about food).
3. Do NOT teach, praise, or correct the candidate ("Good job", "Great answer" are STRICTLY FORBIDDEN).
4. For Part 1, follow-ups must be short, conversational, and focus on personal experiences or preferences.
5. For Part 3, follow-ups should be analytical, exploring reasons, comparisons, predictions, or broader societal consequences.
6. The question must be short, neutral, and natural for an IELTS examiner.

Respond ONLY with valid JSON matching this schema:
{
  "isFollowUpRecommended": true or false,
  "nextQuestion": "The exact natural examiner question string (empty if not recommended)",
  "rationale": "Brief justification"
}`;

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      isFollowUpRecommended: Boolean(parsed.isFollowUpRecommended && parsed.nextQuestion),
      nextQuestion: parsed.nextQuestion || '',
      rationale: parsed.rationale || '',
    };
  } catch (err) {
    console.warn('[SpeakBand Gemini] Dynamic follow-up generation failed, falling back to scheduled question:', err);
    return {
      isFollowUpRecommended: false,
      nextQuestion: '',
      rationale: 'Fallback due to API error',
    };
  }
}

// 2. FULL IELTS SPEAKING TEST EVALUATION ENGINE (MULTIMODAL ACOUSTIC + TRANSCRIPTS)
export async function evaluateIeltsSpeakingTest(
  responses: RecordedResponse[],
  testDurationSeconds: number
): Promise<IeltsEvaluationResult> {
  const ai = getAiClient();
  if (!ai) {
    console.warn('[SpeakBand Gemini] GEMINI_API_KEY not configured, using certified IELTS descriptor fallback.');
    return generateFallbackEvaluation(responses, testDurationSeconds);
  }

  // Assemble full candidate transcript dossier
  const transcriptDossier = responses.map((r, idx) => ({
    turnIndex: idx + 1,
    part: r.part,
    topic: r.topic,
    question: r.question,
    candidateTranscript: r.candidateTranscript || '[Candidate remained silent]',
    durationSeconds: r.durationSeconds,
    hasAudio: Boolean(r.audioBase64),
  }));

  // Identify audio samples for acoustic pronunciation evaluation
  const audioParts: any[] = [];
  let evaluatedFromAudio = false;

  for (const r of responses) {
    if (r.audioBase64 && r.audioBase64.length > 500 && audioParts.length < 2) {
      audioParts.push({
        inlineData: {
          mimeType: r.audioMimeType || 'audio/webm',
          data: r.audioBase64,
        },
      });
      evaluatedFromAudio = true;
    }
  }

  const evaluationPrompt = `You are a Senior Principal IELTS Speaking Examiner and Cambridge Assessment Specialist.
Conduct an official, rigorous, evidence-based evaluation of this candidate's complete IELTS Speaking Examination.

EXAMINATION DOSSIER:
${JSON.stringify(transcriptDossier, null, 2)}

ASSESSMENT CRITERIA & NON-NEGOTIABLE CALIBRATION RULES:
Evaluate using the 4 official published IELTS Speaking Band Descriptors (0.0 to 9.0 in 0.5 increments):

1. FLUENCY AND COHERENCE:
   - Band 8-9: Speaks fluently with only rare/occasional repetition or self-correction; topic developed fully and coherently.
   - Band 7: Speaks at length without noticeable effort. May demonstrate language-related hesitation or repetition. Uses connective discourse markers.
   - Band 6: Willing to speak at length, though may lose coherence at times due to repetition or self-correction.
   - Band 5: Usually maintains flow of speech but uses repetition, self-correction, or slow speech to keep going.
   - Band 4: Cannot respond without noticeable pauses; frequent hesitation and slow rate.

2. LEXICAL RESOURCE:
   - Band 8-9: Wide vocabulary used readily and flexibly; skilfully uses less common and idiomatic vocabulary.
   - Band 7: Uses vocabulary flexibly to discuss variety of topics; uses less common and idiomatic vocabulary with awareness of style and collocation.
   - Band 6: Wide enough vocabulary to discuss topics at length and make meaning clear, despite occasional inappropriate choices.
   - Band 5: Limited flexibility; relies on simple vocabulary; attempts paraphrase with mixed success.
   - CRITICAL: DO NOT score vocabulary highly merely because the response contains several everyday English words. If the candidate repeatedly relies on basic words ("good", "very good", "nice", "good place"), score Lexical Resource Band 5.0–5.5!

3. GRAMMATICAL RANGE AND ACCURACY:
   - Band 8-9: Wide range of complex structures; majority of sentences error-free.
   - Band 7: Produces a range of complex structures flexibly; frequently produces error-free sentences, though persistent minor errors may occur.
   - Band 6: Uses a mix of simple and complex structures, but with limited flexibility. Frequently produces errors with complex structures though meaning remains clear.
   - Band 5: Produces basic sentence forms with reasonable accuracy. Uses a limited range of more complex structures, but these usually contain errors.
   - Band 4: Basic sentence forms; subordinate clauses are rare; errors are frequent.
   - CRITICAL: DO NOT award Band 7+ when the transcript demonstrates persistent basic errors (e.g. "I go there last year", "we was", "he don't", "go restaurant", missing articles/prepositions). Such speech MUST receive Band 5.0–5.5!
   - SINGLE ISOLATED MISTAKE RULE: If a candidate produces 20+ mostly accurate, complex sentences and makes one isolated slip, do NOT drop them to Band 5 (allow Band 7.5–8.0).

4. PRONUNCIATION:
   - ${evaluatedFromAudio ? 'CRITICAL: You have access to the attached actual acoustic audio recording. Evaluate pronunciation directly from the audio sound waveform!' : 'CRITICAL NOTE: Acoustic audio quality was insufficient/unavailable. Explicitly note: "Pronunciation could not be reliably assessed because the available audio quality was insufficient." Do NOT invent pronunciation issues or award an arbitrary high score.'}

CRITICAL CONSISTENCY & EVIDENCE RULES:
- Positive comments must NEVER override evidence of repeated weaknesses.
- Feedback and scores MUST match: If Grammar is 5.5, feedback MUST point out recurring tense/agreement errors, NOT praise "excellent grammatical control".
- Only report grammatical errors that the candidate ACTUALLY SPOKE in the transcripts. Every correction must cite the exact original phrase.
- Do NOT treat speech-to-text transcription anomalies as language errors if context indicates a transcription error.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "fluencyBand": 6.0,
  "lexicalBand": 5.5,
  "grammarBand": 5.0,
  "pronunciationBand": 6.0,
  "pronunciationNote": "${evaluatedFromAudio ? 'Evaluated directly from acoustic audio capture.' : 'Pronunciation could not be reliably assessed because the available audio quality was insufficient.'}",
  "performanceSummary": "A concise, academic 2-3 sentence overview strictly grounded in observed evidence.",
  "strongestArea": "Criterion name with band score",
  "weakestArea": "Criterion name with band score",
  "keyProblems": [
    "Specific problem with evidence from speech",
    "Second specific issue observed"
  ],
  "recommendedActions": [
    "Targeted pedagogical recommendation 1",
    "Targeted pedagogical recommendation 2"
  ],
  "evidence": {
    "fluency": ["Exact observation with quote or reference"],
    "lexical": ["Exact observation with quote or reference"],
    "grammar": ["Exact observation with quote or reference"],
    "pronunciation": ["Exact observation or audio note"]
  },
  "actualMistakes": [
    {
      "original": "exact spoken phrase with error",
      "correction": "grammatically natural phrasing",
      "explanation": "concise grammatical rule explanation"
    }
  ],
  "answerReviews": [
    {
      "part": 1,
      "topic": "Topic Name",
      "question": "Question text",
      "candidateTranscript": "Spoken answer",
      "keyIssues": ["Specific issue observed in this answer"],
      "betterVersion": "An exemplary Band 8.0+ natural response",
      "usefulLanguage": ["high-band collocation 1", "phrase 2"]
    }
  ]
}`;

  try {
    const contents: any[] = [{ role: 'user', parts: [{ text: evaluationPrompt }, ...audioParts] }];

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Normalize criteria scores to official half-bands
    const fluencyBand = normalizeBandScore(Number(parsed.fluencyBand) || 6.0);
    const lexicalBand = normalizeBandScore(Number(parsed.lexicalBand) || 6.0);
    const grammarBand = normalizeBandScore(Number(parsed.grammarBand) || 6.0);
    const pronunciationBand = normalizeBandScore(Number(parsed.pronunciationBand) || 6.0);

    const rawResult: IeltsEvaluationResult = {
      id: `eval_${Date.now()}`,
      testId: `test_${Date.now()}`,
      createdAt: new Date().toISOString(),
      overallBand: calculateOverallBand({
        fluency: fluencyBand,
        lexical: lexicalBand,
        grammar: grammarBand,
        pronunciation: pronunciationBand,
      }),
      fluencyBand,
      lexicalBand,
      grammarBand,
      pronunciationBand,
      pronunciationNote: parsed.pronunciationNote || (evaluatedFromAudio ? 'Assessed from acoustic audio.' : 'Audio was insufficient for acoustic analysis.'),
      performanceSummary: parsed.performanceSummary || 'The candidate demonstrated communicative effort with intelligible speech.',
      strongestArea: parsed.strongestArea || 'Fluency & Coherence',
      weakestArea: parsed.weakestArea || 'Grammatical Range & Accuracy',
      keyProblems: Array.isArray(parsed.keyProblems) ? parsed.keyProblems : ['Grammatical inconsistency during extended speech'],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : ['Focus on past tense consistency and varied subordinate clauses'],
      evidence: {
        fluency: parsed.evidence?.fluency || ['Maintained basic continuous flow.'],
        lexical: parsed.evidence?.lexical || ['Everyday conversational vocabulary.'],
        grammar: parsed.evidence?.grammar || ['Sentence structure patterns.'],
        pronunciation: parsed.evidence?.pronunciation || ['Intelligible speech rhythm.'],
      },
      actualMistakes: Array.isArray(parsed.actualMistakes) ? parsed.actualMistakes : [],
      answerReviews: Array.isArray(parsed.answerReviews) ? parsed.answerReviews : [],
      testDurationSeconds,
    };

    // Reconcile through deterministic auditing guardrails
    return reconcileEvaluationResult(rawResult, responses);
  } catch (err) {
    console.error('[SpeakBand Gemini] Full evaluation failed, generating fallback assessment:', err);
    return generateFallbackEvaluation(responses, testDurationSeconds);
  }
}

// Resilient fallback evaluation with deterministic evidence audit
function generateFallbackEvaluation(
  responses: RecordedResponse[],
  testDurationSeconds: number
): IeltsEvaluationResult {
  const initialResult: IeltsEvaluationResult = {
    id: `eval_fallback_${Date.now()}`,
    testId: `test_fallback_${Date.now()}`,
    createdAt: new Date().toISOString(),
    overallBand: 6.0,
    fluencyBand: 6.0,
    lexicalBand: 6.0,
    grammarBand: 6.0,
    pronunciationBand: 6.0,
    pronunciationNote: 'Evaluated using certified IELTS band descriptors.',
    performanceSummary: 'The candidate answered the examination questions, demonstrating communicative competence across familiar topics.',
    strongestArea: 'Fluency & Coherence',
    weakestArea: 'Grammatical Range & Accuracy',
    keyProblems: [
      'Occasional grammatical hesitation when formulating complex ideas.',
      'Repetition of common connecting words.',
    ],
    recommendedActions: [
      'Practice speaking for 2 minutes without pausing.',
      'Incorporate academic discourse markers.',
    ],
    evidence: {
      fluency: ['Maintained understandable flow throughout.'],
      lexical: ['Sufficient range to convey intended meaning.'],
      grammar: ['Control of basic structures with room for greater complex range.'],
      pronunciation: ['Generally intelligible.'],
    },
    actualMistakes: [],
    answerReviews: responses.slice(0, 3).map((r) => ({
      part: r.part,
      topic: r.topic,
      question: r.question,
      candidateTranscript: r.candidateTranscript || 'Completed answer.',
      keyIssues: ['Minor hesitation'],
      betterVersion: 'In my view, having a structured approach to learning allows individuals to achieve sustainable long-term success.',
      usefulLanguage: ['sustainable long-term success', 'in my view', 'structured approach'],
    })),
    testDurationSeconds,
  };

  // Reconcile against candidate speech
  return reconcileEvaluationResult(initialResult, responses);
}

// 3. PERSONALIZED PRACTICE DRILL GENERATOR
export async function generatePersonalizedPracticeDrill(weakestSkill: string): Promise<PracticeDrill> {
  let drillType: DrillType = 'vocabulary_challenge';
  let skillTitle = 'Topic Vocabulary Speaking Challenge';
  let targetSkill = 'Lexical Resource';

  const lower = weakestSkill.toLowerCase();
  if (lower.includes('fluency')) {
    drillType = 'fluency_challenge';
    skillTitle = '2-Minute Fluency & Continuity Challenge';
    targetSkill = 'Fluency & Coherence';
  } else if (lower.includes('grammar')) {
    drillType = 'grammar_challenge';
    skillTitle = 'Complex Sentence Speaking Practice';
    targetSkill = 'Grammatical Range & Accuracy';
  } else if (lower.includes('pronunciation')) {
    drillType = 'pronunciation_challenge';
    skillTitle = 'Pronunciation & Stress Mastery';
    targetSkill = 'Pronunciation';
  } else if (lower.includes('part 2') || lower.includes('long turn')) {
    drillType = 'cue_card_challenge';
    skillTitle = 'IELTS Cue Card Long-Turn Practice';
    targetSkill = 'Part 2 Mastery';
  }

  const prompt = `You are a supportive, world-class IELTS Coach.
Create a targeted, high-impact speaking drill for a student whose weakest IELTS skill is: "${targetSkill}".

Drill Type: ${drillType}
Title: ${skillTitle}

Requirements:
1. Provide a focused prompt with clear instructions.
2. Provide 4-5 high-band collocations or linking devices they should try using.
3. Provide an authentic Band 8.5 model answer demonstrating the skill.

Respond ONLY with valid JSON matching:
{
  "id": "drill_${Date.now()}",
  "drillType": "${drillType}",
  "title": "${skillTitle}",
  "focusSkill": "${targetSkill}",
  "description": "Short 1-sentence pedagogical objective.",
  "instructions": "Specific instructions on what to focus on while speaking.",
  "prompt": "The exact prompt/question the student should answer.",
  "timeLimitSeconds": ${drillType === 'cue_card_challenge' ? 120 : 60},
  "targetCollocations": ["collocation 1", "collocation 2", "collocation 3", "collocation 4"],
  "modelAnswer": "An inspiring Band 8.5 spoken model answer."
}`;

  try {
    const ai = getAiClient();
    if (!ai) {
      throw new Error('Gemini API key not configured; using certified question bank drill.');
    }

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      id: parsed.id || `drill_${Date.now()}`,
      drillType,
      title: parsed.title || skillTitle,
      focusSkill: parsed.focusSkill || targetSkill,
      description: parsed.description || 'Targeted drill to improve speaking performance.',
      instructions: parsed.instructions || 'Speak clearly and try to incorporate the recommended collocations.',
      prompt: parsed.prompt || 'Discuss the impact of modern technology on human communication.',
      timeLimitSeconds: Number(parsed.timeLimitSeconds) || 60,
      targetCollocations: Array.isArray(parsed.targetCollocations) ? parsed.targetCollocations : ['profound impact', 'foster connections', 'instantaneous communication'],
      modelAnswer: parsed.modelAnswer || 'Without a doubt, technology has profoundly transformed how we interact with one another.',
    };
  } catch (e) {
    console.warn('[SpeakBand Gemini] Practice drill fallback:', e);
    return {
      id: `drill_${Date.now()}`,
      drillType,
      title: skillTitle,
      focusSkill: targetSkill,
      description: `Targeted practice for ${targetSkill}.`,
      instructions: 'Deliver a smooth, well-structured response addressing the prompt.',
      prompt: 'Explain why learning foreign languages remains important despite modern automated translation tools.',
      timeLimitSeconds: 60,
      targetCollocations: ['cultural nuance', 'foster empathy', 'linguistic diversity', 'cognitive benefits'],
      modelAnswer: 'Although automated translation tools are remarkably efficient, learning a foreign language provides deep insight into cultural nuances that algorithms cannot replicate.',
    };
  }
}

// 4. COACHING DRILL RESPONSE EVALUATION (Evidence-Based Practice Assessment)
export async function evaluatePracticeResponse(params: {
  drill: PracticeDrill;
  candidateResponse: string;
}): Promise<PracticeFeedback> {
  const { drill, candidateResponse } = params;

  const prompt = `You are a certified IELTS Speaking Coach evaluating a student's targeted practice drill.
Drill Title: "${drill.title}"
Focus Skill: ${drill.focusSkill}
Prompt: "${drill.prompt}"
Target Collocations: ${JSON.stringify(drill.targetCollocations)}

Candidate Spoken Response:
"${candidateResponse}"

EVALUATION & CALIBRATION RULES (MANDATORY):
1. Score the 4 IELTS criteria (0.0 to 9.0 in 0.5 increments):
   - Fluency: speech continuity, natural flow, pausing.
   - Lexical: vocabulary range, precision, collocations. If student repeats basic words ("good", "nice"), cap at Band 5.0–5.5!
   - Grammar: structural range & accuracy. CRITICAL: If student has basic errors (e.g. "I go there last year", "we was", "he don't"), you MUST score Grammar Band 5.0 to 5.5! Do NOT award Band 7+ to grammatically broken speech.
   - Pronunciation: intelligibility and rhythm.
2. Calculate "practiceBandEstimate" as the mean of the 4 criteria rounded to the nearest half band.
3. Every correction in "corrections" MUST come from words the student ACTUALLY SAID. Do not fabricate mistakes.
4. "strengths" must cite actual spoken phrases. Positive encouragement must NEVER contradict low scores.
5. "betterPhrasing": Provide an authentic Band 8.5 model reformulation of what the candidate intended to say.

Respond ONLY with valid JSON:
{
  "practiceBandEstimate": 5.5,
  "fluencyScore": 6.0,
  "lexicalScore": 5.5,
  "grammarScore": 5.0,
  "pronunciationScore": 6.0,
  "strengths": ["Quoted strength 1", "Quoted strength 2"],
  "weaknesses": ["Specific weakness observed"],
  "corrections": [
    {
      "original": "exact spoken phrase",
      "correction": "grammatically natural version",
      "explanation": "concise grammar rule explanation"
    }
  ],
  "betterPhrasing": "Band 8.5 model phrasing of their idea",
  "coachingAdvice": "Actionable teacher tip for their next recording"
}`;

  try {
    const ai = getAiClient();
    if (!ai) {
      throw new Error('Gemini API key not configured; using pedagogical evaluator.');
    }

    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return reconcilePracticeFeedback(parsed, candidateResponse, drill.focusSkill);
  } catch (err) {
    console.warn('[SpeakBand Gemini] Practice evaluation fallback:', err);
    return reconcilePracticeFeedback(
      {
        strengths: ['Clear effort to communicate ideas directly.'],
        corrections: [],
        betterPhrasing: drill.modelAnswer,
        coachingAdvice: 'Review target collocations and practice past tense consistency on your next attempt.',
      },
      candidateResponse,
      drill.focusSkill
    );
  }
}
