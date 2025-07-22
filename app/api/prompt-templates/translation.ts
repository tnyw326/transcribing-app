import { getLanguageName } from '../utils/languageMap';

interface TranslationPromptParams {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function createTranslationPrompt({
  text,
  sourceLanguage,
  targetLanguage
}: TranslationPromptParams): string {
  const targetLanguageName = getLanguageName(targetLanguage);

  return `You are a professional translator and transcription editor. Translate the following text from ${sourceLanguage} to ${targetLanguage} and format it properly using **markdown formatting**.

Original text:
"""
${text}
"""

## Translation and Formatting Requirements:
- **Accurate translation** - translate all content faithfully to ${targetLanguageName}
- **Preserve markdown formatting** - maintain any existing headers, bold, italic, lists, etc.
- **Add proper paragraph breaks** where natural speech pauses occur
- **Use ### headers** for major topic changes or speaker transitions
- **Use **bold text** for emphasis on key terms, names, or important concepts
- **Use *italic text* for foreign words, technical terms, or book/movie titles
- **Use bullet points (• or -)** for lists mentioned in the content
- **Use numbered lists** for step-by-step processes or sequences
- **Use > blockquotes** for direct quotes, important statements, or call-to-actions
- **Use \`code\` formatting** for:
  - Technical terms
  - Names of people, places, or companies
  - Numbers, dates, or specific data
  - File names, URLs, or code snippets
- **Add speaker labels** if multiple speakers are detected (e.g., "**Speaker 1:**", "**Speaker 2:**")
- **Organize content logically** with clear sections and subsections

## Content Structure:
- Maintain the natural flow and tone of the original speech
- Preserve any technical accuracy and terminology
- Keep the language natural and conversational where appropriate
- Use appropriate terminology for the target language

## Language:
- Write in ${targetLanguageName}
- Maintain the target language's writing conventions and style
- Use appropriate punctuation and formatting for ${targetLanguageName}

Provide ONLY the translated and formatted content without any introductory text. Start directly with the formatted content using proper markdown formatting.`;
} 