import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createSummaryPrompt } from '../prompt-templates/summary';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper functions
const createLogSummaryData = (
  fileName: string,
  fileSize: number,
  inputLanguage: string,
  outputLanguage: string,
  resultMode: string,
  resultLang: string,
  transcription: string,
  summaries: { [key: string]: string },
  apiResponses: any,
  processingTime: number,
  status: 'success' | 'error'
) => ({
  fileName,
  fileSize,
  inputLanguage,
  outputLanguage,
  resultMode,
  resultLang,
  transcription: {
    original: transcription,
    english: '',
    chinese: '',
    japanese: ''
  },
  summary: {
    english: outputLanguage === 'en' ? summaries[outputLanguage] || '' : '',
    chinese: outputLanguage === 'zh' ? summaries[outputLanguage] || '' : '',
    japanese: outputLanguage === 'ja' ? summaries[outputLanguage] || '' : ''
  },
  apiResponses,
  processingTime,
  status
});

const generateSummary = async (transcript: string, resultMode: string, resultLang: string, videoTitle: string) => {
  const summaryPrompt = createSummaryPrompt({
    transcript,
    resultMode,
    resultLang,
    videoTitle
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: summaryPrompt }],
  });

  return response.choices[0].message.content || '';
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let requestId = '';
  let file: File | null = null;
  let inputLanguage = '';
  let outputLanguage = '';
  let resultMode = '';
  let resultLang = '';
  let transcription = '';
  let summaries: { [key: string]: string } = {};
  let apiResponses: any = {};

  try {
    // Parse form data
    const formData = await request.formData();
    file = formData.get('file') as File;
    inputLanguage = formData.get('inputLanguage') as string;
    outputLanguage = formData.get('outputLanguage') as string;
    resultMode = formData.get('resultMode') as string;
    resultLang = formData.get('resultLang') as string;
    transcription = formData.get('transcriptionText') as string;

    // Validate required fields
    if (!transcription) {
      return NextResponse.json({ error: 'Transcription text is required for summarization' }, { status: 400 });
    }

    if (!outputLanguage) {
      return NextResponse.json({ error: 'Output language is required' }, { status: 400 });
    }

    console.log(`Generating summary for file: ${file?.name || 'YouTube video'}, output language: ${outputLanguage}`);

    // Generate summary
    console.log(`Generating summary in ${outputLanguage}...`);
    summaries[outputLanguage] = await generateSummary(transcription, resultMode, outputLanguage, file?.name || 'YouTube Video');
    console.log(`Summary in ${outputLanguage} completed`);

    apiResponses.whisper = null;
    apiResponses.translation = {};
    apiResponses.summary = { [outputLanguage]: 'generated' };

    // Log and return summary results
    const processingTime = Date.now() - startTime;
    requestId = await logger.logTranscription(
      createLogSummaryData(
        file?.name || 'YouTube Video', 
        file?.size || 0, 
        inputLanguage, 
        outputLanguage, 
        resultMode, 
        resultLang,
        transcription, 
        summaries, 
        apiResponses, 
        processingTime, 
        'success'
      )
    );

    return NextResponse.json({ 
      summary: summaries[outputLanguage],
      summaries: { [outputLanguage]: summaries[outputLanguage] },
      language: outputLanguage,
      requestId
    });

  } catch (error: any) {
    console.error('Summary generation error:', error);
    
    // Log the error
    if (requestId) {
      await logger.logError(requestId, error, {
        fileName: file?.name,
        inputLanguage,
        outputLanguage,
        resultMode,
        resultLang,
        operation: 'summarize'
      });
    }

    return NextResponse.json(
      { error: `Summary generation failed: ${error.message || 'Unknown error'}` }, 
      { status: 500 }
    );
  }
} 