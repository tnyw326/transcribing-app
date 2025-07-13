import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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"
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputLanguage = formData.get('inputLanguage') as string;
    const outputLanguage = formData.get('outputLanguage') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a file object for OpenAI
    const openaiFile = new File([buffer], file.name, { type: file.type });

    // 1. Transcribe audio with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: "gpt-4o-transcribe",
      language: inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en',
      response_format: "text",
    });

    // 2. If translation is needed, translate the transcription to the output language
    let translatedTranscription = transcription;
    if (outputLanguage !== inputLanguage) {
      const trasnlationPrompt = `Translate the following text from ${inputLanguage} to ${outputLanguage}: ${transcription}`;
      const translationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: trasnlationPrompt }],
      });
      translatedTranscription = translationResponse.choices[0].message.content || '';
    }

    return NextResponse.json({ 
      transcription: translatedTranscription,
      language: inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en'
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' }, 
      { status: 500 }
    );
  }
} 