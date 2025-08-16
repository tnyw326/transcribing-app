import { chunkText, mapReduceSummaries } from '../utils/chunker';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function summarizeChunks(raw: string, send?: (ev: string, data: any) => void) {
  const chunks = chunkText(raw, 3500);
  const partials: string[] = [];
  let done = 0;

  await Promise.all(chunks.map(async (c, i) => {
    const out = await openai.chat.completions.create({ 
      model: "gpt-4o-mini",
      messages: [{ 
        role: "user", 
        content: `Summarize this text chunk in 2-3 sentences:\n\n${c}` 
      }],
    });
    partials[i] = out.choices[0].message?.content ?? '';
    done++;
    send?.('progress', { stage: 'chunk-summary', done, total: chunks.length });
  }));

  // reduce with proper markdown formatting
  const final = (await openai.chat.completions.create({ 
    model: "gpt-4o",
    messages: [{ 
      role: "user", 
      content: `Create a comprehensive summary from these partial summaries using proper markdown formatting:

## Markdown Formatting Requirements:
- Use **## headers** for major sections
- Use **### subheaders** for subsections  
- Use **bold text** for emphasis on key terms and important concepts
- Use *italic text* for foreign words or technical terms
- Use bullet points (• or -) for lists
- Use numbered lists for step-by-step processes
- Use > blockquotes for important quotes or highlights
- Use \`code\` formatting for technical terms, names, or specific data

Partial summaries:
${partials.join('\n\n')}

Provide ONLY the final summary with proper markdown formatting.` 
    }],
  })).choices[0].message?.content ?? '';
  
  return { partials, final };
}

// Keep default route if you still need it separately:
export async function POST() {
  return new Response('Deprecated; use /api/process', { status: 410 });
} 