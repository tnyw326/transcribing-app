// Text chunking and map-reduce utilities
export function chunkText(text: string, maxChunkSize: number = 3500): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by sentences to avoid breaking mid-sentence
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function mapReduceSummaries(
  chunks: string[],
  openai: any,
  send?: (ev: string, data: any) => void
): Promise<{ partials: string[]; final: string }> {
  const partials: string[] = [];
  let done = 0;

  // Map: Process each chunk in parallel
  await Promise.all(chunks.map(async (chunk, i) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ 
        role: "user", 
        content: `Summarize this text chunk in 2-3 sentences:\n\n${chunk}` 
      }],
    });
    
    partials[i] = response.choices[0].message?.content ?? '';
    done++;
    send?.('progress', { stage: 'chunk-summary', done, total: chunks.length });
  }));

  // Reduce: Combine all summaries into final summary
  const combinedSummaries = partials.join('\n\n');
  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ 
      role: "user", 
      content: `Create a comprehensive summary from these partial summaries:\n\n${combinedSummaries}` 
    }],
  });
  
  const final = finalResponse.choices[0].message?.content ?? '';
  
  return { partials, final };
} 