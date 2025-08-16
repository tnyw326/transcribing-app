// app/api/process/route.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { streamSSE } from '../utils/streamingResponse';
import { transcribeAudio } from '../transcribe/route';
import { summarizeChunks } from '../summary/route';
import { formatTranscript } from '../format/route';
import { translateMd } from '../translation/route';
import { kvGet, kvSet } from '../utils/cacheManager';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const inputLanguage = (form.get('inputLanguage') as string) || 'auto';
  const outputLanguage = (form.get('outputLanguage') as string) || 'en';
  const summaryRequested = form.get('summaryRequested') === 'true';
  const formatType = (form.get('formatType') as 'markdown' | 'raw') || 'markdown';

  if (!file) return new Response('Missing file', { status: 400 });

  // Create cache hash including all pipeline parameters
  const buf = Buffer.from(await file.arrayBuffer());
  const cacheData = `${buf.toString('hex')}-${inputLanguage}-${outputLanguage}-${summaryRequested}-${formatType}`;
  const hash = crypto.createHash('md5').update(cacheData).digest('hex');

  return streamSSE(async send => {
    // Check cache first
    const cached = await kvGet(hash);
    if (cached) {
      send('cached', { hash });
      send('done', cached);
      return;
    }

    try {
      // Step 1: Transcribe
      send('status', { msg: 'Transcribing audio...' });
      const transcriptResult = await transcribeAudio(buf, file.type, file.name, inputLanguage, send);
      
      const transcriptText = transcriptResult;
      
      // Detect language from transcript text if input language is 'auto'
      let detectedLanguage: string;
      if (inputLanguage === 'auto') {
        // Simple language detection based on character patterns
        const chineseChars = transcriptText.match(/[\u4e00-\u9fff]/g);
        const japaneseChars = transcriptText.match(/[\u3040-\u309f\u30a0-\u30ff]/g);
        
        if (chineseChars && chineseChars.length > 0) {
          detectedLanguage = 'zh';
          console.log(`🔍 Detected Chinese language from transcript (${chineseChars.length} Chinese characters)`);
        } else if (japaneseChars && japaneseChars.length > 0) {
          detectedLanguage = 'ja';
          console.log(`🔍 Detected Japanese language from transcript (${japaneseChars.length} Japanese characters)`);
        } else {
          // Default to English if no specific characters detected
          detectedLanguage = 'en';
          console.log('🔍 No specific language characters detected, defaulting to English');
        }
      } else {
        detectedLanguage = inputLanguage;
        console.log(`🔍 Using specified input language: ${inputLanguage}`);
      }
      
      console.log(`🔍 Language detection result: inputLanguage=${inputLanguage}, detectedLanguage=${detectedLanguage}, outputLanguage=${outputLanguage}`);
      
      send('transcribe', { 
        transcriptText, 
        detectedLanguage,
        inputLanguage: inputLanguage === 'auto' ? detectedLanguage : inputLanguage 
      });

      // Step 2: Maybe Translate (condition: detected_language != output_language)
      let rawText: string;
      let translation: string | null = null;
      
      if (detectedLanguage !== outputLanguage) {
        console.log(`🌐 Translation needed: ${detectedLanguage} -> ${outputLanguage}`);
        send('status', { msg: `Translating from ${detectedLanguage} to ${outputLanguage}...` });
        translation = await translateMd(transcriptText, outputLanguage, detectedLanguage);
        rawText = translation;
      } else {
        console.log(`🌐 No translation needed: detectedLanguage (${detectedLanguage}) == outputLanguage (${outputLanguage})`);
        // No translation needed
        rawText = transcriptText;
      }

      send('translate', { rawText, translation });

      // Step 3: Always generate both raw text and markdown
      send('status', { msg: 'Formatting transcript...' });
      
      // Always generate raw text with proper paragraphing
      const rawTextFormatted = await formatTranscript(rawText, outputLanguage, 'raw');
      
      // Always generate markdown format
      const markdownText = await formatTranscript(rawText, outputLanguage, 'markdown');
      
      send('format', { rawText: rawTextFormatted, markdownText });

      // Step 4: Maybe Summarize (condition: summary_requested == true)
      let summaryText: string | null = null;
      
      if (summaryRequested) {
        send('status', { msg: 'Generating summary...' });
        const summaryResult = await summarizeChunks(rawText, send);
        summaryText = summaryResult.final;
      }

      send('summarize', { summaryText });

      // Prepare final output
      const payload = {
        hash,
        // Pipeline outputs
        rawText: rawTextFormatted, // Use the formatted raw text
        markdownText,
        summaryText,
        // Additional metadata
        transcript: transcriptText,
        detectedLanguage,
        inputLanguage: inputLanguage === 'auto' ? detectedLanguage : inputLanguage,
        outputLanguage,
        translation,
        summaryRequested
      };

      // Cache the result
      await kvSet(hash, payload);
      
      send('done', payload);
      
    } catch (error) {
      console.error('Pipeline error:', error);
      send('error', { 
        message: error instanceof Error ? error.message : 'Pipeline processing failed',
        step: 'pipeline'
      });
    }
  });
} 