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

  return `You are a helpful assistant that summarizes videos based on their transcript.

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

## Video Information:
- Title: "${videoTitle}"

Provide ONLY the summary content in ${language} with proper markdown formatting. Start directly with the summary.`;
} 