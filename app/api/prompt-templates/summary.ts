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
  const language = resultLang === 'en' ? 'English' : 
                   resultLang === 'ja' ? 'Japanese' : 
                   resultLang === 'zh' ? 'Chinese' : 
                   'the same language as the transcript';

  return `You are a helpful assistant that summarizes YouTube videos based on their transcript.

Here is the transcript of the video:
"""
${transcript}
"""

Please provide a summary of the video that:
- Captures the main points and structure
- Omits filler or unrelated content
- Uses the most appropriate format (paragraph, bullet points, or numbered steps) based on the content
- Has an appropriate length that effectively conveys the key information
- Is written in ${language}
- Is appropriate for an audience that wants a quick overview
- Does NOT include any introductory text or explanations

The video title is: "${videoTitle}".

Provide ONLY the summary content without any introductory sentences like "Here's a summary" or similar phrases. Start directly with the summary content.`;
} 