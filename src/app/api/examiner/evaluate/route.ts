// SpeakBand — Full IELTS Speaking Test Evaluation Route Handler

import { NextRequest, NextResponse } from 'next/server';
import { evaluateIeltsSpeakingTest } from '@/lib/gemini';
import { RecordedResponse } from '@/types/ielts';

export const maxDuration = 60; // Allow up to 60s for full multi-criteria assessment

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      responses,
      testDurationSeconds = 720,
      customApiKey = body.apiKey || req.headers.get('x-gemini-api-key') || undefined,
    }: { responses: RecordedResponse[]; testDurationSeconds: number; customApiKey?: string } = body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No test responses provided for evaluation' },
        { status: 400 }
      );
    }

    console.log('[API Full Exam Eval] INPUT:', {
      responseCount: responses.length,
      hasAudioSamples: responses.some(r => Boolean(r.audioBase64)),
      testDurationSeconds,
    });

    const evaluation = await evaluateIeltsSpeakingTest(responses, testDurationSeconds, customApiKey);

    console.log('[API Full Exam Eval] CALCULATION:', {
      overallBand: evaluation.overallBand,
      fluency: evaluation.fluencyBand,
      lexical: evaluation.lexicalBand,
      grammar: evaluation.grammarBand,
      pronunciation: evaluation.pronunciationBand,
    });

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
