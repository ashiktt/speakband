// SpeakBand — Examiner Dynamic Follow-up Route Handler

import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicExaminerFollowUp } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      part,
      topic,
      currentQuestion,
      candidateTranscript,
      askedQuestions = [],
      customApiKey = body.apiKey || req.headers.get('x-gemini-api-key') || undefined,
    } = body;

    if (!part || !topic || !currentQuestion) {
      return NextResponse.json(
        { error: 'Missing required parameters (part, topic, currentQuestion)' },
        { status: 400 }
      );
    }

    const followUp = await generateDynamicExaminerFollowUp({
      part,
      topic,
      currentQuestion,
      candidateTranscript: candidateTranscript || '',
      askedQuestions,
      customApiKey,
    });

    return NextResponse.json({ success: true, ...followUp });
  } catch (error: any) {
    console.error('[API Examiner Follow-up] Error:', error);
    return NextResponse.json(
      {
        success: false,
        isFollowUpRecommended: false,
        nextQuestion: '',
        error: error?.message || 'Failed to generate examiner follow-up',
      },
      { status: 500 }
    );
  }
}
