interface TranscriptionFormattingPromptParams {
  text: string;
  language: string;
}

export function createTranscriptionFormattingPrompt({
  text,
  language
}: TranscriptionFormattingPromptParams): string {
  const languageName = language === 'en' ? 'English' : 
                      language === 'ja' ? 'Japanese' : 
                      language === 'zh' ? 'Chinese' : 
                      'the same language as the transcript';

  return `You are a transcription editor. Format the following raw transcription text to improve readability by adding proper paragraph breaks.

Raw transcription:
"""
${text}
"""

## Formatting Requirements:
- **If the transcription is all capital letters, convert it to proper case**
- **Preserve all original content** - do not add, remove, or change any words
- **Add paragraph breaks** where natural speech pauses occur or when the speaker changes topics
- **Use markdown formatting** to improve readability and structure
- **Maintain the natural flow** of the original speech
- **Use double line breaks** (two newlines) to separate paragraphs

## Markdown Formatting Guidelines:
- Use **bold text** for emphasis on key terms, names, or important concepts
- Use *italic text* for foreign words, technical terms, or book/movie titles
- Use bullet points (• or -) for lists mentioned in the content
- Use numbered lists for step-by-step processes or sequences
- Use > blockquotes for direct quotes, important statements, or call-to-actions
- Use \`code\` formatting for technical terms, names, numbers, or specific data
- Add speaker labels if multiple speakers are detected (e.g., "**Speaker 1:**", "**Speaker 2:**")
- Organize content logically with clear sections where appropriate

## Guidelines for paragraph breaks:
- When the speaker pauses for more than a brief moment
- When transitioning to a new topic or subject
- When there's a natural break in the conversation flow
- When the speaker takes a breath or changes tone

## Language:
- Write in ${languageName}
- Maintain the original language's writing conventions and style
- Use appropriate punctuation for the target language

Provide ONLY the formatted transcription content with proper paragraph breaks and markdown formatting. Do not add any introductory text.`;
} 