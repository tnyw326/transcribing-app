import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createSummaryPrompt } from '../prompt-templates/summary';
import { createTranslationPrompt } from '../prompt-templates/translation';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId = '';
  let file: File | null = null;
  let inputLanguage = '';
  let outputLanguage = '';
  let resultMode = '';
  let resultLang = '';

  try {
    const formData = await request.formData();
    file = formData.get('file') as File;
    inputLanguage = formData.get('inputLanguage') as string;
    outputLanguage = formData.get('outputLanguage') as string;
    resultMode = formData.get('resultMode') as string;
    resultLang = formData.get('resultLang') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const supportedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/aac',
      'audio/ogg',
      'audio/webm',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo'
    ];

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}. Supported types: ${supportedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Check file size (OpenAI has a 25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 25MB.` 
      }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a file object for OpenAI with proper MIME type
    const openaiFile = new File([buffer], file.name, { 
      type: file.type 
    });

    console.log('Sending file to OpenAI for transcription...');

    // 1. Transcribe audio with OpenAI Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: "whisper-1", // Use whisper-1 instead of gpt-4o-transcribe for better compatibility
      language: inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en',
      response_format: "text",
    });

    const transcription = transcriptionResponse;
    console.log('Transcription completed successfully');

    // 2. Translate to all three languages
    console.log('Translating to all languages...');
    const languages = ['en', 'zh', 'ja'];
    const translations: { [key: string]: string } = {};
    const translationResponses: { [key: string]: any } = {};

    for (const lang of languages) {
      if (lang !== inputLanguage) {
        console.log(`Translating from ${inputLanguage} to ${lang}...`);
        const translationPrompt = createTranslationPrompt({
          text: transcription,
          sourceLanguage: inputLanguage,
          targetLanguage: lang
        });
        const translationResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: translationPrompt }],
        });
        translations[lang] = translationResponse.choices[0].message.content || '';
        translationResponses[lang] = translationResponse;
        console.log(`Translation to ${lang} completed`);
      } else {
        translations[lang] = transcription;
      }
    }

    // 3. Create summaries in all three languages
    console.log('Generating summaries in all languages...');
    const summaries: { [key: string]: string } = {};
    const summaryResponses: { [key: string]: any } = {};

    for (const lang of languages) {
      console.log(`Generating summary in ${lang}...`);
      const summaryPrompt = createSummaryPrompt({
        transcript: translations[lang],
        resultMode,
        resultLang: lang,
        videoTitle: file.name
      });

      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: summaryPrompt }],
      });
      summaries[lang] = summaryResponse.choices[0].message.content || '';
      summaryResponses[lang] = summaryResponse;
      console.log(`Summary in ${lang} completed`);
    }

    // 4. Log the entire process
    const processingTime = Date.now() - startTime;
    requestId = await logger.logTranscription({
      fileName: file.name,
      fileSize: file.size,
      inputLanguage,
      outputLanguage,
      resultMode,
      resultLang,
      transcription: {
        original: transcription,
        english: translations.en,
        chinese: translations.zh,
        japanese: translations.ja
      },
      summary: {
        english: summaries.en,
        chinese: summaries.zh,
        japanese: summaries.ja
      },
      apiResponses: {
        whisper: transcriptionResponse,
        translation: translationResponses,
        summary: summaryResponses
      },
      processingTime,
      status: 'success'
    });

    return NextResponse.json({ 
      original: translations[outputLanguage],
      summary: summaries[outputLanguage],
      translations: {
        en: translations.en,
        zh: translations.zh,
        ja: translations.ja
      },
      summaries: {
        en: summaries.en,
        zh: summaries.zh,
        ja: summaries.ja
      },
      language: inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en',
      requestId
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    
    // Log the error
    if (requestId) {
      await logger.logError(requestId, error, {
        fileName: file?.name,
        inputLanguage,
        outputLanguage,
        resultMode,
        resultLang
      });
    }
    
    // Provide more specific error messages
    if (error.code === 'invalid_value' && error.param === 'file') {
      return NextResponse.json(
        { error: 'Audio file might be corrupted or unsupported. Please try a different file format.' }, 
        { status: 400 }
      );
    }
    
    if (error.status === 413) {
      return NextResponse.json(
        { error: 'File too large. Please use a smaller file (max 25MB).' }, 
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: `Transcription failed: ${error.message || 'Unknown error'}` }, 
      { status: 500 }
    );
  }
} 

/*
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    console.error("❌ Missing API key");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const response = await fetch('https://api.deepgram.com/v1/listen?punctuate=true', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${deepgramApiKey!}`,
      'Content-Type': file.type,
    },
    body: buffer,
  });

  const result = await response.json();
  const transcript = result.results.channels[0].alternatives[0].transcript;

  return NextResponse.json({ text: transcript });
}
*/
