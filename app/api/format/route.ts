import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple in-memory cache for formatting
const formattingCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Generate cache key for formatting
const generateFormattingCacheKey = (text: string, language: string, type: string): string => {
  const textHash = crypto.createHash('md5').update(text).digest('hex');
  return `formatting:${textHash}:${language}:${type}`;
};

// Check if cache entry is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

// Cache management
const getFromCache = (cache: Map<string, { data: string; timestamp: number }>, key: string): string | null => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`🎯 Formatting Cache HIT for key: ${key}`);
    return cached.data;
  }
  if (cached) {
    console.log(`⏰ Formatting Cache EXPIRED for key: ${key}`);
    cache.delete(key);
  }
  console.log(`❌ Formatting Cache MISS for key: ${key}`);
  return null;
};

const setCache = (cache: Map<string, { data: string; timestamp: number }>, key: string, data: string): void => {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached formatting for key: ${key}`);
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // Check if request was aborted
  if (request.signal?.aborted) {
    console.log('🚫 Format request was aborted by client');
    return new NextResponse('Request aborted', { status: 499 });
  }
  
  try {
    const { text, language, type = 'transcription' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`📝 Formatting text (${text.length} characters) in ${language || 'en'}`);

    // Check cache first
    const cacheKey = generateFormattingCacheKey(text, language || 'en', type);
    const cachedResult = getFromCache(formattingCache, cacheKey);
    if (cachedResult) {
      console.log('🚀 Using cached formatting result');
      return NextResponse.json({ 
        formattedText: cachedResult,
        originalText: text,
        language: language || 'en',
        type: type,
        cached: true
      });
    }

    console.log('🔄 Formatting text with GPT-4o...');
    
    // Check if request was aborted before GPT call
    if (request.signal?.aborted) {
      console.log('🚫 Format request aborted before GPT call');
      return new NextResponse('Request aborted', { status: 499 });
    }
    
    // Use the transcription formatting prompt for now
    // Can be extended to support different formatting types in the future
    const formattingPrompt = createTranscriptionFormattingPrompt({
      text,
      language: language || 'en'
    });

    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: formattingPrompt }],
      }),
      new Promise<never>((_, reject) => {
        if (request.signal) {
          request.signal.addEventListener('abort', () => {
            reject(new Error('Request aborted'));
          });
        }
      })
    ]);

    const formattedText = response.choices[0].message.content || text;
    
    // Cache the result
    setCache(formattingCache, cacheKey, formattedText);
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Formatting processing time: ${processingTime}ms`);

    return NextResponse.json({ 
      formattedText,
      originalText: text,
      language: language || 'en',
      type: type,
      cached: false
    });

  } catch (error: any) {
    if (error.message === 'Request aborted') {
      console.log('🚫 Format request was aborted by client');
      return new NextResponse('Request aborted', { status: 499 });
    }
    
    console.error('Error formatting text:', error);
    return NextResponse.json({ error: 'Failed to format text' }, { status: 500 });
  }
} 