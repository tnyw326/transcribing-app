import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createTranslationPrompt } from '../prompt-templates/translation';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET(req: NextRequest) {
  // Check if request was aborted
  if (req.signal?.aborted) {
    console.log('🚫 YouTube captions request was aborted by client');
    return new NextResponse('Request aborted', { status: 499 });
  }
  
  try {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const text = searchParams.get('text');
  const lang = searchParams.get('lang');
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set('url', url!);
  params.set('text', text ?? 'false');
  params.set('lang', lang ?? 'en');

  const res = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?${params}`,
    { headers: { 'x-api-key': process.env.SUPADATA_API_KEY! } }
  );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube transcript' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Check if request was aborted
  if (req.signal?.aborted) {
    console.log('🚫 YouTube captions POST request was aborted by client');
    return new NextResponse('Request aborted', { status: 499 });
  }
  
  try {
    const formData = await req.formData();
    const url = formData.get('url') as string;
    const inputLanguage = formData.get('inputLanguage') as string;
    const outputLanguage = formData.get('outputLanguage') as string;
    const operation = formData.get('operation') as string;
    const transcriptionText = formData.get('transcriptionText') as string;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (operation === 'summarize') {
      if (!transcriptionText) {
        return NextResponse.json({ error: 'Transcription text is required for summarization' }, { status: 400 });
      }

      // Use the new summary API for YouTube content
      const summaryFormData = new FormData();
      summaryFormData.append('file', new File([], 'youtube-video')); // Dummy file for YouTube
      summaryFormData.append('inputLanguage', inputLanguage);
      summaryFormData.append('outputLanguage', outputLanguage);
      summaryFormData.append('resultMode', 'summary');
      summaryFormData.append('resultLang', outputLanguage);
      summaryFormData.append('transcriptionText', transcriptionText);

      const summaryResponse = await fetch(`${req.nextUrl.origin}/api/summary`, {
        method: 'POST',
        body: summaryFormData,
      });

      if (!summaryResponse.ok) {
        throw new Error('Summary generation failed');
      }

      const summaryData = await summaryResponse.json();
      return NextResponse.json(summaryData);
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Error processing YouTube summary:', error);
    return NextResponse.json({ error: 'Failed to process YouTube summary' }, { status: 500 });
  }
}