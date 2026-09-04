// SpeakBand — Personalized IELTS Coaching & Practice Drills Route Handler

import { NextRequest, NextResponse } from 'next/server';
import { evaluatePracticeResponse } from '@/lib/gemini';
import {
  getNextPracticeQuestion,
  initializePracticeSessionMemory,
  PracticeSessionMemory,
} from '@/lib/practiceCoach';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      weakestSkill = 'Lexical Resource',
      drill,
      candidateResponse,
      memory,
      focusSkill = 'Fluency & Coherence',
      drillType = 'fluency_challenge',
      recentlyUsedTopics = [],
    } = body;

    if (action === 'get_drill') {
      const activeMemory: PracticeSessionMemory =
        memory && memory.askedQuestions
          ? memory
          : initializePracticeSessionMemory({ recentTopics: recentlyUsedTopics });

      const result = await getNextPracticeQuestion({
        memory: activeMemory,
        focusSkill: weakestSkill || focusSkill,
        drillType,
      });

      return NextResponse.json({
        success: true,
        drill: result.drill,
        memory: result.memory,
        progressionType: result.progressionType,
      });
    }

    if (action === 'next_question') {
      let activeMemory: PracticeSessionMemory =
        memory && memory.askedQuestions
          ? memory
          : initializePracticeSessionMemory({ recentTopics: recentlyUsedTopics });

      if (candidateResponse && typeof candidateResponse === 'string') {
        activeMemory = {
          ...activeMemory,
          conversationHistory: [
            ...activeMemory.conversationHistory,
            { role: 'student', text: candidateResponse.trim(), timestamp: Date.now() },
          ],
        };
      }

      const result = await getNextPracticeQuestion({
        memory: activeMemory,
        focusSkill,
        drillType,
      });

      return NextResponse.json({
        success: true,
        drill: result.drill,
        memory: result.memory,
        progressionType: result.progressionType,
      });
    }

    if (action === 'evaluate_drill') {
      if (!drill || !candidateResponse) {
        return NextResponse.json(
          { success: false, error: 'Missing drill or candidateResponse for evaluation' },
          { status: 400 }
        );
      }

      console.log('[API Practice Eval] INPUT:', {
        drillTitle: drill?.title,
        prompt: drill?.prompt,
        transcriptLength: candidateResponse?.length,
        hasAudio: Boolean(body.audioBase64),
        durationSeconds: body.durationSeconds,
      });

      const feedback = await evaluatePracticeResponse({
        drill,
        candidateResponse,
        audioBase64: body.audioBase64,
        audioMimeType: body.audioMimeType,
        durationSeconds: body.durationSeconds,
      });

      console.log('[API Practice Eval] CALCULATION:', {
        practiceBandEstimate: feedback.practiceBandEstimate,
        fluencyScore: feedback.fluencyScore,
        lexicalScore: feedback.lexicalScore,
        grammarScore: feedback.grammarScore,
        pronunciationScore: feedback.pronunciationScore,
      });

      return NextResponse.json({ success: true, feedback });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('[API Coaching Practice] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process practice drill evaluation' },
      { status: 500 }
    );
  }
}
