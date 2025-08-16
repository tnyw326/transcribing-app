import OpenAI from 'openai';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function formatTranscript(text: string, language: string = 'en') {
  const formattingPrompt = createTranscriptionFormattingPrompt({
    text,
    language
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: formattingPrompt }],
  });

  return response.choices[0].message?.content ?? text;
}

// Keep default route if you still need it separately:
export async function POST() {
  return new Response('Deprecated; use /api/process', { status: 410 });
} 