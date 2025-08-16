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
  const translateTo = (form.get('translateTo') as string) || null;
  const inputLanguage = (form.get('inputLanguage') as string) || 'en';
  const outputLanguage = (form.get('outputLanguage') as string) || 'en';

  if (!file) return new Response('Missing file', { status: 400 });

  // hash for cache (include language parameters to avoid cache conflicts)
  const buf = Buffer.from(await file.arrayBuffer());
  const cacheData = `${buf.toString('hex')}-${inputLanguage}-${outputLanguage}-${translateTo || 'none'}`;
  const hash = crypto.createHash('md5').update(cacheData).digest('hex');

  return streamSSE(async send => {
    // 0. Cache
    const cached = await kvGet(hash);
    if (cached) {
      send('cached', { hash });
      send('done', cached);
      return;
    }

    // 1. Transcribe
    send('status', { msg: 'Transcribing…' });
    const transcript = await transcribeAudio(buf, file.type, file.name, inputLanguage, send);

    // 2. Summaries (map-reduce)
    send('status', { msg: 'Summarizing…' });
    const summaryResult = await summarizeChunks(transcript, send);

    // 3. Format
    send('status', { msg: 'Formatting transcript…' });
    const formatted = await formatTranscript(transcript, outputLanguage);

    // 4. Translate (optional)
    let translation: string | null = null;
    let finalTranscript = formatted;
    if (translateTo) {
      send('status', { msg: `Translating → ${translateTo}…` });
      translation = await translateMd(formatted, translateTo);
      finalTranscript = translation;
    }

    const payload = {
      hash,
      transcript,
      formattedTranscript: finalTranscript,
      summary: summaryResult.final,
      summaryPartials: summaryResult.partials,
      translateTo,
      translation,
      language: outputLanguage,
    };

    await kvSet(hash, payload);
    send('done', payload);
  });
} 