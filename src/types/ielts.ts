// SpeakBand — Core IELTS Type Definitions

export type TestState =
  | 'IDLE'
  | 'INTRODUCTION'
  | 'PART_1'
  | 'PART_2_INSTRUCTIONS'
  | 'PART_2_PREPARATION'
  | 'PART_2_LONG_TURN'
  | 'PART_2_CLOSING'
  | 'PART_3'
  | 'TEST_COMPLETE'
  | 'EVALUATION'
  | 'RESULTS'
  | 'COACHING';

export type MicState =
  | 'IDLE'
  | 'LISTENING'
  | 'RECORDING'
  | 'PROCESSING'
  | 'EXAMINER_SPEAKING'
  | 'ERROR';

export interface Part1Question {
  id: string;
  part: 1;
  topic: string;
  difficulty: 'standard' | 'followup';
  question: string;
}

export interface Part2CueCard {
  id: string;
  topic: string;
  cuePrompt: string;
  bulletPoints: string[];
  closingQuestions: string[];
}

export interface Part3Question {
  id: string;
  part: 3;
  cueCardTopicId: string;
  subTopic: string;
  question: string;
  promptType: 'opinion' | 'reason' | 'comparison' | 'prediction' | 'evaluation';
}

export interface RecordedResponse {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  question: string;
  candidateTranscript: string;
  audioBase64?: string;
  audioMimeType?: string;
  durationSeconds: number;
  timestamp: number;
}

export interface BandCriteriaScores {
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation?: number | null;
}

export interface IeltsEvidence {
  fluency: string[];
  lexical: string[];
  grammar: string[];
  pronunciation: string[];
}

export interface GrammarCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface AnswerReviewItem {
  part: number;
  topic: string;
  question: string;
  candidateTranscript: string;
  keyIssues: string[];
  betterVersion: string;
  usefulLanguage: string[];
}

export interface IeltsEvaluationResult {
  id: string;
  testId: string;
  createdAt: string;
  overallBand: number;
  fluencyBand: number;
  lexicalBand: number;
  grammarBand: number;
  pronunciationBand: number | null;
  pronunciationNote?: string;
  taskRelevance?: 'good' | 'adequate' | 'poor';
  performanceSummary: string;
  strongestArea: string;
  weakestArea: string;
  keyProblems: string[];
  recommendedActions: string[];
  evidence: IeltsEvidence;
  actualMistakes: GrammarCorrection[];
  answerReviews: AnswerReviewItem[];
  testDurationSeconds: number;
  confidenceScore?: number;
  isPracticeEstimate?: boolean;
}

export type DrillType =
  | 'fluency_challenge'
  | 'vocabulary_challenge'
  | 'grammar_challenge'
  | 'pronunciation_challenge'
  | 'cue_card_challenge';

export interface PracticeDrill {
  id: string;
  drillType: DrillType;
  title: string;
  focusSkill: string;
  description: string;
  instructions: string;
  prompt: string;
  timeLimitSeconds: number;
  targetCollocations: string[];
  modelAnswer: string;
}

export interface PracticeFeedback {
  practiceBandEstimate: number;
  fluencyScore: number;
  lexicalScore: number;
  grammarScore: number;
  pronunciationScore: number | null;
  taskRelevance?: 'good' | 'adequate' | 'poor';
  strengths: string[];
  weaknesses?: string[];
  corrections: GrammarCorrection[];
  betterPhrasing: string;
  coachingAdvice: string;
  criterionEvidence: {
    fluency: string[];
    lexical: string[];
    grammar: string[];
    pronunciation: string[];
  };
  confidence: number;
}

export interface ActiveTestSession {
  sessionId: string;
  state: TestState;
  currentPart: 1 | 2 | 3;
  part1Topics: string[];
  currentTopicIndex: number;
  currentQuestionIndex: number;
  activeCueCard: Part2CueCard | null;
  scratchpadNotes: string;
  responses: RecordedResponse[];
  startTime: number;
  partStartTime: number;
  isComplete: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  targetBand: number;
  createdAt: string;
}

export interface TestHistorySummary {
  id: string;
  createdAt: string;
  overallBand: number;
  fluencyBand: number;
  lexicalBand: number;
  grammarBand: number;
  pronunciationBand: number | null;
  testDurationSeconds: number;
  weakestSkill: string;
  strongestSkill: string;
}
