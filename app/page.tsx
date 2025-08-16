"use client";
import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import fs from 'fs';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';


// Translation object for English, Chinese, and Japanese
  const translations = {
    en: {
      title: "Convert Video to Text",
      subtitle: "High accuracy and 200+ languages",
      transcribeVideoFile: "Transcribe a Video/Audio File",
      dropOrUpload: "Drop or upload your video here",
      fileSelected: "✓ File selected",
      upload: "Upload",
      transcribe: "Transcribe",
      transcribing: "Transcribing...",
      supportedFormats: "Supported formats: mp4, mov, avi, mkv, etc.",
      transcribeYouTube: "Transcribe a YouTube Video",
      pasteYouTubeLink: "Paste YouTube link here",
      pasteYouTubeDescription: "Paste YouTube link to transcribe.",
      pleaseSelectValidVideo: "Please select a valid video file",
      transcriptionOriginal: "Transcription Result:",
      transcriptionSubtitle: "Full transcription with markdown formatting",
      transcriptionSummary: "Summary Result:",
      transcriptionSummarySubtitle: "AI-powered content summary with key insights",
      languageSelector: "Please select the language of the input and output video.",
      importantNote: "Important Note:",
      pleaseSelectLanguage: "Please select a language that has captions available for the video.",
      ifSelectedLanguageNotAvailable: "If your selected language isn't available, the result will be in English or the first available caption language.",
      inputLanguage: "Input Language",
      outputLanguage: "Output Language",
      autoDetect: "Auto-detect",
      transcriptionAnimation: "Transcribing...",

      original: "Original",
      summary: "Summary",
      copyLabel: "Copy",
      generatedAt: "Generated at",
      generated: "Generated",
      en: "EN",
      zh: "CH",
      ja: "JA",

    },
    zh: {
      title: "视频转换为文字",
      subtitle: "高精度，支持200多种语言",
      transcribeVideoFile: "转录视频/音频文件",
      dropOrUpload: "拖拽或上传您的视频到这里",
      fileSelected: "✓ 文件已选择",
      upload: "上传",
      transcribe: "转录",
      transcribing: "转录中...",
      supportedFormats: "支持格式：mp4, mov, avi, mkv, 等",
      transcribeYouTube: "转录YouTube视频",
      pasteYouTubeLink: "粘贴YouTube链接",
      pasteYouTubeDescription: "粘贴YouTube链接以转录其音频。",
      pleaseSelectValidVideo: "请选择视频格式",
      transcriptionOriginal: "转录结果：",
      transcriptionSubtitle: "完整的转录结果，支持markdown格式",
      transcriptionSummary: "总结结果：",
      transcriptionSummarySubtitle: "AI生成的内容总结，包含关键见解",
      languageSelector: "请选择输入和输出视频的语言。",
      importantNote: "重要提示：",
      pleaseSelectLanguage: "请选择视频有字幕的语言。",
      ifSelectedLanguageNotAvailable: "如果选择的语言没有字幕，英语或第一个可用的字幕语言显示。",
      inputLanguage: "视频语言",
      outputLanguage: "输出语言",
      autoDetect: "自动检测",
      transcriptionAnimation: "转录中...",
      original: "原文",
      summary: "总结",
      copyLabel: "复制",
      generatedAt: "生成于",
      generated: "生成",
      en: "英語",
      zh: "中文",
      ja: "日语",

    },
    ja: {
      title: "動画をテキストに変換",
      subtitle: "高精度、200以上の言語に対応",
      transcribeVideoFile: "動画/音声ファイルを文字起こし",
      dropOrUpload: "ここに動画をドラッグまたはアップロード",
      fileSelected: "✓ ファイルが選択されました",
      upload: "アップロード",
      transcribe: "文字起こし",
      transcribing: "文字起こし中...",
      supportedFormats: "対応形式：mp4, mov, avi, mkv, など",
      transcribeYouTube: "YouTube動画を文字起こし",
      pasteYouTubeLink: "ここにYouTubeリンクを貼り付けてください",
      pasteYouTubeDescription: "YouTubeリンクを貼り付けて音声を文字起こしします。",
      pleaseSelectValidVideo: "有効な動画ファイルを選択してください",
      transcriptionOriginal: "文字起こし：",
      transcriptionSummary: "要約：",
      transcriptionSubtitle: "Markdown形式での完全な文字起こし結果",
      transcriptionSummarySubtitle: "AIによるコンテンツ要約、重要な洞察",
      languageSelector: "動画の入力言語と出力言語を選択してください。",
      importantNote: "重要な注意事項：",
      pleaseSelectLanguage: "動画に字幕がある言語を選択してください。",
      ifSelectedLanguageNotAvailable: "選択した言語に字幕がない場合、英語または最初の利用可能な字幕言語で表示されます。",
      inputLanguage: "入力言語",
      outputLanguage: "出力言語",
      autoDetect: "自動検出",

      transcriptionAnimation: "文字起こし中...",
      original: "原文",
      summary: "要約",
      copyLabel: "コピー",
      generatedAt: "生成日時",
      generated: "生成済み",
      en: "英語",
      zh: "中国語",
      ja: "日本語",

    }
  };

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTranscribingVideo, setIsTranscribingVideo] = useState(false);
  const [isTranscribingYouTube, setIsTranscribingYouTube] = useState(false);
  const [transcriptionOriginal, setTranscriptionOriginal] = useState<string>("");
  const [transcriptionRaw, setTranscriptionRaw] = useState<string>("");
  const [transcriptionSummary, setTranscriptionSummary] = useState<string>("");
  const [allTranslations, setAllTranslations] = useState<{[key: string]: string}>({});
  const [allUnformattedTranslations, setAllUnformattedTranslations] = useState<{[key: string]: string}>({});
  const [allSummaries, setAllSummaries] = useState<{[key: string]: string}>({});
  const [isFormatted, setIsFormatted] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  


  // Video file upload section language selectors
  const [videoInputLanguage, setVideoInputLanguage] = useState("en");
  const [videoOutputLanguage, setVideoOutputLanguage] = useState("en");
  const [isVideoInputDropdownOpen, setIsVideoInputDropdownOpen] = useState(false);
  const [isVideoOutputDropdownOpen, setIsVideoOutputDropdownOpen] = useState(false);
  const [videoInputSearchTerm, setVideoInputSearchTerm] = useState("");
  const [videoOutputSearchTerm, setVideoOutputSearchTerm] = useState("");
  const videoInputDropdownRef = useRef<HTMLDivElement>(null);
  const videoOutputDropdownRef = useRef<HTMLDivElement>(null);

  // YouTube section language selectors
  const [youtubeInputLanguage, setYoutubeInputLanguage] = useState("en");
  const [youtubeOutputLanguage, setYoutubeOutputLanguage] = useState("en");
  const [isYoutubeInputDropdownOpen, setIsYoutubeInputDropdownOpen] = useState(false);
  const [isYoutubeOutputDropdownOpen, setIsYoutubeOutputDropdownOpen] = useState(false);
  const [youtubeInputSearchTerm, setYoutubeInputSearchTerm] = useState("");
  const [youtubeOutputSearchTerm, setYoutubeOutputSearchTerm] = useState("");
  const youtubeInputDropdownRef = useRef<HTMLDivElement>(null);
  const youtubeOutputDropdownRef = useRef<HTMLDivElement>(null);

  const [resultMode, setResultMode] = useState("original"); // "original" or "summary"
  const [resultLang, setResultLang] = useState("en"); // "en", "zh", "ja"
  const [youtubeError, setYoutubeError] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isUserVideo, setIsUserVideo] = useState(false);
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [demoTranscriptionContent, setDemoTranscriptionContent] = useState<{[key: string]: string}>({});
  const [demoUnformattedContent, setDemoUnformattedContent] = useState<{[key: string]: string}>({});
  const [demoSummaryContent, setDemoSummaryContent] = useState<{[key: string]: string}>({});
  const [currentTime, setCurrentTime] = useState<string>("");
  const [copyStatus, setCopyStatus] = useState<{[key: string]: string}>({});

  // AbortController refs for canceling ongoing requests
  const transcribeAbortController = useRef<AbortController | null>(null);
  const summaryAbortController = useRef<AbortController | null>(null);
  const youtubeAbortController = useRef<AbortController | null>(null);
  const processAbortController = useRef<AbortController | null>(null);

  // Streaming state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<{[key: string]: any}>({});
  const [currentProcessingStage, setCurrentProcessingStage] = useState<string>(''); // 'transcribing', 'translating', 'formatting'

  // Sync dark mode with HTML class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Set current time after component mounts to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  // Cleanup function to abort any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (transcribeAbortController.current) {
        transcribeAbortController.current.abort();
      }
      if (summaryAbortController.current) {
        summaryAbortController.current.abort();
      }
      if (youtubeAbortController.current) {
        youtubeAbortController.current.abort();
      }
      if (processAbortController.current) {
        processAbortController.current.abort();
      }
    };
  }, []);



  // Streaming process function
  const processFile = async (file: File, inputLanguage: string, outputLanguage: string, summaryRequested: boolean = false) => {
    const form = new FormData();
    form.append('file', file);
    form.append('inputLanguage', inputLanguage); // This will be 'auto' for user videos
    form.append('outputLanguage', outputLanguage);
    form.append('summaryRequested', summaryRequested.toString());
    form.append('formatType', isFormatted ? 'markdown' : 'raw');

    if (processAbortController.current) {
      processAbortController.current.abort();
    }

    processAbortController.current = new AbortController();

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: form,
        signal: processAbortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          console.log('🔍 Raw SSE frame:', frame);
          
          const lines = frame.split('\n');
          let event = 'message', data = '';
          
          for (const l of lines) {
            if (l.startsWith('event:')) {
              event = l.slice(6).trim();
              console.log('📡 Event type:', event);
            } else if (l.startsWith('data:')) {
              data = l.slice(5).trim();
              console.log('📦 Data received:', data);
            }
          }
          
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              handleEvent(event, parsedData);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error processing file:', error);
        setProcessingStatus('Error processing file');
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleEvent = (event: string, data: any) => {
    console.log('🔍 SSE Event received:', event, data);
    
    switch (event) {
      case 'status':
        console.log('📝 Setting status:', data.msg);
        setProcessingStatus(data.msg || 'Processing...');
        // Determine current stage from status message
        if (data.msg?.includes('Transcribing')) {
          setCurrentProcessingStage('transcribing');
        } else if (data.msg?.includes('Translating')) {
          setCurrentProcessingStage('translating');
        } else if (data.msg?.includes('Formatting')) {
          setCurrentProcessingStage('formatting');
                       } else if (data.msg?.includes('Generating summary')) {
                 setCurrentProcessingStage('formatting');
               }
        break;
      case 'progress':
        console.log('🔄 Setting progress:', data);
        setProcessingProgress(prev => ({ ...prev, ...data }));
        break;
      case 'cached':
        console.log('💾 Using cached result');
        setProcessingStatus('Using cached result...');
        break;
      case 'transcribe':
        console.log('🎯 Transcribe event:', data);
        setCurrentProcessingStage('transcribing');
        // Handle transcription step
        if (data.transcriptText) {
          console.log('📝 Setting transcription:', data.transcriptText.substring(0, 100) + '...');
          setTranscriptionOriginal(data.transcriptText);
        }
        if (data.detectedLanguage && data.inputLanguage === 'auto') {
          setProcessingStatus(`Detected language: ${data.detectedLanguage}`);
        }
        break;
      case 'translate':
        console.log('🌐 Translate event:', data);
        setCurrentProcessingStage('translating');
        // Handle translation step
        if (data.rawText) {
          console.log('📝 Setting translated text:', data.rawText.substring(0, 100) + '...');
          setTranscriptionRaw(data.rawText);
        }
        if (data.translation) {
          setAllTranslations(prev => ({ ...prev, [videoOutputLanguage]: data.translation }));
        }
        break;
      case 'format':
        console.log('✨ Format event:', data);
        setCurrentProcessingStage('formatting');
        // Handle formatting step - now we get both raw and markdown
        if (data.markdownText) {
          console.log('📝 Setting formatted text:', data.markdownText.substring(0, 100) + '...');
          setTranscriptionOriginal(data.markdownText);
        }
        if (data.rawText) {
          console.log('📝 Setting raw text:', data.rawText.substring(0, 100) + '...');
          setTranscriptionRaw(data.rawText);
        }
        break;
      case 'summarize':
        console.log('📋 Summarize event:', data);
        setCurrentProcessingStage('summarizing');
        // Handle summary step
        if (data.summaryText) {
          console.log('📝 Setting summary:', data.summaryText.substring(0, 100) + '...');
          setTranscriptionSummary(data.summaryText);
          setAllSummaries(prev => ({ ...prev, [videoOutputLanguage]: data.summaryText }));
          // Automatically switch to summary mode when summary is generated
          setResultMode("summary");
        }
        break;
      case 'done':
        console.log('✅ Done event:', data);
        setCurrentProcessingStage('');
        // Handle final result
        if (data.markdownText) {
          console.log('📝 Final formatted text:', data.markdownText.substring(0, 100) + '...');
          setTranscriptionOriginal(data.markdownText);
        }
        if (data.rawText) {
          console.log('📝 Final raw text:', data.rawText.substring(0, 100) + '...');
          setTranscriptionRaw(data.rawText);
        }
        if (data.summaryText) {
          setTranscriptionSummary(data.summaryText);
          setAllSummaries(prev => ({ ...prev, [data.outputLanguage || videoOutputLanguage]: data.summaryText }));
        }
        if (data.translation) {
          setAllTranslations(prev => ({ ...prev, [data.outputLanguage || videoOutputLanguage]: data.translation }));
        }
        setIsProcessing(false);
        setProcessingStatus('Processing complete!');
        break;
      case 'error':
        console.error('❌ Pipeline error:', data);
        setCurrentProcessingStage('');
        setProcessingStatus(`Error: ${data.message || 'Unknown error'}`);
        setIsProcessing(false);
        break;
      default:
        console.log('❓ Unhandled event:', event, data);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(prev => ({ ...prev, [type]: 'Copied!' }));
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [type]: '' }));
      }, 2000);
    } catch (err) {
      setCopyStatus(prev => ({ ...prev, [type]: 'Failed to copy' }));
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [type]: '' }));
      }, 2000);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Video file upload dropdowns
      if (videoInputDropdownRef.current && !videoInputDropdownRef.current.contains(event.target as Node)) {
        setIsVideoInputDropdownOpen(false);
        setVideoInputSearchTerm("");
      }
      if (videoOutputDropdownRef.current && !videoOutputDropdownRef.current.contains(event.target as Node)) {
        setIsVideoOutputDropdownOpen(false);
        setVideoOutputSearchTerm("");
      }
      
      // YouTube dropdowns
      if (youtubeInputDropdownRef.current && !youtubeInputDropdownRef.current.contains(event.target as Node)) {
        setIsYoutubeInputDropdownOpen(false);
        setYoutubeInputSearchTerm("");
      }
      if (youtubeOutputDropdownRef.current && !youtubeOutputDropdownRef.current.contains(event.target as Node)) {
        setIsYoutubeOutputDropdownOpen(false);
        setYoutubeOutputSearchTerm("");
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch demo markdown content
  useEffect(() => {
    const fetchDemoContent = async () => {
      try {
        const languages = ['en', 'zh', 'ja'];
        const transcriptionContent: {[key: string]: string} = {};
        const unformattedContent: {[key: string]: string} = {};
        const summaryContent: {[key: string]: string} = {};

        for (const lang of languages) {
          // Fetch transcription demo content
          const transcriptionResponse = await fetch(`/Demo/demo-transcription-${lang}.md`);
          if (transcriptionResponse.ok) {
            transcriptionContent[lang] = await transcriptionResponse.text();
          }

          // Fetch unformatted demo content
          const unformattedResponse = await fetch(`/Demo/demo-transcription-unformatted.md`);
          if (unformattedResponse.ok) {
            unformattedContent[lang] = await unformattedResponse.text();
          }

          // Fetch summary demo content
          const summaryResponse = await fetch(`/Demo/demo-summary-${lang}.md`);
          if (summaryResponse.ok) {
            summaryContent[lang] = await summaryResponse.text();
          }
        }

        setDemoTranscriptionContent(transcriptionContent);
        setDemoUnformattedContent(unformattedContent);
        setDemoSummaryContent(summaryContent);
      } catch (error) {
        console.error('Error fetching demo content:', error);
      }
    };

    fetchDemoContent();
  }, []);

  // Comprehensive language list for YouTube transcription
  const youtubeLanguages = [
    { code: "af", name: "Afrikaans" },
    { code: "ak", name: "Akan" },
    { code: "sq", name: "Albanian" },
    { code: "am", name: "Amharic" },
    { code: "ar", name: "Arabic" },
    { code: "hy", name: "Armenian" },
    { code: "as", name: "Assamese" },
    { code: "ay", name: "Aymara" },
    { code: "az", name: "Azerbaijani" },
    { code: "bn", name: "Bangla" },
    { code: "eu", name: "Basque" },
    { code: "be", name: "Belarusian" },
    { code: "bho", name: "Bhojpuri" },
    { code: "bs", name: "Bosnian" },
    { code: "bg", name: "Bulgarian" },
    { code: "my", name: "Burmese" },
    { code: "ca", name: "Catalan" },
    { code: "ceb", name: "Cebuano" },
    { code: "zh", name: "Chinese" },
    { code: "zh-HK", name: "Chinese (Hong Kong)" },
    { code: "zh-CN", name: "Chinese (China)" },
    { code: "zh-SG", name: "Chinese (Singapore)" },
    { code: "zh-TW", name: "Chinese (Taiwan)" },
    { code: "zh-Hans", name: "Chinese (Simplified)" },
    { code: "zh-Hant", name: "Chinese (Traditional)" },
    { code: "hak-TW", name: "Hakka Chinese (Taiwan)" },
    { code: "nan-TW", name: "Min Nan Chinese (Taiwan)" },
    { code: "co", name: "Corsican" },
    { code: "hr", name: "Croatian" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "dv", name: "Divehi" },
    { code: "nl", name: "Dutch" },
    { code: "en", name: "English" },
    { code: "en-US", name: "English (United States)" },
    { code: "eo", name: "Esperanto" },
    { code: "et", name: "Estonian" },
    { code: "ee", name: "Ewe" },
    { code: "fil", name: "Filipino" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "gl", name: "Galician" },
    { code: "lg", name: "Ganda" },
    { code: "ka", name: "Georgian" },
    { code: "de", name: "German" },
    { code: "el", name: "Greek" },
    { code: "gn", name: "Guarani" },
    { code: "gu", name: "Gujarati" },
    { code: "ht", name: "Haitian Creole" },
    { code: "ha", name: "Hausa" },
    { code: "haw", name: "Hawaiian" },
    { code: "iw", name: "Hebrew" },
    { code: "hi", name: "Hindi" },
    { code: "hmn", name: "Hmong" },
    { code: "hu", name: "Hungarian" },
    { code: "is", name: "Icelandic" },
    { code: "ig", name: "Igbo" },
    { code: "id", name: "Indonesian" },
    { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "jv", name: "Javanese" },
    { code: "kn", name: "Kannada" },
    { code: "kk", name: "Kazakh" },
    { code: "km", name: "Khmer" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "ko", name: "Korean" },
    { code: "kri", name: "Krio" },
    { code: "ku", name: "Kurdish" },
    { code: "ky", name: "Kyrgyz" },
    { code: "lo", name: "Lao" },
    { code: "la", name: "Latin" },
    { code: "lv", name: "Latvian" },
    { code: "ln", name: "Lingala" },
    { code: "lt", name: "Lithuanian" },
    { code: "lb", name: "Luxembourgish" },
    { code: "mk", name: "Macedonian" },
    { code: "mg", name: "Malagasy" },
    { code: "ms", name: "Malay" },
    { code: "ml", name: "Malayalam" },
    { code: "mt", name: "Maltese" },
    { code: "mi", name: "Māori" },
    { code: "mr", name: "Marathi" },
    { code: "mn", name: "Mongolian" },
    { code: "ne", name: "Nepali" },
    { code: "nso", name: "Northern Sotho" },
    { code: "no", name: "Norwegian" },
    { code: "ny", name: "Nyanja" },
    { code: "or", name: "Odia" },
    { code: "om", name: "Oromo" },
    { code: "ps", name: "Pashto" },
    { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese" },
    { code: "pa", name: "Punjabi" },
    { code: "qu", name: "Quechua" },
    { code: "ro", name: "Romanian" },
    { code: "ru", name: "Russian" },
    { code: "sm", name: "Samoan" },
    { code: "sa", name: "Sanskrit" },
    { code: "gd", name: "Scottish Gaelic" },
    { code: "sr", name: "Serbian" },
    { code: "sn", name: "Shona" },
    { code: "sd", name: "Sindhi" },
    { code: "si", name: "Sinhala" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "so", name: "Somali" },
    { code: "st", name: "Southern Sotho" },
    { code: "es", name: "Spanish" },
    { code: "su", name: "Sundanese" },
    { code: "sw", name: "Swahili" },
    { code: "sv", name: "Swedish" },
    { code: "tg", name: "Tajik" },
    { code: "ta", name: "Tamil" },
    { code: "tt", name: "Tatar" },
    { code: "te", name: "Telugu" },
    { code: "th", name: "Thai" },
    { code: "ti", name: "Tigrinya" },
    { code: "ts", name: "Tsonga" },
    { code: "tr", name: "Turkish" },
    { code: "tk", name: "Turkmen" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
    { code: "ug", name: "Uyghur" },
    { code: "uz", name: "Uzbek" },
    { code: "vi", name: "Vietnamese" },
    { code: "cy", name: "Welsh" },
    { code: "fy", name: "Western Frisian" },
    { code: "xh", name: "Xhosa" },
    { code: "yi", name: "Yiddish" },
    { code: "yo", name: "Yoruba" },
    { code: "zu", name: "Zulu" }
  ];

  // Get current translations based on selected language
  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  // Check if video is uploaded
  const isVideoUploaded = selectedFile !== null && isFileSelected;

  const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));

    if (videoFile) {
      setSelectedFile(videoFile);
      setIsFileSelected(true);
      setYoutubeError("");
      setTranscriptionOriginal("");
      setTranscriptionSummary("");
      setAllTranslations({});
      setAllSummaries({});
      setIsUserVideo(true);
      setIsYouTubeVideo(false);
      // Clear YouTube URL input when video is uploaded
      if (urlInputRef.current) {
        urlInputRef.current.value = '';
      }
    } else {
      alert(t.pleaseSelectValidVideo);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setIsFileSelected(true);
      setYoutubeError("");
      setTranscriptionOriginal("");
      setTranscriptionSummary("");
      setAllTranslations({});
      setAllSummaries({});
      setIsUserVideo(true);
      setIsYouTubeVideo(false);
      // Clear YouTube URL input when video is uploaded
      if (urlInputRef.current) {
        urlInputRef.current.value = '';
      }
    } else if (file) {
      alert(t.pleaseSelectValidVideo);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Function to reset all states to default
  const resetToDefault = () => {
    setTranscriptionOriginal("");
    setTranscriptionRaw("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllUnformattedTranslations({});
    setAllSummaries({});
    setYoutubeError("");
    setIsYouTubeVideo(false);
    setIsUserVideo(false);
    setYoutubeVideoId("");
    setResultMode("original");
    setProcessingStatus('');
    setProcessingProgress({});
    setIsProcessing(false);
    setCurrentProcessingStage('');
  };

  const handleRemoveFile = () => {
    // Stop any ongoing processes
    if (isTranscribingVideo && transcribeAbortController.current) {
      transcribeAbortController.current.abort();
    }
    if (isTranscribingYouTube && youtubeAbortController.current) {
      youtubeAbortController.current.abort();
    }
    if (isSummaryLoading && summaryAbortController.current) {
      summaryAbortController.current.abort();
    }
    if (isProcessing && processAbortController.current) {
      processAbortController.current.abort();
    }
    
    setIsTranscribingVideo(false);
    setIsTranscribingYouTube(false);
    setIsSummaryLoading(false);
    setIsProcessing(false);
    setCurrentProcessingStage('');
    
    // Reset file selection
    setSelectedFile(null);
    setIsFileSelected(false);
    
    // Reset to default state
    resetToDefault();
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    // If already processing, stop and reset
    if (isTranscribingVideo || isTranscribingYouTube || isSummaryLoading || isProcessing) {
      resetToDefault();
      return;
    }

    // Create new AbortController for this request
    processAbortController.current = new AbortController();

    setIsProcessing(true);
    setTranscriptionOriginal("");
    setTranscriptionRaw("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllUnformattedTranslations({});
    setAllSummaries({});
    setProcessingStatus('Starting process...');
    setProcessingProgress({});

    try {
      // Use the new streaming process endpoint
      await processFile(selectedFile, 'auto', videoOutputLanguage, false);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Process request was cancelled');
        return;
      }
      console.error('Process error:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
      processAbortController.current = null;
    }
  };

  // Keep the old transcribe function for backward compatibility
  const handleTranscribe = async () => {
    if (!selectedFile) return;

    // If already processing, stop and reset
    if (isTranscribingVideo || isTranscribingYouTube || isSummaryLoading || isProcessing) {
      resetToDefault();
      return;
    }

    // Create new AbortController for this request
    transcribeAbortController.current = new AbortController();

    setIsProcessing(true);
    setTranscriptionOriginal("");
    setTranscriptionRaw("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllUnformattedTranslations({});
    setAllSummaries({});

    try {
      // Use the new pipeline for transcription
      await processFile(selectedFile, 'auto', videoOutputLanguage, false);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Transcription request was cancelled');
        return;
      }
      console.error('Transcription error:', error);
      alert('Transcription failed. Please try again.');
    } finally {
      setIsProcessing(false);
      transcribeAbortController.current = null;
    }
  };

  const handleSummary = async () => {
    if (!selectedFile) return;
    
    if (!transcriptionOriginal) {
      alert("Please transcribe the video first before generating a summary.");
      return;
    }

    // If already processing, stop and reset
    if (isTranscribingVideo || isTranscribingYouTube || isSummaryLoading || isProcessing) {
      resetToDefault();
      return;
    }

    // Check if summary already exists for the current output language
    const existingSummary = allSummaries[videoOutputLanguage] || transcriptionSummary;
    if (existingSummary && existingSummary.trim() !== "") {
      // If summary exists, just switch to summary mode without calling API
      setResultMode("summary");
      return;
    }

    // Create new AbortController for this request
    summaryAbortController.current = new AbortController();

    setIsProcessing(true);
    setProcessingStatus('Generating summary...');

    try {
      // Use the pipeline with summary requested = true
      await processFile(selectedFile, 'auto', videoOutputLanguage, true);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Summary request was cancelled');
        return;
      }
      console.error('Summary error:', error);
      alert('Summary generation failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      summaryAbortController.current = null;
    }
  };

  const handleSummaryYouTube = async () => {
    if (!isYouTubeVideo) return;
    
    if (!transcriptionOriginal) {
      alert("Please transcribe the video first before generating a summary.");
      return;
    }

    // If already processing, stop and reset
    if (isTranscribingVideo || isTranscribingYouTube || isSummaryLoading) {
      resetToDefault();
      return;
    }

    // Check if summary already exists for the current output language
    const existingSummary = allSummaries[youtubeOutputLanguage] || transcriptionSummary;
    if (existingSummary && existingSummary.trim() !== "") {
      // If summary exists, just switch to summary mode without calling API
      setResultMode("summary");
      return;
    }

    // Create new AbortController for this request
    summaryAbortController.current = new AbortController();

    setIsSummaryLoading(true);
    setTranscriptionSummary("");
    setAllSummaries({});

    try {
      // For YouTube videos, use the same summary API as user videos
      const formData = new FormData();
      formData.append('file', new File([], 'youtube-video')); // Dummy file for YouTube
      formData.append('inputLanguage', youtubeInputLanguage);
      formData.append('outputLanguage', youtubeOutputLanguage);
      formData.append('resultMode', resultMode);
      formData.append('resultLang', resultLang);
      formData.append('transcriptionText', transcriptionOriginal);

      const response = await fetch('/api/summary', {
        method: 'POST',
        body: formData,
        signal: summaryAbortController.current.signal,
      });

      if (response.status === 499) {
        console.log('YouTube summary request was cancelled by user');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Summary generation failed');
      }

      const data = await response.json();
      setTranscriptionSummary(data.summary);
      // Set the summary for the selected output language
      setAllSummaries(data.summaries || {});

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('YouTube summary request was cancelled');
        return;
      }
      console.error('Summary error:', error);
      alert('Summary generation failed. Please try again.');
    } finally {
      setIsSummaryLoading(false);
      summaryAbortController.current = null;
    }
  };

  const handleTranscribeYouTube = async () => {
    const url = urlInputRef.current?.value;
    if (!url) {
      setYoutubeError("No link is provided");
      return;
    }

    const YOUTUBE_VIDEO_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    if (!YOUTUBE_VIDEO_REGEX.test(url)) {
      setYoutubeError("Please provide a valid YouTube video link");
      return;
    }

    // If already transcribing, stop and reset
    if (isTranscribingVideo || isTranscribingYouTube || isSummaryLoading) {
      resetToDefault();
      return;
    }

    // Create new AbortController for this request
    youtubeAbortController.current = new AbortController();
    
    // Extract video ID
    const match = url.match(YOUTUBE_VIDEO_REGEX);
    const videoId = match ? match[1] : '';
    setYoutubeVideoId(videoId);
    
    setIsFileSelected(false);
    setSelectedFile(null);
    setYoutubeError("");
    setIsTranscribingYouTube(true);
    setIsYouTubeVideo(true);
    setIsUserVideo(false);
    
    // Clear previous results
    setTranscriptionOriginal("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllUnformattedTranslations({});
    setAllSummaries({});

    try {
      const response = await fetch(`/api/youtube-captions?url=${url}&text=true&lang=${youtubeInputLanguage}`, {
        signal: youtubeAbortController.current.signal,
      });
      
      if (response.status === 499) {
        console.log('YouTube transcription request was cancelled by user');
        return;
      }
      
      const data = await response.json();
      const captions = (data.content || data.details || data.message);
      
      // Format the captions using GPT
      const formatResponse = await fetch('/api/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: captions,
          language: youtubeInputLanguage,
          type: 'youtube-captions'
        }),
        signal: youtubeAbortController.current.signal,
      });
      
      if (formatResponse.status === 499) {
        console.log('YouTube formatting request was cancelled by user');
        return;
      }
      
      if (formatResponse.ok) {
        const formattedData = await formatResponse.json();
        const formattedCaptions = formattedData.formattedText;
        
        setTranscriptionOriginal(formattedCaptions);
        
        // Set translations for the current output language
        const translations = { 
          [youtubeOutputLanguage]: formattedCaptions
        };
        const unformattedTranslations = { 
          [youtubeOutputLanguage]: captions
        };
        setAllTranslations(translations);
        setAllUnformattedTranslations(unformattedTranslations);
      } else {
        // Fallback to original captions if formatting fails
        const paragraph = captions.replace(/\n+/g, ' ');
        setTranscriptionOriginal(paragraph);
        
        const translations = { 
          [youtubeOutputLanguage]: paragraph
        };
        const unformattedTranslations = { 
          [youtubeOutputLanguage]: captions
        };
        setAllTranslations(translations);
        setAllUnformattedTranslations(unformattedTranslations);
      }
      
      // Don't set any summaries - let the summary button generate them
      setTranscriptionSummary("");
      setAllSummaries({});
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('YouTube transcription request was cancelled');
        return;
      }
      console.error('YouTube transcription error:', error);
      setYoutubeError("Failed to transcribe video. Please try again.");
    } finally {  
      setIsTranscribingYouTube(false);
      youtubeAbortController.current = null;
    }
  };

  // Dynamic Processing Animation Component
  const ProcessingAnimation = ({ stage }: { stage: string }) => {
    // Check if we're in summary mode
    const isSummaryMode = resultMode === 'summary';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 sm:p-8">
        {/* Main Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12">
          {isSummaryMode ? 'AI is Generating Summary' : 'AI is Processing Your Video'}
        </h2>
        
        {/* Show single summary icon or three stage icons based on mode */}
        {isSummaryMode ? (
          // Single Summary Icon
          <div className="flex flex-col items-center gap-4 mb-8 sm:mb-12">
            <div className="relative p-4 sm:p-6 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600 dark:text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {/* Floating particles for summarizing */}
              <div className="absolute -top-2 -left-2 w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-sm sm:text-base text-orange-600 dark:text-orange-400">
                Summarizing
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Creating concise summary
              </p>
            </div>
          </div>
        ) : (
          // Three Stage Icons - All Visible Simultaneously
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Transcribing Stage */}
          <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${
            stage === 'transcribing' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'
          }`}>
            <div className={`relative p-4 sm:p-6 rounded-full ${
              stage === 'transcribing' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <svg className={`w-8 h-8 sm:w-12 sm:h-12 ${
                stage === 'transcribing' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {/* Floating particles for transcribing */}
              {stage === 'transcribing' && (
                <>
                  <div className="absolute -top-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
            <div className="text-center">
              <h3 className={`font-semibold text-sm sm:text-base ${
                stage === 'transcribing' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
              }`}>
                Transcribing
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Converting speech to text
              </p>
            </div>
          </div>

          {/* Translating Stage */}
          <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${
            stage === 'translating' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'
          }`}>
            <div className={`relative p-4 sm:p-6 rounded-full ${
              stage === 'translating' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <svg className={`w-8 h-8 sm:w-12 sm:h-12 ${
                stage === 'translating' ? 'text-green-600 dark:text-green-400 animate-bounce' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* Floating particles for translating */}
              {stage === 'translating' && (
                <>
                  <div className="absolute -top-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
            <div className="text-center">
              <h3 className={`font-semibold text-sm sm:text-base ${
                stage === 'translating' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
              }`}>
                Translating
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Converting between languages
              </p>
            </div>
          </div>

          {/* Formatting Stage */}
          <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${
            stage === 'formatting' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'
          }`}>
            <div className={`relative p-4 sm:p-6 rounded-full ${
              stage === 'formatting' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <svg className={`w-8 h-8 sm:w-12 sm:h-12 ${
                stage === 'formatting' ? 'text-purple-600 dark:text-purple-400 animate-pulse' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {/* Floating particles for formatting */}
              {stage === 'formatting' && (
                <>
                  <div className="absolute -top-2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
            <div className="text-center">
              <h3 className={`font-semibold text-sm sm:text-base ${
                stage === 'formatting' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'
              }`}>
                Formatting
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Structuring content
              </p>
            </div>
          </div>
        </div>
        )}



        {/* Status Message */}
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium">
            {stage === 'transcribing' && t.transcriptionAnimation}
            {stage === 'translating' && t.transcriptionAnimation}
            {stage === 'formatting' && (resultMode === 'summary' ? 'Generating summary...' : t.transcriptionAnimation)}
            {!stage && 'Preparing to process your video...'}
          </p>
          {processingStatus && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {processingStatus}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mt-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: stage === 'transcribing' ? '33%' : 
                       stage === 'translating' ? '66%' : 
                       stage === 'formatting' ? '100%' : 
                       stage === 'formatting' ? '100%' : '0%'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 gap-8 sm:gap-12 md:gap-16 font-[family-name:var(--font-inter)] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f7f9fb] text-[#222]'} text-center relative transition-colors duration-300`}>
      {/* Language Selector and Dark Mode Toggle - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-10 flex items-center gap-2 sm:gap-3 md:gap-4 text-left">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-sm border border-gray-300 dark:border-gray-600`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        
        {/* Language Selector */}
        <div className="relative text-left">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`text-left appearance-none rounded-lg px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 pr-8 sm:pr-12 text-xs sm:text-sm font-semibold text-left focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700'
            } border`}
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
            <svg className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`items-center justify-items-center ${isDarkMode ? 'text-white' : 'text-[#222]'}`}>
        {/* Icons above the title */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
          {/* Video icon */}
          <div className={`p-2 sm:p-3 md:p-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Arrow icon */}
          <div className={`p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          
          {/* Text icon */}
          <div className={`p-2 sm:p-3 md:p-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold px-4">{t.title}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-normal px-4">{t.subtitle}</p>
      </div>
      <div className={`flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-3 sm:gap-4 lg:gap-5 px-2 sm:px-4 ${isDarkMode ? 'text-white' : 'text-[#222]'}`}>
        {/* Video File Card */}
        <div
          className={`flex flex-col items-center justify-center w-full ${(isVideoUploaded || isYouTubeVideo) ? 'lg:w-1/3' : 'lg:w-1/2'} h-[400px] sm:h-[450px] lg:h-[485px] mb-3 sm:mb-5 lg:mb-0 rounded-2xl sm:rounded-3xl gap-3 sm:gap-4 lg:gap-5 relative p-3 sm:p-4 lg:p-6 pb-20 sm:pb-24 lg:pb-28 border-4 border-dotted transition-colors duration-200 ${
            isDragOver
              ? isDarkMode 
                ? 'border-blue-400 bg-blue-900/20' 
                : 'border-[#2563eb] bg-[#e8f0fe]'
              : selectedFile
                ? isDarkMode 
                  ? 'border-green-400 bg-green-900/20' 
                  : 'border-[#22c55e] bg-[#e7fbe9]'
                : isDarkMode 
                  ? 'border-gray-600 bg-gray-800' 
                  : 'border-[#e5e7eb] bg-white shadow-lg'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center w-full h-full">
            {/* Title */}
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold pt-6 sm:pt-8 md:pt-10 ${isDarkMode ? 'text-white' : 'text-[#222]'}`}>{t.transcribeVideoFile}</h2>
            {/* Language Selectors - Only output language for user videos, both for YouTube */}
            <div className="flex flex-col sm:flex-row mb-6 sm:mb-8 md:mb-10 w-full items-center gap-3 sm:gap-4">
              {/* Input Language Selector - Only for YouTube videos */}
              {isYouTubeVideo && (
                <div className="flex flex-col w-full items-center">
                  <label className="text-xs sm:text-sm font-semibold pt-4 sm:pt-6 md:pt-10 mb-1 relative">{t.inputLanguage}</label>
                  <div className="relative w-full max-w-xs sm:max-w-md" ref={videoInputDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsVideoInputDropdownOpen(!isVideoInputDropdownOpen)}
                      className={`w-full rounded-lg p-3 border text-left flex justify-between items-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    >
                      <span>{videoInputLanguage === 'auto' ? `🔍 ${t.autoDetect}` : youtubeLanguages.find(lang => lang.code === videoInputLanguage)?.name || 'English'}</span>
                      <svg className={`w-4 h-4 transition-transform ${isVideoInputDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isVideoInputDropdownOpen && (
                      <div className={`absolute z-10 w-full mt-1 rounded-lg border max-h-48 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-lg`}>
                        {/* Search Input */}
                        <div className="sticky top-0 p-2 border-b border-gray-300 dark:border-gray-600 bg-inherit">
                          <input
                            type="text"
                            placeholder="Search languages..."
                            value={videoInputSearchTerm}
                            onChange={(e) => setVideoInputSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const filteredLanguages = youtubeLanguages.filter((language) =>
                                  language.name.toLowerCase().includes(videoInputSearchTerm.toLowerCase()) ||
                                  language.code.toLowerCase().includes(videoInputSearchTerm.toLowerCase())
                                );
                                if (filteredLanguages.length > 0) {
                                  setVideoInputLanguage(filteredLanguages[0].code);
                                  setIsVideoInputDropdownOpen(false);
                                  setVideoInputSearchTerm("");
                                }
                              }
                            }}
                            className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                              isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                            }`}
                            autoFocus
                          />
                        </div>
                        {/* Filtered Languages */}
                        <div className="overflow-y-auto max-h-36">
                          {/* Auto-detect option */}
                          <button
                            type="button"
                            onClick={() => {
                              setVideoInputLanguage('auto');
                              setIsVideoInputDropdownOpen(false);
                              setVideoInputSearchTerm("");
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-600' : ''} ${videoInputLanguage === 'auto' ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                          >
                            🔍 {t.autoDetect}
                          </button>
                          {/* Divider */}
                          <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                          {youtubeLanguages
                            .filter((language) =>
                              language.name.toLowerCase().includes(videoInputSearchTerm.toLowerCase()) ||
                              language.code.toLowerCase().includes(videoInputSearchTerm.toLowerCase())
                            )
                            .map((language) => (
                              <button
                                key={language.code}
                                type="button"
                                onClick={() => {
                                  setVideoInputLanguage(language.code);
                                  setIsVideoInputDropdownOpen(false);
                                  setVideoInputSearchTerm("");
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-600' : ''} ${videoInputLanguage === language.code ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                              >
                                {language.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Output Language Selector */}
              <div className="flex flex-col w-full items-center">
                <label className="text-xs sm:text-sm font-semibold pt-4 sm:pt-6 md:pt-10 mb-1 relative">{t.outputLanguage}</label>
                <div className="relative w-full max-w-xs sm:max-w-md" ref={videoOutputDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsVideoOutputDropdownOpen(!isVideoOutputDropdownOpen)}
                    className={`w-full rounded-lg p-3 border text-left flex justify-between items-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                  >
                    <span>{youtubeLanguages.find(lang => lang.code === videoOutputLanguage)?.name || 'English'}</span>
                    <svg className={`w-4 h-4 transition-transform ${isVideoOutputDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isVideoOutputDropdownOpen && (
                    <div className={`absolute z-10 w-full mt-1 rounded-lg border max-h-48 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-lg`}>
                      {/* Search Input */}
                      <div className="sticky top-0 p-2 border-b border-gray-300 dark:border-gray-600 bg-inherit">
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={videoOutputSearchTerm}
                          onChange={(e) => setVideoOutputSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const filteredLanguages = youtubeLanguages.filter((language) =>
                                language.name.toLowerCase().includes(videoOutputSearchTerm.toLowerCase()) ||
                                language.code.toLowerCase().includes(videoOutputSearchTerm.toLowerCase())
                              );
                              if (filteredLanguages.length > 0) {
                                setVideoOutputLanguage(filteredLanguages[0].code);
                                setIsVideoOutputDropdownOpen(false);
                                setVideoOutputSearchTerm("");
                              }
                            }
                          }}
                          className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                            isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                          }`}
                          autoFocus
                        />
                      </div>
                      {/* Filtered Languages */}
                      <div className="overflow-y-auto max-h-36">
                        {youtubeLanguages
                          .filter((language) =>
                            language.name.toLowerCase().includes(videoOutputSearchTerm.toLowerCase()) ||
                            language.code.toLowerCase().includes(videoOutputSearchTerm.toLowerCase())
                          )
                          .map((language) => (
                            <button
                              key={language.code}
                              type="button"
                              onClick={() => {
                                setVideoOutputLanguage(language.code);
                                setIsVideoOutputDropdownOpen(false);
                                setVideoOutputSearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-600' : ''} ${videoOutputLanguage === language.code ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                            >
                              {language.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* File info, buttons, etc. */}
            {selectedFile ? (
              <div className="text-center w-full flex flex-col items-center gap-1 relative">
                <div className="flex items-center justify-center">
                  <p className="text-green-600 font-semibold mt-0">{t.fileSelected}</p>
                  <button
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                    className={`ml-1 p-1 rounded-full transition-colors mt-0 ${
                      isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-200'
                    }`}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 hover:text-red-500">
                      <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.415L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                <p className={`text-sm font-semibold mt-5 ${isDarkMode ? 'text-gray-300' : 'text-[#374151]'}`}>{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#64748b]'}`}>{t.dropOrUpload}</p>
              </div>
            )}
            
            {/* Fixed bottom section for button and label */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={isProcessing ? handleRemoveFile : (selectedFile ? handleProcess : handleUploadClick)}
                  className={`text-white p-2.5 sm:p-3 rounded-full w-[120px] sm:w-[140px] md:w-[150px] cursor-pointer font-extrabold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                    selectedFile
                      ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                      : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                  } ${isProcessing ? 'animate-pulse scale-105 shadow-lg shadow-green-500/25' : 'hover:scale-105 active:scale-95'} transform`}
                  disabled={false}
                >
                  {isProcessing && (
                    <div className="relative">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {/* Ripple effect */}
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                    </div>
                  )}
                  {isProcessing ? 'Stop' : selectedFile ? t.transcribe : t.upload}
                </button>
                <div className="w-full flex justify-center">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-[#94a3b8]'}`}>{t.supportedFormats}</p>
                </div>

              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
        {/* YouTube Card */}
        <div className={`flex flex-col items-center w-full ${(isVideoUploaded || isYouTubeVideo) ? 'lg:w-1/3' : 'lg:w-1/2'} h-[400px] sm:h-[450px] lg:h-[485px] mb-3 sm:mb-5 lg:mb-0 rounded-2xl sm:rounded-3xl gap-3 sm:gap-4 relative p-3 sm:p-4 lg:p-6 pb-20 sm:pb-24 lg:pb-28 border-4 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-[#e5e7eb] shadow-lg'
        }`}>
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold pt-6 sm:pt-8 ${isDarkMode ? 'text-white' : 'text-[#222]'}`}>{t.transcribeYouTube}</h2>
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full flex justify-center mb-2">
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-blue-600 hover:underline text-md font-medium ${isDarkMode ? 'dark:text-green-600' : ''}`}
              >
                https://www.youtube.com/
              </a>
            </div>
            <div className="text-center w-full mb-3 sm:mb-4">
              <div className="relative inline-block w-full max-w-xs sm:max-w-md">
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder={t.pasteYouTubeLink}
                  className={`w-full p-2.5 sm:p-3 pr-8 sm:pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 text-sm sm:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-[#e5e7eb] text-[#374151] placeholder-[#94a3b8]'
                  }`}
                  onChange={() => setYoutubeError("")}
                />
              </div>
              <p
                className={`mt-2 text-xs ${youtubeError ? "text-red-500" : "invisible"}`}
              >
                {youtubeError || "placeholder"}
              </p>
            </div>
          </div>
          {/* Language Selector */}
          <div className="flex flex-col mb-3 sm:mb-4 w-full items-center">
            <div className="flex items-center gap-2 mb-1 group relative">
              <label className="text-xs sm:text-sm font-semibold">{t.outputLanguage}</label>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold cursor-help ${isDarkMode
                    ? "bg-gray-600 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                ?
              </div>
              <div
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 leading-tight whitespace-nowrap ${isDarkMode
                    ? "bg-gray-800 text-gray-200 border border-gray-600"
                    : "bg-gray-100 text-black border border-gray-300"
                  }`}
              >
                <div className="font-semibold mb-2 text-blue-500">{t.importantNote}</div>
                <div className="space-y-2">
                  <p>{t.pleaseSelectLanguage}</p>
                  <p>{t.ifSelectedLanguageNotAvailable}</p>
                </div>
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isDarkMode ? "border-t-gray-800" : "border-t-gray-100"
                    }`}
                ></div>
              </div>
            </div>
            <div className="relative w-full max-w-xs sm:max-w-md" ref={youtubeOutputDropdownRef}>
              <button
                type="button"
                onClick={() => setIsYoutubeOutputDropdownOpen(!isYoutubeOutputDropdownOpen)}
                className={`w-full rounded-lg p-3 border text-left flex justify-between items-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
              >
                <span>{youtubeLanguages.find(lang => lang.code === youtubeOutputLanguage)?.name || 'English'}</span>
                <svg className={`w-4 h-4 transition-transform ${isYoutubeOutputDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isYoutubeOutputDropdownOpen && (
                <div className={`absolute z-10 w-full mt-1 rounded-lg border max-h-48 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-lg`}>
                  {/* Search Input */}
                  <div className="sticky top-0 p-2 border-b border-gray-300 dark:border-gray-600 bg-inherit">
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={youtubeOutputSearchTerm}
                      onChange={(e) => setYoutubeOutputSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const filteredLanguages = youtubeLanguages.filter((language) =>
                            language.name.toLowerCase().includes(youtubeOutputSearchTerm.toLowerCase()) ||
                            language.code.toLowerCase().includes(youtubeOutputSearchTerm.toLowerCase())
                          );
                          if (filteredLanguages.length > 0) {
                            setYoutubeOutputLanguage(filteredLanguages[0].code);
                            setIsYoutubeOutputDropdownOpen(false);
                            setYoutubeOutputSearchTerm("");
                          }
                        }
                      }}
                      className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                        isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                      }`}
                      autoFocus
                    />
                  </div>
                  {/* Filtered Languages */}
                  <div className="overflow-y-auto max-h-36">
                    {youtubeLanguages
                      .filter((language) =>
                        language.name.toLowerCase().includes(youtubeOutputSearchTerm.toLowerCase()) ||
                        language.code.toLowerCase().includes(youtubeOutputSearchTerm.toLowerCase())
                      )
                      .map((language) => (
                        <button
                          key={language.code}
                          type="button"
                          onClick={() => {
                            setYoutubeOutputLanguage(language.code);
                            setIsYoutubeOutputDropdownOpen(false);
                            setYoutubeOutputSearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-600' : ''} ${youtubeOutputLanguage === language.code ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                        >
                          {language.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Fixed bottom section for button and label */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col items-center gap-2">
              <button
                className={`text-white bg-[#22c55e] hover:bg-[#16a34a] p-2.5 sm:p-3 rounded-full w-[120px] sm:w-[140px] md:w-[150px] cursor-pointer font-extrabold transition-colors flex items-center justify-center gap-1 text-sm sm:text-base ${
                  isTranscribingYouTube ? 'animate-pulse' : ''
                }`}
                onClick={isTranscribingYouTube ? handleRemoveFile : handleTranscribeYouTube}
                disabled={false}
              >
                {isTranscribingYouTube && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isTranscribingYouTube ? 'Stop' : t.transcribe}
              </button>
              <div className="w-full flex justify-center px-2">
                <p className={`text-xs text-center break-words ${isDarkMode ? 'text-gray-500' : 'text-[#94a3b8]'}`}>{t.pasteYouTubeDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Preview Card - Appears after file upload or YouTube video */}
        {(isVideoUploaded || isYouTubeVideo) && (
          <div className={`flex flex-col items-center justify-center w-full lg:w-1/3 h-[400px] sm:h-[450px] lg:h-[485px] mb-3 sm:mb-5 lg:mb-0 rounded-2xl sm:rounded-3xl gap-3 sm:gap-4 lg:gap-5 relative p-3 sm:p-4 lg:p-6 border-4 ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-[#e5e7eb] shadow-lg'
          }`}>
          {/* User Video */}
          {isUserVideo && selectedFile && (
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 w-full">
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-[#222]'}`}>Video Preview</h2>
              <div className="w-full">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className={`rounded-xl shadow-lg max-h-48 sm:max-h-56 md:max-h-64 w-auto border mx-auto block ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                />
              </div>
              <div className="text-center w-full">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-[#374151]'}`}>{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}
          {/* YouTube Video */}
          {isYouTubeVideo && (
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 w-full">
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-[#222]'}`}>YouTube Video</h2>
              <div className="w-full">
                {youtubeVideoId ? (
                  <div className={`rounded-xl shadow-lg max-h-48 sm:max-h-56 md:max-h-64 w-auto border mx-auto block overflow-hidden ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <iframe
                      width="100%"
                      height="200"
                      className="sm:h-[220px] md:h-[240px] rounded-xl"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className={`rounded-xl shadow-lg max-h-64 w-auto border mx-auto block p-4 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>YouTube Video</span>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {urlInputRef.current?.value || 'YouTube Video'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Language: {youtubeLanguages.find(lang => lang.code === youtubeInputLanguage)?.name || 'English'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        )}
      </div>
      {/* Original | Summary Toggle - Always visible */}
      <div className="w-full max-w-7xl mx-auto flex flex-row justify-center sm:justify-end items-center mt-1 px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:mr-8">
            {[
              { mode: "original", label: t.original, isFirst: true },
              { mode: "summary", label: (isSummaryLoading || isProcessing) ? 'Stop' : t.summary, isFirst: false }
            ].map(({ mode, label, isFirst }) => (
              <button
                key={mode}
                className={
                  `px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 shadow-md hover:shadow-lg
                  ${isFirst ? 'rounded-l-lg sm:rounded-l-xl' : 'rounded-r-lg sm:rounded-r-xl border-l-0'}
                  ${resultMode === mode && mode === "original"
                    ? 'bg-blue-400 text-white border-blue-400 shadow-blue-400/25'
                    : resultMode === mode && mode === "summary"
                    ? 'bg-green-400 text-white border-green-400 shadow-green-400/25'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f1f5f9]'
                  }`
                }
                onClick={() => {
                  // If summary is loading or processing, stop the process
                  if (mode === "summary" && (isSummaryLoading || isProcessing)) {
                    resetToDefault();
                    return;
                  }
                  
                  setResultMode(mode as "original" | "summary");
                  if (mode === "summary") {
                    if (isYouTubeVideo) {
                      handleSummaryYouTube();
                    } else {
                      handleSummary();
                    }
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>    
        </div>


      {/* Transcription Result */}
      {resultMode === "original" && (
        <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4`}>
          <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border-2 transition-all duration-500 backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800/95 via-gray-800/90 to-gray-900/95 border-gray-600/50 text-white shadow-gray-900/30' 
              : 'bg-gradient-to-br from-white/95 via-white/90 to-[#f7f9fb]/95 border-[#e5e7eb]/50 text-[#222] shadow-[#e5e7eb]/30'
          }`}>
            {/* Header with icon and gradient background */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl gap-3 sm:gap-4 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50'
            }`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'} shadow-lg`}> 
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t.transcriptionOriginal}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.transcriptionSubtitle}
                  </p>
                </div>
              </div>
              {/* Format Toggle and Copy Button */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                {/* Format Toggle */}
                <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg text-xs sm:text-sm ${
                  isDarkMode 
                    ? 'bg-blue-600/20 border border-blue-500/30' 
                    : 'bg-blue-100 border border-blue-300/50'
                }`}>
                  <span className={`${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    {isFormatted ? 'Formatted' : 'Unformatted'}
                  </span>
                  <button
                    onClick={() => setIsFormatted(!isFormatted)}
                    className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 items-center rounded-full transition-colors ${
                      isFormatted 
                        ? 'bg-blue-500' 
                        : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 transform rounded-full bg-white transition-transform ${
                        isFormatted ? 'translate-x-3.5 sm:translate-x-5' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(
                    transcriptionOriginal
                      ? (isFormatted 
                          ? (allTranslations[resultLang] || transcriptionOriginal)
                          : (allUnformattedTranslations[resultLang] || transcriptionOriginal)
                        )
                      : (isFormatted
                          ? (demoTranscriptionContent[selectedLanguage] || demoTranscriptionContent['en'] || '')
                          : (demoUnformattedContent[selectedLanguage] || demoUnformattedContent['en'] || '')
                        ),
                    'original'
                  )}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-xs sm:text-sm ${
                    isDarkMode 
                      ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300/50'
                  }`}
                >
                  {copyStatus['original'] ? (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-500">{copyStatus['original']}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{t.copyLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Content with enhanced styling */}
            <div className={`markdown-body text-left p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50' 
                : 'bg-gray-50/50 border border-gray-200/50'
            } shadow-inner`}>
              {isProcessing ? (
                <ProcessingAnimation stage={currentProcessingStage || 'transcribing'} />
              ) : (
                <>
                  {isFormatted ? (
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-blue-600 dark:text-blue-400">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-blue-500 dark:text-blue-300">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-blue-400 dark:text-blue-200">{children}</h3>,
                        p: ({children}) => <p className="mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold text-blue-600 dark:text-blue-400">{children}</strong>,
                        em: ({children}) => <em className="italic text-blue-500 dark:text-blue-300">{children}</em>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-2 sm:mb-3 space-y-1 ml-3 sm:ml-4 text-sm sm:text-base">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-2 sm:mb-3 space-y-1 ml-3 sm:ml-4 text-sm sm:text-base">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        blockquote: ({children}) => (
                          <blockquote className={`border-l-3 pl-2 sm:pl-3 py-1.5 sm:py-2 my-2 sm:my-3 italic text-sm sm:text-base ${
                            isDarkMode 
                              ? 'border-blue-400 bg-blue-900/10' 
                              : 'border-blue-400 bg-blue-50/50'
                          }`}>
                            {children}
                          </blockquote>
                        ),
                        code: ({children}) => (
                          <code className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono ${
                            isDarkMode 
                              ? 'bg-gray-700 text-blue-300' 
                              : 'bg-gray-100 text-blue-700'
                          }`}>
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {(() => {
                        const content = transcriptionOriginal
                          ? (allTranslations[resultLang] || transcriptionOriginal)
                          : (demoTranscriptionContent[selectedLanguage] ||
                             demoTranscriptionContent['en'] ||
                             "# Loading...");
                        console.log('ReactMarkdown content:', content);
                        console.log('Content type:', typeof content);
                        console.log('Content length:', content?.length);
                        console.log('First 200 chars:', content?.substring(0, 200));
                        return content;
                      })()}
                    </ReactMarkdown>
                  ) : (
                    // Raw text display with proper paragraph breaks
                    <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                      {(() => {
                        const content = transcriptionRaw
                          ? (allUnformattedTranslations[resultLang] || transcriptionRaw)
                          : (demoUnformattedContent[selectedLanguage] ||
                             demoUnformattedContent['en'] ||
                             "Loading...");
                        return content;
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Enhanced footer with metadata */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t gap-3 sm:gap-0 ${
              isDarkMode ? 'border-gray-600/30' : 'border-gray-300/30'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className={`p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentTime ? `${t.generatedAt} ${currentTime}` : t.generated}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-300/50'
                }`}>
                  {selectedLanguage.toUpperCase()}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {resultMode === "summary" && (
        <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4`}>
          <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border-2 transition-all duration-500 backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800/95 via-gray-800/90 to-gray-900/95 border-gray-600/50 text-white shadow-gray-900/30' 
              : 'bg-gradient-to-br from-white/95 via-white/90 to-[#f7f9fb]/95 border-[#e5e7eb]/50 text-[#222] shadow-[#e5e7eb]/30'
          }`}>
            {/* Header with icon and gradient background */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl gap-3 sm:gap-4 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50'
            }`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'} shadow-lg`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-left bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {t.transcriptionSummary}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.transcriptionSummarySubtitle}
                  </p>
                </div>
              </div>
              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(
                  allSummaries[resultLang] ||
                  transcriptionSummary ||
                  demoSummaryContent[selectedLanguage] ||
                  demoSummaryContent['en'] ||
                  '',
                  'summary'
                )}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-xs sm:text-sm ${
                  isDarkMode 
                    ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30' 
                    : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300/50'
                }`}
              >
                {copyStatus['summary'] ? (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-500">{copyStatus['summary']}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{t.copyLabel}</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Content with enhanced styling */}
            <div className={`markdown-body text-left p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50' 
                : 'bg-gray-50/50 border border-gray-200/50'
            } shadow-inner`}>
              {isProcessing ? (
                <ProcessingAnimation stage={currentProcessingStage || 'formatting'} />
              ) : (
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-green-600 dark:text-green-400">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-green-500 dark:text-green-300">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-green-400 dark:text-green-200">{children}</h3>,
                    p: ({children}) => <p className="mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-green-600 dark:text-green-400">{children}</strong>,
                    em: ({children}) => <em className="italic text-green-500 dark:text-green-300">{children}</em>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 sm:mb-3 space-y-1 ml-3 sm:ml-4 text-sm sm:text-base">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 sm:mb-3 space-y-1 ml-3 sm:ml-4 text-sm sm:text-base">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className={`border-l-3 pl-2 sm:pl-3 py-1.5 sm:py-2 my-2 sm:my-3 italic text-sm sm:text-base ${
                        isDarkMode 
                          ? 'border-green-400 bg-green-900/10' 
                          : 'border-green-400 bg-green-50/50'
                      }`}>
                        {children}
                      </blockquote>
                    ),
                    code: ({children}) => (
                      <code className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono ${
                        isDarkMode 
                          ? 'bg-gray-700 text-green-300' 
                          : 'bg-gray-100 text-green-700'
                      }`}>
                        {children}
                      </code>
                    ),
                  }}
                >
                  {(() => {
                    const content = allSummaries[resultLang] ||
                      transcriptionSummary ||
                      demoSummaryContent[selectedLanguage] ||
                      demoSummaryContent['en'] ||
                      "# Loading...";
                    console.log('ReactMarkdown summary content:', content);
                    return content;
                  })()}
                </ReactMarkdown>
              )}
            </div>
            
            {/* Enhanced footer with metadata */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t gap-3 sm:gap-0 ${
              isDarkMode ? 'border-gray-600/30' : 'border-gray-300/30'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className={`p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentTime ? `${t.generatedAt} ${currentTime}` : t.generated}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/30' 
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300/50'
                }`}>
                  {selectedLanguage.toUpperCase()}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
}