import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createTranslationPrompt } from '../prompt-templates/translation';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Constants
const SUPPORTED_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Helper functions
const getWhisperLanguage = (inputLanguage: string): string => {
  return inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en';
};

const createLogTranscriptionData = (
  fileName: string,
  fileSize: number,
  inputLanguage: string,
  outputLanguage: string,
  resultMode: string,
  resultLang: string,
  transcription: string,
  translations: { [key: string]: string },
  apiResponses: any,
  processingTime: number,
  status: 'success' | 'error'
) => ({
  fileName,
  fileSize,
  inputLanguage,
  outputLanguage,
  resultMode,
  resultLang,
  transcription: {
    original: transcription,
    english: outputLanguage === 'en' ? translations[outputLanguage] || transcription : '',
    chinese: outputLanguage === 'zh' ? translations[outputLanguage] || transcription : '',
    japanese: outputLanguage === 'ja' ? translations[outputLanguage] || transcription : ''
  },
  summary: {
    english: '',
    chinese: '',
    japanese: ''
  },
  apiResponses,
  processingTime,
  status
});

const validateRequest = (file: File | null): NextResponse | null => {
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return NextResponse.json({ 
      error: `Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_TYPES.join(', ')}` 
    }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ 
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 25MB.` 
    }, { status: 400 });
  }

  return null;
};

const formatTranscription = async (text: string, language: string) => {
  try {
    // Use the formatting prompt directly instead of making an HTTP request
    const formattingPrompt = createTranscriptionFormattingPrompt({
      text,
      language
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: formattingPrompt }],
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error('Error formatting transcription:', error);
    return text;
  }
};

const translateText = async (text: string, sourceLanguage: string, targetLanguage: string) => {
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  const translationPrompt = createTranslationPrompt({
    text,
    sourceLanguage,
    targetLanguage
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: translationPrompt }],
  });

  return response.choices[0].message.content || text;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId = '';
  let file: File | null = null;
  let inputLanguage = '';
  let outputLanguage = '';
  let resultMode = '';
  let resultLang = '';

  try {
    // Parse form data
    const formData = await request.formData();
    file = formData.get('file') as File;
    inputLanguage = formData.get('inputLanguage') as string;
    outputLanguage = formData.get('outputLanguage') as string;
    resultMode = formData.get('resultMode') as string;
    resultLang = formData.get('resultLang') as string;

    // Validate request
    const validationError = validateRequest(file);
    if (validationError) return validationError;

    console.log(`Processing file: ${file!.name}, type: ${file!.type}, size: ${(file!.size / 1024 / 1024).toFixed(2)}MB`);

    // Prepare file for OpenAI
    const bytes = await file!.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const openaiFile = new File([buffer], file!.name, { type: file!.type });

    let rawTranscription = '';
    let formattedTranscription = '';
    let translations: { [key: string]: string } = {};
    let unformattedTranslations: { [key: string]: string } = {};
    let apiResponses: any = {};

    console.log('Sending file to OpenAI for transcription...');

    // Step 1: Transcribe audio
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: "whisper-1",
      language: getWhisperLanguage(inputLanguage),
      response_format: "text",
    });

    rawTranscription = transcriptionResponse;
    console.log('Transcription completed successfully');

    // Step 2: Format the original transcription
    console.log('Formatting transcription...');
    formattedTranscription = await formatTranscription(rawTranscription, inputLanguage);
    console.log('Transcription formatting completed');

    // Translate if needed
    if (outputLanguage !== inputLanguage) {
      console.log(`Translating formatted text to ${outputLanguage}...`);
      translations[outputLanguage] = await translateText(formattedTranscription, inputLanguage, outputLanguage);
      
      console.log(`Translating unformatted text to ${outputLanguage}...`);
      unformattedTranslations[outputLanguage] = await translateText(rawTranscription, inputLanguage, outputLanguage);
      
      apiResponses.translation = { [outputLanguage]: 'translated' };
      console.log(`Translation to ${outputLanguage} completed`);
    } else {
      translations[outputLanguage] = formattedTranscription;
      unformattedTranslations[outputLanguage] = rawTranscription;
    }

    apiResponses.whisper = transcriptionResponse;
    apiResponses.summary = {};

    // Log and return transcription results
    const processingTime = Date.now() - startTime;
    requestId = await logger.logTranscription(
      createLogTranscriptionData(
        file!.name, file!.size, inputLanguage, outputLanguage, resultMode, resultLang,
        formattedTranscription, translations, apiResponses, processingTime, 'success'
      )
    );

    return NextResponse.json({ 
      original: translations[outputLanguage],
      formatted: translations[outputLanguage],
      unformatted: unformattedTranslations[outputLanguage],
      translations: { [outputLanguage]: translations[outputLanguage] },
      unformattedTranslations: { [outputLanguage]: unformattedTranslations[outputLanguage] },
      language: getWhisperLanguage(inputLanguage),
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
        resultLang,
        operation: 'transcribe'
      });
    }
    
    // Provide specific error messages
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
