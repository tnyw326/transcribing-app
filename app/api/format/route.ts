import OpenAI from 'openai';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function formatTranscript(text: string, language: string = 'en', formatType: 'markdown' | 'raw' = 'markdown') {
  if (formatType === 'raw') {
    // For raw text, just add paragraph breaks without markdown formatting
    return addParagraphBreaks(text);
  }

  // For markdown formatting, use the existing logic
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

// Simple function to add paragraph breaks to raw text
function addParagraphBreaks(text: string): string {
  // For raw text, just add simple line breaks every few sentences
  // No markdown, no formatting, just raw text with natural breaks
  
  // Split by sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const paragraphs: string[] = [];
  let currentParagraph = '';

  for (const sentence of sentences) {
    if (currentParagraph.length + sentence.length > 150) {
      // Start a new paragraph if current one is getting long
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = sentence;
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + sentence;
    }
  }

  // Add the last paragraph
  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }

  // Join with single line breaks (no double line breaks, no markdown)
  return paragraphs.join('\n');
}

// Keep default route if you still need it separately:
export async function POST() {
  return new Response('Deprecated; use /api/process', { status: 410 });
} 