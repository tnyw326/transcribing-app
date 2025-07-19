import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createTranscriptionFormattingPrompt } from '../prompt-templates/transcription';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { text, language, type = 'transcription' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use the transcription formatting prompt for now
    // Can be extended to support different formatting types in the future
    const formattingPrompt = createTranscriptionFormattingPrompt({
      text,
      language: language || 'en'
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: formattingPrompt }],
    });

    const formattedText = response.choices[0].message.content || text;

    return NextResponse.json({ 
      formattedText,
      originalText: text,
      language: language || 'en',
      type: type
    });

  } catch (error) {
    console.error('Error formatting text:', error);
    return NextResponse.json({ error: 'Failed to format text' }, { status: 500 });
  }
} 