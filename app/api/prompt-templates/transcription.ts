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
- **Keep the content simple** - no headers, bold text, italics, or other markdown formatting
- **Maintain the natural flow** of the original speech
- **Use double line breaks** (two newlines) to separate paragraphs

## Guidelines for paragraph breaks:
- When the speaker pauses for more than a brief moment
- When transitioning to a new topic or subject
- When there's a natural break in the conversation flow
- When the speaker takes a breath or changes tone

## Language:
- Write in ${languageName}
- Maintain the original language's writing conventions and style
- Use appropriate punctuation for the target language

Provide ONLY the formatted transcription content with proper paragraph breaks. Do not add any introductory text or special formatting.`;
} 