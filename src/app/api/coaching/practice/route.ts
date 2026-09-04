// SpeakBand — Personalized IELTS Coaching & Practice Drills Route Handler

import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedPracticeDrill, evaluatePracticeResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, weakestSkill = 'Lexical Resource', drill, candidateResponse } = body;

    if (action === 'get_drill') {
      const generatedDrill = await generatePersonalizedPracticeDrill(weakestSkill);
      return NextResponse.json({ success: true, drill: generatedDrill });
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
