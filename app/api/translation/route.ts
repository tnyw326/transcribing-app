import OpenAI from 'openai';
import { createTranslationPrompt } from '../prompt-templates/translation';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function translateMd(text: string, targetLanguage: string, sourceLanguage: string = 'en') {
  if (sourceLanguage === targetLanguage) {
    return text;
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

  return response.choices[0].message?.content ?? text;
}

// Keep default route if you still need it separately:
export async function POST() {
  return new Response('Deprecated; use /api/process', { status: 410 });
} 