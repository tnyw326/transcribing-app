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

  const chineseSpecificGuidelines = targetLanguage === 'zh' ? `
## Chinese-Specific Formatting Guidelines:
- Use **粗体** (bold) for emphasis on key terms, names, and important concepts
- Use *斜体* (italic) for foreign words, technical terms, or book/movie titles
- Use bullet points (• 或 -) for lists mentioned in the content
- Use numbered lists (1. 2. 3.) for step-by-step processes
- Use > 引用格式 for direct quotes, important statements, or call-to-actions
- Use \`代码格式\` for technical terms, names, numbers, or specific data
- Add speaker labels if multiple speakers are detected (e.g., "**说话者1:**", "**说话者2:**")
- Use proper Chinese punctuation (，。！？；：""''（）【】)
- Maintain natural Chinese paragraph flow and rhythm
- Use appropriate spacing between Chinese characters and punctuation
- For technical terms, prefer Chinese equivalents when available, or use English terms with Chinese explanation` : '';

  return `You are a professional translator and transcription editor specializing in ${targetLanguageName} text formatting. Translate the following text from ${sourceLanguage} to ${targetLanguage} and format it properly using **markdown formatting**.

Original text:
"""
${text}
"""

## Translation and Formatting Requirements:
- **Accurate translation** - translate all content faithfully to ${targetLanguageName}
- **Preserve markdown formatting** - maintain any existing headers, bold, italic, lists, etc.
- **Add proper paragraph breaks** where natural speech pauses occur
- **Use ### headers** for major topic changes or speaker transitions
- **Use **bold text** for emphasis on key terms, names, or important concepts**
- **Use *italic text* for foreign words, technical terms, or book/movie titles**
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

## Language-Specific Considerations:
- Write in ${targetLanguageName}
- Maintain the target language's writing conventions and style
- Use appropriate punctuation and formatting for ${targetLanguageName}
${chineseSpecificGuidelines}

## Output Format:
- Start directly with the translated and formatted content
- Use proper markdown syntax
- Ensure clean, readable formatting
- Maintain professional appearance

Provide ONLY the translated and formatted content without any introductory text. Start directly with the formatted content using proper markdown formatting.`;
} 