// SpeakBand — Deterministic IELTS Examination State Machine

import { TestState, ActiveTestSession, RecordedResponse, Part2CueCard } from '@/types/ielts';

export const VALID_STATE_TRANSITIONS: Record<TestState, TestState[]> = {
  IDLE: ['INTRODUCTION'],
  INTRODUCTION: ['PART_1'],
  PART_1: ['PART_2_INSTRUCTIONS'],
  PART_2_INSTRUCTIONS: ['PART_2_PREPARATION'],
  PART_2_PREPARATION: ['PART_2_LONG_TURN'],
  PART_2_LONG_TURN: ['PART_2_CLOSING'],
  PART_2_CLOSING: ['PART_3'],
  PART_3: ['TEST_COMPLETE'],
  TEST_COMPLETE: ['EVALUATION'],
  EVALUATION: ['RESULTS'],
  RESULTS: ['COACHING', 'IDLE'],
  COACHING: ['RESULTS', 'IDLE'],
};

export const STATE_LABELS: Record<TestState, string> = {
  IDLE: 'Exam Setup',
  INTRODUCTION: 'Introduction & ID Check',
  PART_1: 'Part 1: Interview on Familiar Topics',
  PART_2_INSTRUCTIONS: 'Part 2: Cue Card Instructions',
  PART_2_PREPARATION: 'Part 2: 1-Minute Preparation',
  PART_2_LONG_TURN: 'Part 2: Individual Long Turn (2 Mins)',
  PART_2_CLOSING: 'Part 2: Rounding-off Questions',
  PART_3: 'Part 3: Two-Way Analytical Discussion',
  TEST_COMPLETE: 'Test Completed',
  EVALUATION: 'AI Assessment in Progress',
  RESULTS: 'IELTS Speaking Evaluation Report',
  COACHING: 'Personalized Coaching Drill',
};

const ACTIVE_SESSION_STORAGE_KEY = 'speakband_active_exam_session';

export class ExaminationStateMachine {
  private session: ActiveTestSession;

  constructor(initialSession?: Partial<ActiveTestSession>) {
    if (initialSession && initialSession.sessionId) {
      this.session = {
        sessionId: initialSession.sessionId,
        state: initialSession.state || 'IDLE',
        currentPart: initialSession.currentPart || 1,
        part1Topics: initialSession.part1Topics || [],
        currentTopicIndex: initialSession.currentTopicIndex || 0,
        currentQuestionIndex: initialSession.currentQuestionIndex || 0,
        activeCueCard: initialSession.activeCueCard || null,
        scratchpadNotes: initialSession.scratchpadNotes || '',
        responses: initialSession.responses || [],
        startTime: initialSession.startTime || Date.now(),
        partStartTime: initialSession.partStartTime || Date.now(),
        isComplete: initialSession.isComplete || false,
      };
    } else {
      this.session = {
        sessionId: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        state: 'IDLE',
        currentPart: 1,
        part1Topics: [],
        currentTopicIndex: 0,
        currentQuestionIndex: 0,
        activeCueCard: null,
        scratchpadNotes: '',
        responses: [],
        startTime: Date.now(),
        partStartTime: Date.now(),
        isComplete: false,
      };
    }
  }

  public getSession(): ActiveTestSession {
    return { ...this.session };
  }

  public getState(): TestState {
    return this.session.state;
  }

  public canTransitionTo(targetState: TestState): boolean {
    const allowed = VALID_STATE_TRANSITIONS[this.session.state];
    return allowed ? allowed.includes(targetState) : false;
  }

  public transition(targetState: TestState): boolean {
    if (!this.canTransitionTo(targetState)) {
      console.warn(
        `[SpeakBand StateMachine] Invalid transition attempted: ${this.session.state} -> ${targetState}`
      );
      return false;
    }

    this.session.state = targetState;
    this.session.partStartTime = Date.now();

    if (targetState === 'PART_1') {
      this.session.currentPart = 1;
    } else if (
      targetState === 'PART_2_INSTRUCTIONS' ||
      targetState === 'PART_2_PREPARATION' ||
      targetState === 'PART_2_LONG_TURN' ||
      targetState === 'PART_2_CLOSING'
    ) {
      this.session.currentPart = 2;
    } else if (targetState === 'PART_3') {
      this.session.currentPart = 3;
    } else if (targetState === 'TEST_COMPLETE') {
      this.session.isComplete = true;
    }

    this.persist();
    return true;
  }

  public addResponse(response: RecordedResponse): void {
    this.session.responses.push(response);
    this.persist();
  }

  public setCueCard(cueCard: Part2CueCard): void {
    this.session.activeCueCard = cueCard;
    this.persist();
  }

  public setScratchpadNotes(notes: string): void {
    this.session.scratchpadNotes = notes;
    this.persist();
  }

  public persist(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(this.session));
      } catch (err) {
        console.error('[SpeakBand StateMachine] Failed to persist session:', err);
      }
    }
  }

  public static loadPersistedSession(): ActiveTestSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as ActiveTestSession;
      return parsed;
    } catch (err) {
      console.error('[SpeakBand StateMachine] Failed to load persisted session:', err);
      return null;
    }
  }

  public static clearPersistedSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('[SpeakBand StateMachine] Failed to clear session:', err);
    }
  }
}
