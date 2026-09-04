// SpeakBand — Conversational IELTS Practice Coaching Engine

import { GoogleGenAI } from '@google/genai';
import type { PracticeDrill, DrillType } from '../types/ielts';
import { PART_1_TOPICS, getUnusedPracticeQuestion, type Part1TopicName } from './questionBank.ts';
import { isSemanticDuplicate } from './questionMemory.ts';

const PRIMARY_MODEL = 'gemini-3.6-flash';

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

export interface PracticeConversationTurn {
  role: 'coach' | 'student';
  text: string;
  topic?: string;
  timestamp?: number;
}

export interface PracticeSessionMemory {
  currentTopic: string;
  topicQuestionCount: number;
  askedQuestions: string[];
  recentTopics: string[];
  conversationHistory: PracticeConversationTurn[];
}

export interface NextPracticeQuestionResult {
  drill: PracticeDrill;
  memory: PracticeSessionMemory;
  progressionType: 'initial' | 'followup' | 'deeper' | 'clarification' | 'topic_transition';
}

/**
 * Initializes fresh Practice Mode session memory with a randomized familiar topic.
 */
export function initializePracticeSessionMemory(options: {
  preferredTopic?: string;
  recentTopics?: string[];
} = {}): PracticeSessionMemory {
  const { preferredTopic, recentTopics = [] } = options;

  let startTopic = preferredTopic;
  if (!startTopic || !PART_1_TOPICS.includes(startTopic as any)) {
    const availableTopics = PART_1_TOPICS.filter((t) => !recentTopics.includes(t));
    const pool = availableTopics.length > 0 ? availableTopics : PART_1_TOPICS;
    startTopic = pool[Math.floor(Math.random() * pool.length)];
  }

  return {
    currentTopic: startTopic,
    topicQuestionCount: 0,
    askedQuestions: [],
    recentTopics: recentTopics.slice(0, 10),
    conversationHistory: [],
  };
}

/**
 * Selects the next topic in the session rotation, avoiding recently used topics.
 */
export function rotateToNextTopic(memory: PracticeSessionMemory): string {
  const current = memory.currentTopic;
  const used = [current, ...memory.recentTopics];
  const eligible = PART_1_TOPICS.filter((t) => !used.includes(t));
  const pool = eligible.length > 0 ? eligible : PART_1_TOPICS.filter((t) => t !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * High-yield topical collocations dictionary for IELTS practice drills
 */
const TOPIC_COLLOCATIONS: Record<string, string[]> = {
  studies: ['academic curriculum', 'rigorous workload', 'acquire foundational knowledge', 'broaden horizons'],
  work: ['professional responsibilities', 'career trajectory', 'collaborative environment', 'work-life balance'],
  hometown: ['vibrant neighborhood', 'rapid urbanization', 'close-knit community', 'rich historical heritage'],
  home: ['spacious living room', 'cozy atmosphere', 'minimalist aesthetic', 'residential district'],
  free_time: ['unwind and recharge', 'pursue creative hobbies', 'outdoor pursuits', 'valuable downtime'],
  daily_routine: ['structured schedule', 'morning rituals', 'peak productivity', 'hectic pace of life'],
  technology: ['cutting-edge devices', 'streamline communication', 'digital footprint', 'indispensable tool'],
  food: ['culinary traditions', 'savory flavors', 'home-cooked delicacies', 'balanced nutrition'],
  travel: ['breathtaking landscapes', 'cultural immersion', 'off the beaten track', 'enriching journey'],
  music: ['uplifting melodies', 'rhythmic complexity', 'acoustic performance', 'evoke memories'],
  weather: ['inclement weather', 'temperate climate', 'torrential rain', 'seasonal shifts'],
  transport: ['commuter routes', 'efficient public transit', 'traffic congestion', 'sustainable mobility'],
  sports: ['cardiovascular fitness', 'competitive spirit', 'physical endurance', 'team camaraderie'],
  books: ['thought-provoking narrative', 'literary classic', 'compelling characters', 'expand perspectives'],
  friends: ['mutual trust', 'cherished companions', 'meaningful connection', 'lean on for support'],
  family: ['unconditional support', 'family gathering', 'strong values', 'upbringing'],
  shopping: ['impulse buying', 'retail therapy', 'consumer preferences', 'good value for money'],
};

function getCollocationsForTopic(topic: string): string[] {
  const clean = topic.toLowerCase().replace(/[\s&/]/g, '_');
  for (const [key, list] of Object.entries(TOPIC_COLLOCATIONS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return list;
    }
  }
  return ['express nuanced views', 'fluent delivery', 'coherent structure', 'natural phrasing'];
}

/**
 * Generates the next adaptive practice question based on conversation history and topic structure.
 * Follows IELTS Coaching principles:
 * - 2 to 4 turns on a topic before transitioning.
 * - Dynamic decision: follow-up, clarification, deeper question, or topic transition.
 * - Semantic deduplication against previously asked questions.
 * - Robust fallback without repeating static questions.
 */
export async function getNextPracticeQuestion(params: {
  memory: PracticeSessionMemory;
  focusSkill?: string;
  drillType?: DrillType;
}): Promise<NextPracticeQuestionResult> {
  const { memory, focusSkill = 'Fluency & Coherence', drillType = 'fluency_challenge' } = params;

  let currentTopic = memory.currentTopic || 'free_time';
  let topicQuestionCount = memory.topicQuestionCount || 0;
  let progressionType: NextPracticeQuestionResult['progressionType'] = 'initial';

  // Determine whether to transition topic (after 2-3 questions on current topic)
  if (topicQuestionCount >= 3) {
    const nextTopic = rotateToNextTopic(memory);
    memory.recentTopics = [currentTopic, ...memory.recentTopics.filter((t) => t !== currentTopic)].slice(0, 10);
    currentTopic = nextTopic;
    topicQuestionCount = 0;
    progressionType = 'topic_transition';
  } else if (topicQuestionCount > 0) {
    const lastTurn = memory.conversationHistory[memory.conversationHistory.length - 1];
    const lastStudentAnswer = lastTurn?.role === 'student' ? lastTurn.text : '';
    const wordCount = lastStudentAnswer.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 8 || /don't know|no idea|not sure/i.test(lastStudentAnswer)) {
      progressionType = 'clarification';
    } else if (wordCount > 35) {
      progressionType = 'deeper';
    } else {
      progressionType = 'followup';
    }
  } else {
    progressionType = 'initial';
  }

  // Attempt AI Generation via Gemini
  const ai = getAiClient();
  if (ai) {
    const recentTurns = memory.conversationHistory.slice(-6).map((t) => ({
      role: t.role === 'coach' ? 'assistant' : 'user',
      content: t.text,
    }));

    const prompt = `You are an adaptive, expert IELTS Speaking Coach.
You are conducting a natural, multi-turn speaking conversation with an IELTS candidate.

CURRENT TOPIC: "${currentTopic}"
PROGRESSION TARGET: "${progressionType}" (initial | followup | deeper | clarification | topic_transition)
FOCUS SKILL: "${focusSkill}"
DRILL TYPE: "${drillType}"

CONVERSATION HISTORY SO FAR:
${JSON.stringify(recentTurns, null, 2)}

PREVIOUSLY ASKED QUESTIONS IN THIS SESSION (DO NOT REPEAT OR PARAPHRASE THESE):
${JSON.stringify(memory.askedQuestions, null, 2)}

STRICT RULES:
1. NEVER repeatedly ask the same question or a semantically equivalent variation (e.g. "What do you do in your free time?" followed by "What activities do you enjoy in your free time?").
2. For "followup": Pick up on a specific interesting detail the student just uttered and explore it conversationally.
3. For "clarification": If the student's answer was brief or unclear, ask a gentle, accessible rephrasing or supportive prompt.
4. For "deeper": Ask an analytical or reasoning question exploring "why", "how", or a comparison on the current topic.
5. For "topic_transition": Begin with a natural transition marker like "Thank you. Let's move on to discuss [new topic]." and pose a fresh IELTS question on "${currentTopic}".
6. For "initial": Ask an inviting, authentic IELTS Part 1 question on "${currentTopic}".
7. The question MUST be natural, grammatically flawless, and IELTS-appropriate.
8. Do NOT teach or give feedback in the question itself. Just pose the question naturally.

Respond ONLY with valid JSON matching this schema:
{
  "question": "The exact question string for the candidate",
  "topic": "${currentTopic}",
  "progressionType": "${progressionType}",
  "targetCollocations": ["collocation 1", "collocation 2", "collocation 3", "collocation 4"],
  "modelAnswer": "An exemplary Band 8.5 spoken response to this question."
}`;

    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      const generatedQuestion = (parsed.question || '').trim();

      // Validate semantic deduplication
      if (
        generatedQuestion &&
        !memory.askedQuestions.includes(generatedQuestion) &&
        !isSemanticDuplicate(generatedQuestion, memory.askedQuestions)
      ) {
        const updatedMemory: PracticeSessionMemory = {
          currentTopic,
          topicQuestionCount: topicQuestionCount + 1,
          askedQuestions: [...memory.askedQuestions, generatedQuestion],
          recentTopics: memory.recentTopics,
          conversationHistory: [
            ...memory.conversationHistory,
            { role: 'coach', text: generatedQuestion, topic: currentTopic, timestamp: Date.now() },
          ],
        };

        const drill: PracticeDrill = {
          id: `drill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          drillType,
          title: formatTopicTitle(currentTopic),
          focusSkill,
          description: `Adaptive coaching on ${currentTopic.replace(/_/g, ' ')} (${progressionType.replace('_', ' ')}).`,
          instructions: 'Speak spontaneously and naturally. Incorporate the recommended collocations where appropriate.',
          prompt: generatedQuestion,
          timeLimitSeconds: drillType === 'cue_card_challenge' ? 120 : 60,
          targetCollocations: Array.isArray(parsed.targetCollocations) && parsed.targetCollocations.length > 0
            ? parsed.targetCollocations
            : getCollocationsForTopic(currentTopic),
          modelAnswer: parsed.modelAnswer || 'Without a doubt, having dedicated time to pursue meaningful interests enhances our overall well-being.',
        };

        return { drill, memory: updatedMemory, progressionType };
      }
    } catch (aiErr) {
      console.warn('[SpeakBand Practice Coach] Gemini question generation failed, using question bank fallback:', aiErr);
    }
  }

  // Resilient Fallback: Select an unused, non-duplicate question from question bank
  const fallbackItem = getUnusedPracticeQuestion(currentTopic, memory.askedQuestions);
  let finalPrompt = fallbackItem.question;
  if (progressionType === 'topic_transition') {
    finalPrompt = `Thank you. Let's move on to discuss ${currentTopic.replace(/_/g, ' ')}. ${fallbackItem.question}`;
  }

  const updatedMemory: PracticeSessionMemory = {
    currentTopic,
    topicQuestionCount: topicQuestionCount + 1,
    askedQuestions: [...memory.askedQuestions, finalPrompt],
    recentTopics: memory.recentTopics,
    conversationHistory: [
      ...memory.conversationHistory,
      { role: 'coach', text: finalPrompt, topic: currentTopic, timestamp: Date.now() },
    ],
  };

  const drill: PracticeDrill = {
    id: `drill_${Date.now()}_${fallbackItem.id}`,
    drillType,
    title: formatTopicTitle(currentTopic),
    focusSkill,
    description: `IELTS practice drill focusing on ${currentTopic.replace(/_/g, ' ')}.`,
    instructions: 'Deliver a smooth, extended response directly addressing the prompt.',
    prompt: finalPrompt,
    timeLimitSeconds: drillType === 'cue_card_challenge' ? 120 : 60,
    targetCollocations: getCollocationsForTopic(currentTopic),
    modelAnswer: 'In my experience, approaching this thoughtfully allows for both personal clarity and engaging communication.',
  };

  return { drill, memory: updatedMemory, progressionType };
}

function formatTopicTitle(topic: string): string {
  const formatted = topic
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${formatted} Practice`;
}
