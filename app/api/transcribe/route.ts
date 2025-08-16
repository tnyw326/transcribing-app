import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function transcribeAudio(
  audioBuffer: Buffer,
  mime: string,
  filename?: string,
  language?: string,
  send?: (ev: string, data: any) => void
) {
  // Use original filename if provided, otherwise generate one with proper extension
  let fileName = filename || 'audio';
  
  // If no filename provided, try to determine extension from MIME type
  if (!filename) {
    const mimeToExt: { [key: string]: string } = {
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/wav': '.wav',
      'audio/m4a': '.m4a',
      'audio/aac': '.aac',
      'audio/ogg': '.ogg',
      'audio/webm': '.webm',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/ogg': '.ogg',
      'video/quicktime': '.mov',
      'video/x-msvideo': '.avi'
    };
    
    const ext = mimeToExt[mime] || '.mp4';
    fileName = `audio${ext}`;
  }
  
  // Map language codes to Whisper language codes
  const getWhisperLanguage = (lang: string): string => {
    return lang === 'zh' ? 'zh' : lang === 'ja' ? 'ja' : 'en';
  };
  
  console.log('🔍 Transcribe Debug:', { fileName, mime, language, filename: filename || 'none' });
  
  const file = new File([audioBuffer], fileName, { type: mime });
  const res = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: language ? getWhisperLanguage(language) : undefined,
    response_format: 'text',
  });
  send?.('partialTranscript', { text: res.slice(0, 1500) });
  return res;
}

// Keep default route if you still need it separately:
export async function POST() {
  return new Response('Deprecated; use /api/process', { status: 410 });
}
