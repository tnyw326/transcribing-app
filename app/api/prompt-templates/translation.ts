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
  return `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Provide ONLY the translation without any introductory text or explanations:

"""
${text}
"""

Translate directly to ${targetLanguage}. Do not add any introductory sentences like "Here's the translation" or similar phrases.`;
} 