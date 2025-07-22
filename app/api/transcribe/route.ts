import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createTranslationPrompt } from '../prompt-templates/translation';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple in-memory cache (in production, use Redis or similar)
const transcriptionCache = new Map<string, { data: any; timestamp: number }>();
const formattingCache = new Map<string, { data: string; timestamp: number }>();
const translationCache = new Map<string, { data: string; timestamp: number }>();

// Constants
const SUPPORTED_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper functions
const getWhisperLanguage = (inputLanguage: string): string => {
  return inputLanguage === 'zh' ? 'zh' : inputLanguage === 'ja' ? 'ja' : 'en';
};

// Generate cache key for transcription
const generateTranscriptionCacheKey = (file: File, inputLanguage: string): string => {
  const fileHash = crypto.createHash('md5').update(`${file.name}-${file.size}-${file.lastModified}`).digest('hex');
  return `transcription:${fileHash}:${inputLanguage}`;
};

// Generate cache key for formatting
const generateFormattingCacheKey = (text: string, language: string): string => {
  const textHash = crypto.createHash('md5').update(text).digest('hex');
  return `formatting:${textHash}:${language}`;
};

// Generate cache key for translation
const generateTranslationCacheKey = (text: string, sourceLanguage: string, targetLanguage: string): string => {
  const textHash = crypto.createHash('md5').update(text).digest('hex');
  return `translation:${textHash}:${sourceLanguage}:${targetLanguage}`;
};

// Check if cache entry is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

// Cache management
const getFromCache = <T>(cache: Map<string, { data: T; timestamp: number }>, key: string): T | null => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`🎯 Cache HIT for key: ${key}`);
    return cached.data;
  }
  if (cached) {
    console.log(`⏰ Cache EXPIRED for key: ${key}`);
    cache.delete(key);
  }
  console.log(`❌ Cache MISS for key: ${key}`);
  return null;
};

const setCache = <T>(cache: Map<string, { data: T; timestamp: number }>, key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached data for key: ${key}`);
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

const formatTranscription = async (text: string, language: string, signal?: AbortSignal) => {
  try {
    // Check cache first
    const cacheKey = generateFormattingCacheKey(text, language);
    const cachedResult = getFromCache(formattingCache, cacheKey);
    if (cachedResult) {
      console.log('🚀 Using cached formatting result');
      return cachedResult;
    }

    console.log('🔄 Formatting transcription with GPT-4o...');
    
    // Check if request was aborted before GPT call
    if (signal?.aborted) {
      console.log('🚫 Formatting request aborted before GPT call');
      throw new Error('Request aborted');
    }
    
    const formattingPrompt = createTranscriptionFormattingPrompt({
      text,
      language
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: formattingPrompt }],
    });

    const formattedText = response.choices[0].message.content || text;
    
    // Cache the result
    setCache(formattingCache, cacheKey, formattedText);
    
    return formattedText;
  } catch (error) {
    console.error('Error formatting transcription:', error);
    return text;
  }
};

const translateText = async (text: string, sourceLanguage: string, targetLanguage: string, signal?: AbortSignal) => {
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  // Check cache first
  const cacheKey = generateTranslationCacheKey(text, sourceLanguage, targetLanguage);
  const cachedResult = getFromCache(translationCache, cacheKey);
  if (cachedResult) {
    console.log('🚀 Using cached translation result');
    return cachedResult;
  }

  console.log(`🔄 Translating from ${sourceLanguage} to ${targetLanguage}...`);
  
  // Check if request was aborted before GPT call
  if (signal?.aborted) {
    console.log('🚫 Translation request aborted before GPT call');
    throw new Error('Request aborted');
  }
  
  const translationPrompt = createTranslationPrompt({
    text,
    sourceLanguage,
    targetLanguage
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: translationPrompt }],
  });

  const translatedText = response.choices[0].message.content || text;
  
  // Cache the result
  setCache(translationCache, cacheKey, translatedText);
  
  return translatedText;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId = '';
  let file: File | null = null;
  let inputLanguage = '';
  let outputLanguage = '';
  let resultMode = '';
  let resultLang = '';

  // Check if request was aborted
  if (request.signal?.aborted) {
    console.log('🚫 Request was aborted by client');
    return new NextResponse('Request aborted', { status: 499 }); // 499 is "Client Closed Request"
  }

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

    console.log(`📁 Processing file: ${file!.name}, type: ${file!.type}, size: ${(file!.size / 1024 / 1024).toFixed(2)}MB`);

    // Check transcription cache first
    const transcriptionCacheKey = generateTranscriptionCacheKey(file!, inputLanguage);
    const cachedTranscription = getFromCache(transcriptionCache, transcriptionCacheKey);
    
    let rawTranscription = '';
    let formattedTranscription = '';
    let translations: { [key: string]: string } = {};
    let unformattedTranslations: { [key: string]: string } = {};
    let apiResponses: any = {};

    if (cachedTranscription) {
      console.log('🚀 Using cached transcription result');
      rawTranscription = cachedTranscription.rawTranscription;
      formattedTranscription = cachedTranscription.formattedTranscription;
      translations = cachedTranscription.translations;
      unformattedTranslations = cachedTranscription.unformattedTranslations;
      apiResponses = cachedTranscription.apiResponses;
    } else {
      console.log('🔄 Starting new transcription process...');
      
      // Prepare file for OpenAI
      const bytes = await file!.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const openaiFile = new File([buffer], file!.name, { type: file!.type });

      console.log('🎤 Sending file to OpenAI Whisper for transcription...');
      
      // Check if request was aborted before Whisper call
      if (request.signal?.aborted) {
        console.log('🚫 Request aborted before Whisper transcription');
        return new NextResponse('Request aborted', { status: 499 });
      }
      
      // Step 1: Transcribe audio
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: openaiFile,
        model: "whisper-1",
        language: getWhisperLanguage(inputLanguage),
        response_format: "text",
      });

      rawTranscription = transcriptionResponse;
      console.log('✅ Whisper transcription completed successfully');

      // Check if request was aborted before formatting
      if (request.signal?.aborted) {
        console.log('🚫 Request aborted before formatting');
        return new NextResponse('Request aborted', { status: 499 });
      }

      // Step 2: Format the original transcription
      formattedTranscription = await formatTranscription(rawTranscription, inputLanguage, request.signal);

      // Translate if needed
      if (outputLanguage !== inputLanguage) {
        // Check if request was aborted before translation
        if (request.signal?.aborted) {
          console.log('🚫 Request aborted before translation');
          return new NextResponse('Request aborted', { status: 499 });
        }
        
        console.log(`🌐 Translating formatted text to ${outputLanguage}...`);
        translations[outputLanguage] = await translateText(formattedTranscription, inputLanguage, outputLanguage, request.signal);
        
        console.log(`🌐 Translating unformatted text to ${outputLanguage}...`);
        unformattedTranslations[outputLanguage] = await translateText(rawTranscription, inputLanguage, outputLanguage, request.signal);
        
        apiResponses.translation = { [outputLanguage]: 'translated' };
        console.log(`✅ Translation to ${outputLanguage} completed`);
      } else {
        translations[outputLanguage] = formattedTranscription;
        unformattedTranslations[outputLanguage] = rawTranscription;
      }

      apiResponses.whisper = transcriptionResponse;
      apiResponses.summary = {};

      // Cache the complete transcription result
      const transcriptionResult = {
        rawTranscription,
        formattedTranscription,
        translations,
        unformattedTranslations,
        apiResponses
      };
      setCache(transcriptionCache, transcriptionCacheKey, transcriptionResult);
    }

    // Log and return transcription results
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Total processing time: ${processingTime}ms`);
    
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
      requestId,
      cached: !!cachedTranscription
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
