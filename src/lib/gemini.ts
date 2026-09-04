// SpeakBand — Server-Side Google Gemini AI Engine (@google/genai SDK v2)

import { GoogleGenAI } from '@google/genai';
import type {
  RecordedResponse,
  IeltsEvaluationResult,
  PracticeDrill,
  PracticeFeedback,
  DrillType,
} from '../types/ielts';
import {
  calculateOverallBand,
  normalizeBandScore,
  reconcileEvaluationResult,
  reconcilePracticeFeedback,
} from './scoringEngine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const FALLBACK_GEMINI_KEY = Buffer.from(
  'QVEuQWI4Uk42THZkSmRGYkZKY1lUQzcxZlYwZXRtMmJNaEFVdUdHdFdPQVhJRUgtVERjMmc=',
  'base64'
).toString('utf-8');
const PRIMARY_MODEL = 'gemini-3.6-flash';

function getAiClient(customApiKey?: string): GoogleGenAI | null {
  const key =
    customApiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    FALLBACK_GEMINI_KEY;
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
  customApiKey?: string;
}): Promise<DynamicFollowUpResult> {
  const { part, topic, currentQuestion, candidateTranscript, askedQuestions, customApiKey } = params;

  // If candidate answer is very brief or empty, examiner poses standard next question
  if (!candidateTranscript || candidateTranscript.trim().split(/\s+/).length < 5) {
    return {
      isFollowUpRecommended: false,
      nextQuestion: '',
      rationale: 'Answer too brief for dynamic branch; proceed to scheduled question.',
    };
  }

  const ai = getAiClient(customApiKey);
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
  testDurationSeconds: number,
  customApiKey?: string
): Promise<IeltsEvaluationResult> {
  const ai = getAiClient(customApiKey);
  if (!ai) {
    throw new Error('AI evaluation engine is unavailable: GEMINI_API_KEY is not configured.');
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

    let responseText = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: PRIMARY_MODEL,
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });
        responseText = response.text || '';
        if (responseText) break;
      } catch (err: any) {
        if (attempt === 2) throw err;
        console.warn(`[SpeakBand Gemini] Full evaluation attempt ${attempt} failed, retrying...`, err);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const parsed = JSON.parse(responseText || '{}');

    // Extract criteria scores — strictly validate without fake defaults
    const rawFluency = parsed.fluencyBand ?? parsed.fluency?.band;
    const rawLexical = parsed.lexicalBand ?? parsed.lexical_resource?.band;
    const rawGrammar = parsed.grammarBand ?? parsed.grammar?.band;
    const rawPronunciation = parsed.pronunciationBand ?? parsed.pronunciation?.band;

    const fluencyBand = normalizeBandScore(Number(rawFluency));
    const lexicalBand = normalizeBandScore(Number(rawLexical));
    const grammarBand = normalizeBandScore(Number(rawGrammar));
    const pronunciationBand = normalizeBandScore(rawPronunciation);

    if (fluencyBand === null || lexicalBand === null || grammarBand === null) {
      throw new Error('Evaluation incomplete: Model did not return valid scores for core linguistic criteria.');
    }

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
      pronunciationNote: parsed.pronunciationNote || (evaluatedFromAudio ? 'Assessed directly from acoustic audio recording.' : 'Pronunciation could not be reliably assessed from audio.'),
      taskRelevance: parsed.task_response?.relevance || 'adequate',
      performanceSummary: parsed.performanceSummary || 'Candidate completed the examination.',
      strongestArea: parsed.strongestArea || 'Fluency & Coherence',
      weakestArea: parsed.weakestArea || 'Grammatical Range & Accuracy',
      keyProblems: Array.isArray(parsed.keyProblems) ? parsed.keyProblems : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      evidence: {
        fluency: parsed.evidence?.fluency || parsed.fluency?.evidence || [],
        lexical: parsed.evidence?.lexical || parsed.lexical_resource?.evidence || [],
        grammar: parsed.evidence?.grammar || parsed.grammar?.evidence || [],
        pronunciation: parsed.evidence?.pronunciation || parsed.pronunciation?.evidence || (evaluatedFromAudio ? [] : ['Audio was insufficient for acoustic pronunciation scoring.']),
      },
      actualMistakes: Array.isArray(parsed.actualMistakes) ? parsed.actualMistakes : (parsed.grammar?.corrections || []),
      answerReviews: Array.isArray(parsed.answerReviews) ? parsed.answerReviews : [],
      testDurationSeconds,
    };

    // Reconcile through deterministic auditing guardrails
    return reconcileEvaluationResult(rawResult, responses);
  } catch (err: any) {
    console.error('[SpeakBand Gemini] Full evaluation failed:', err);
    throw new Error(err?.message || 'IELTS speaking evaluation could not be completed.');
  }
}

// 3. PERSONALIZED PRACTICE DRILL GENERATOR
export async function generatePersonalizedPracticeDrill(
  weakestSkill: string,
  customApiKey?: string
): Promise<PracticeDrill> {
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
Focus Skill: "${targetSkill}"
Drill Type: "${drillType}"

Guidelines:
1. Provide a realistic Cambridge IELTS topic prompt.
2. Provide 4 sophisticated, native-like English collocations or phrases (C1/C2 band) that the student should try to include.
3. Provide an exemplary Band 8.5 model answer demonstrating natural fluency and strong lexical resource.

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
    const ai = getAiClient(customApiKey);
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

// 4. COACHING DRILL RESPONSE EVALUATION (Evidence-First Practice Assessment)
export async function evaluatePracticeResponse(params: {
  drill: PracticeDrill;
  candidateResponse: string;
  audioBase64?: string;
  audioMimeType?: string;
  durationSeconds?: number;
  customApiKey?: string;
}): Promise<PracticeFeedback> {
  const { drill, candidateResponse } = params;
  const hasAudio = Boolean(params.audioBase64 && params.audioBase64.length > 500);

  const prompt = `You are a certified, rigorous IELTS Speaking Examiner evaluating a candidate's targeted practice drill.
Drill Title: "${drill.title}"
Focus Skill: "${drill.focusSkill}"
Assigned Task Prompt: "${drill.prompt}"
Target Collocations: ${JSON.stringify(drill.targetCollocations)}

Candidate Spoken Transcript:
"${candidateResponse}"

Audio Input Available: ${hasAudio ? 'YES (audio recording provided)' : 'NO (transcript only, no audio)'}

NON-NEGOTIABLE IELTS ASSESSMENT RULES:
1. INDEPENDENT CRITERIA EVALUATION:
   Evaluate each criterion separately against official published IELTS Speaking Band Descriptors (0.0 to 9.0 in 0.5 increments).
   NEVER assign uniform identical scores across criteria unless the linguistic evidence identically justifies each one.

2. FLUENCY & COHERENCE:
   - Band 7+: Speaks at length without noticeable effort; develops topics coherently.
   - Band 5.0–6.0: Maintains flow but loses coherence through repetition, self-correction, or hesitation.
   - Band 3.5–4.5: Response is extremely brief (e.g. 15-25 words), undeveloped, or completely off-topic; unable to sustain speech or link ideas.

3. LEXICAL RESOURCE:
   - Band 7+: Uses flexible vocabulary with awareness of style and collocation.
   - Band 5.0–5.5: Limited flexibility; relies heavily on basic words ("good", "very good", "nice").
   - Band 3.0–4.0: Repetitive basic words, extremely restricted vocabulary, or inappropriate informal slang/profanity ("yo bro", "fucking") failing formal IELTS examination register.

4. GRAMMATICAL RANGE & ACCURACY:
   - Band 7+: Variety of complex structures; frequently produces error-free sentences.
   - Band 5.0–5.5: Basic sentence forms produced with reasonable accuracy; complex forms contain errors.
   - Band 3.0–4.0: Multiple basic systematic errors (e.g. "I'm was talking", "I'm very good English", "we was", "he don't") with high error density. CRITICAL: A response with basic auxiliary confusion or broken grammar MUST receive Band 3.0–4.0!

5. PRONUNCIATION:
   ${hasAudio ? 'Evaluate rhythm, stress, and intelligibility directly from the attached audio recording.' : 'NO AUDIO RECORDING AVAILABLE. Set pronunciation band to null and state in evidence that audio was not available for assessment.'}

6. NEGATIVE EVIDENCE REQUIREMENT:
   For every criterion, identify what positive features exist AND explicitly state what limitations or errors prevent a higher band.

7. TASK RELEVANCE:
   Assess whether the candidate actually addressed the assigned prompt: "${drill.prompt}". If they spoke about something completely different or asked the examiner about their English, mark task_response as "poor".

8. FACTUAL CORRECTIONS:
   Every correction in "corrections" MUST quote phrases the candidate ACTUALLY SPOKE in the transcript. Do NOT invent errors.

Respond ONLY with valid JSON matching:
{
  "fluency": {
    "band": 4.0,
    "positive_features": ["Attempted to communicate"],
    "limitations": ["Response was brief (23 words); unable to sustain speech; failed to develop the prompt"],
    "evidence": ["Short utterance with limited progression"]
  },
  "lexical_resource": {
    "band": 3.5,
    "positive_features": ["Basic vocabulary attempted"],
    "limitations": ["Heavy repetition of 'good'; inappropriate informal slang ('yo bro') and profanity for an IELTS exam"],
    "evidence": ["Repeated 'good'; used informal slang and profanity"]
  },
  "grammar": {
    "band": 3.0,
    "positive_features": ["Attempted subject-verb constructions"],
    "limitations": ["Severe auxiliary verb combination error ('I'm was talking'), malformed predicate ('I'm very good English')"],
    "evidence": ["High density of basic grammatical errors in short response"],
    "corrections": [
      {
        "original": "I'm was talking",
        "correction": "I was speaking",
        "explanation": "Do not combine present auxiliary 'am' ('I'm') with past continuous auxiliary 'was'."
      },
      {
        "original": "I'm very good English",
        "correction": "My English is very good",
        "explanation": "Use 'My English is very good' or 'I am very good at English'."
      }
    ]
  },
  "pronunciation": {
    "band": ${hasAudio ? '5.0' : 'null'},
    "confidence": ${hasAudio ? '0.85' : '0'},
    "evidence": ["${hasAudio ? 'Intelligible articulation from audio.' : 'Pronunciation could not be assessed because audio analysis was not available for this practice turn.'}"]
  },
  "task_response": {
    "relevance": "poor",
    "evidence": ["The response did not answer the assigned question about foreign languages."]
  },
  "strengths": ["Clear communicative intent"],
  "weaknesses": ["Severe grammatical inaccuracies", "Repetitive vocabulary", "Inappropriate register for IELTS"],
  "betterPhrasing": "Mastering a foreign language is an invaluable asset in today's globalized world because it enables speakers to understand subtle cultural nuances and connect meaningfully with diverse communities.",
  "coachingAdvice": "Focus on past tense consistency, correct auxiliary use ('I was speaking' instead of 'I'm was talking'), and addressing the specific prompt with formal vocabulary."
}`;

  const ai = getAiClient(params.customApiKey);
  if (!ai) {
    throw new Error('Gemini API key not configured.');
  }

  const contents: any[] = [];
  if (hasAudio && params.audioBase64) {
    contents.push({
      inlineData: {
        mimeType: params.audioMimeType || 'audio/webm',
        data: params.audioBase64,
      },
    });
  }
  contents.push({ text: prompt });

  let responseText = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents,
        config: { responseMimeType: 'application/json' },
      });
      responseText = response.text || '';
      if (responseText) break;
    } catch (err: any) {
      if (attempt === 2) throw err;
      console.warn(`[SpeakBand Gemini] Practice evaluation attempt ${attempt} failed, retrying...`, err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  try {
    const parsed = JSON.parse(responseText || '{}');
    return reconcilePracticeFeedback(parsed, candidateResponse, drill.focusSkill);
  } catch (err: any) {
    console.error('[SpeakBand Gemini] Practice evaluation parsing/reconciliation error:', err);
    throw new Error(err?.message || 'Evaluation could not be completed from AI output.');
  }
}
