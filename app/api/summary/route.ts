import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createSummaryPrompt } from '../prompt-templates/summary';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple in-memory cache for summaries
const summaryCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Generate cache key for summary
const generateSummaryCacheKey = (transcript: string, resultMode: string, resultLang: string, videoTitle: string): string => {
  const transcriptHash = crypto.createHash('md5').update(transcript).digest('hex');
  return `summary:${transcriptHash}:${resultMode}:${resultLang}:${videoTitle}`;
};

// Check if cache entry is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

// Cache management
const getFromCache = (cache: Map<string, { data: string; timestamp: number }>, key: string): string | null => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`🎯 Summary Cache HIT for key: ${key}`);
    return cached.data;
  }
  if (cached) {
    console.log(`⏰ Summary Cache EXPIRED for key: ${key}`);
    cache.delete(key);
  }
  console.log(`❌ Summary Cache MISS for key: ${key}`);
  return null;
};

const setCache = (cache: Map<string, { data: string; timestamp: number }>, key: string, data: string): void => {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached summary for key: ${key}`);
};

// Helper functions
const createLogSummaryData = (
  fileName: string,
  fileSize: number,
  inputLanguage: string,
  outputLanguage: string,
  resultMode: string,
  resultLang: string,
  transcription: string,
  summaries: { [key: string]: string },
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
    english: '',
    chinese: '',
    japanese: ''
  },
  summary: {
    english: outputLanguage === 'en' ? summaries[outputLanguage] || '' : '',
    chinese: outputLanguage === 'zh' ? summaries[outputLanguage] || '' : '',
    japanese: outputLanguage === 'ja' ? summaries[outputLanguage] || '' : ''
  },
  apiResponses,
  processingTime,
  status
});

const generateSummary = async (transcript: string, resultMode: string, resultLang: string, videoTitle: string, signal?: AbortSignal) => {
  // Check cache first
  const cacheKey = generateSummaryCacheKey(transcript, resultMode, resultLang, videoTitle);
  const cachedSummary = getFromCache(summaryCache, cacheKey);
  if (cachedSummary) {
    console.log('🚀 Using cached summary result');
    return cachedSummary;
  }

  console.log('🔄 Generating summary with GPT-4o...');
  
  // Check if request was aborted before GPT call
  if (signal?.aborted) {
    console.log('🚫 Summary generation request aborted before GPT call');
    throw new Error('Request aborted');
  }
  
  const summaryPrompt = createSummaryPrompt({
    transcript,
    resultMode,
    resultLang,
    videoTitle
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: summaryPrompt }],
  });

  const summary = response.choices[0].message.content || '';
  
  // Cache the result
  setCache(summaryCache, cacheKey, summary);
  
  return summary;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId = '';
  let file: File | null = null;
  let inputLanguage = '';
  let outputLanguage = '';
  let resultMode = '';
  let resultLang = '';
  let transcription = '';
  let summaries: { [key: string]: string } = {};
  let apiResponses: any = {};

  // Check if request was aborted
  if (request.signal?.aborted) {
    console.log('🚫 Summary request was aborted by client');
    return new NextResponse('Request aborted', { status: 499 });
  }

  try {
    // Parse form data
    const formData = await request.formData();
    file = formData.get('file') as File;
    inputLanguage = formData.get('inputLanguage') as string;
    outputLanguage = formData.get('outputLanguage') as string;
    resultMode = formData.get('resultMode') as string;
    resultLang = formData.get('resultLang') as string;
    transcription = formData.get('transcriptionText') as string;

    // Validate required fields
    if (!transcription) {
      return NextResponse.json({ error: 'Transcription text is required for summarization' }, { status: 400 });
    }

    if (!outputLanguage) {
      return NextResponse.json({ error: 'Output language is required' }, { status: 400 });
    }

    console.log(`📝 Generating summary for file: ${file?.name || 'YouTube video'}, output language: ${outputLanguage}`);

    // Check if request was aborted before summary generation
    if (request.signal?.aborted) {
      console.log('🚫 Summary request aborted before generation');
      return new NextResponse('Request aborted', { status: 499 });
    }

    // Generate summary
    summaries[outputLanguage] = await generateSummary(transcription, resultMode, outputLanguage, file?.name || 'YouTube Video', request.signal);
    console.log(`✅ Summary in ${outputLanguage} completed`);

    apiResponses.whisper = null;
    apiResponses.translation = {};
    apiResponses.summary = { [outputLanguage]: 'generated' };

    // Log and return summary results
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Summary processing time: ${processingTime}ms`);
    
    requestId = await logger.logTranscription(
      createLogSummaryData(
        file?.name || 'YouTube Video', 
        file?.size || 0, 
        inputLanguage, 
        outputLanguage, 
        resultMode, 
        resultLang,
        transcription, 
        summaries, 
        apiResponses, 
        processingTime, 
        'success'
      )
    );

    return NextResponse.json({ 
      summary: summaries[outputLanguage],
      summaries: { [outputLanguage]: summaries[outputLanguage] },
      language: outputLanguage,
      requestId,
      cached: false // We'll add this later when we implement full caching
    });

  } catch (error: any) {
    console.error('Summary generation error:', error);
    
    // Log the error
    if (requestId) {
      await logger.logError(requestId, error, {
        fileName: file?.name,
        inputLanguage,
        outputLanguage,
        resultMode,
        resultLang,
        operation: 'summarize'
      });
    }

    return NextResponse.json(
      { error: `Summary generation failed: ${error.message || 'Unknown error'}` }, 
      { status: 500 }
    );
  }
} 