import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function transcribeAudio(
  audioBuffer: Buffer | ArrayBuffer | SharedArrayBuffer,
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
  
  // Convert Buffer to ArrayBuffer if needed
  let bufferData: any;
  if (audioBuffer instanceof Buffer) {
    // Convert Buffer to ArrayBuffer
    const arrayBuffer = audioBuffer.buffer;
    if (arrayBuffer instanceof SharedArrayBuffer) {
      // Convert SharedArrayBuffer to ArrayBuffer
      bufferData = arrayBuffer.slice(0);
    } else {
      bufferData = arrayBuffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength);
    }
  } else if (audioBuffer instanceof SharedArrayBuffer) {
    // Convert SharedArrayBuffer to ArrayBuffer
    bufferData = audioBuffer.slice(0);
  } else {
    bufferData = audioBuffer;
  }
  const file = new File([bufferData], fileName, { type: mime });
  
  const res = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: language && language !== 'auto' ? getWhisperLanguage(language) : undefined,
    response_format: 'text',
  });
  send?.('partialTranscript', { text: res.slice(0, 1500) });
  return res;
}

// Keep default route if you still need it separately:
export async function POST() {
  return new Response('Deprecated; use /api/process', { status: 410 });
}
