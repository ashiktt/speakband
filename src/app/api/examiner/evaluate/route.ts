// SpeakBand — Full IELTS Speaking Test Evaluation Route Handler

import { NextRequest, NextResponse } from 'next/server';
import { evaluateIeltsSpeakingTest } from '@/lib/gemini';
import { RecordedResponse } from '@/types/ielts';

export const maxDuration = 60; // Allow up to 60s for full multi-criteria assessment

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { responses, testDurationSeconds = 720 }: { responses: RecordedResponse[]; testDurationSeconds: number } = body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'No test responses provided for evaluation' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateIeltsSpeakingTest(responses, testDurationSeconds);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error('[API Examiner Evaluate] Evaluation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to evaluate IELTS speaking test',
      },
      { status: 500 }
    );
  }
}
