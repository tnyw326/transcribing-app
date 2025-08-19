import { getLanguageName } from '../utils/languageMap';

interface SummaryPromptParams {
  transcript: string;
  resultMode: string;
  resultLang: string;
  videoTitle: string;
}

export function createSummaryPrompt({
  transcript,
  resultMode,
  resultLang,
  videoTitle
}: SummaryPromptParams): string {
  // Determine language
  const language = getLanguageName(resultLang);

  const chineseSpecificGuidelines = resultLang === 'zh' ? `
## Chinese-Specific Formatting Guidelines:
- Use **## 主要章节** (## main sections) for major sections
- Use **### 子章节** (### subsections) for subsections
- Use **粗体** (bold) for emphasis on key terms and important concepts
- Use *斜体* (italic) for foreign words or technical terms
- Use bullet points (• 或 -) for lists
- Use numbered lists (1. 2. 3.) for step-by-step processes
- Use > 引用格式 for important quotes or highlights
- Use \`代码格式\` for technical terms, names, or specific data
- Use proper Chinese punctuation (，。！？；：""''（）【】)
- Maintain natural Chinese paragraph flow and rhythm
- For technical terms, prefer Chinese equivalents when available` : '';

  return `You are a helpful assistant that summarizes videos based on their transcript. You specialize in creating well-formatted summaries in ${language}.

Here is the transcript of the video:
"""
${transcript}
"""

Please provide a comprehensive summary of the video using **markdown formatting**. Your summary should:

## Content Requirements:
- Capture the main points and structure of the video
- Highlight key takeaways and important information
- Use appropriate length that effectively conveys the key information
- Write in ${language}
- Be appropriate for an audience that wants a quick overview
- Include a brief overview at the beginning
- Structure with main sections and subsections as needed

## Markdown Formatting Requirements:
- Use **## headers** for major sections
- Use **### subheaders** for subsections
- Use **bold text** for emphasis on key terms and important concepts
- Use *italic text* for foreign words or technical terms
- Use bullet points (• or -) for lists
- Use numbered lists for step-by-step processes
- Use > blockquotes for important quotes or highlights
- Use \`code\` formatting for technical terms, names, or specific data
${chineseSpecificGuidelines}

## Video Information:
- Title: "${videoTitle}"

## Output Format:
- Start directly with the summary content
- Use proper markdown syntax
- Ensure clean, readable formatting
- Maintain professional appearance

Provide ONLY the summary content in ${language} with proper markdown formatting. Start directly with the summary.`;
} 