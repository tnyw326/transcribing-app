import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputLanguage = formData.get('inputLanguage') as string;
    const outputLanguage = formData.get('outputLanguage') as string;
    const resultMode = formData.get('resultMode') as string;
    const resultLang = formData.get('resultLang') as string;

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

    // 3. Always summarize the transcription
    let summarizedTranscription = translatedTranscription;
    const summaryPrompt = `Summarize the following video transcription in ${resultLang} language: ${translatedTranscription}, but don't mention we used text to summarize it.
    The summary should be concise, and only include the main points of the video. It should be easy to understand and list bullet points if necessary.`;
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: summaryPrompt }],
    });
    summarizedTranscription = summaryResponse.choices[0].message.content || '';

    return NextResponse.json({ 
      original: translatedTranscription,
      summary: summarizedTranscription,
      language: inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en',
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' }, 
      { status: 500 }
    );
  }
} 