"use client";
import { useState, useRef } from "react";
import Link from 'next/link';
import fs from 'fs';
import OpenAI from 'openai';

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
      pasteYouTubeDescription: "Paste a YouTube link to transcribe its audio.",
      pleaseSelectValidVideo: "Please select a valid video file",
      transcriptionOriginal: "Transcription Result:",
      transcriptionSummary: "Summary Result:",
      languageSelector: "Please select the language of the input and output video.",
      inputLanguage: "Input Language",
      outputLanguage: "Output Language",
      original: "Original",
      summary: "Summary",
      en: "EN",
      zh: "CH",
      ja: "JA"
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
      transcriptionSummary: "总结结果：",
      languageSelector: "请选择输入和输出视频的语言。",
      inputLanguage: "视频语言",
      outputLanguage: "输出语言",
      original: "原文",
      summary: "总结",
      en: "英語",
      zh: "中文",
      ja: "日语"
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
      languageSelector: "動画の入力言語と出力言語を選択してください。",
      inputLanguage: "入力言語",
      outputLanguage: "出力言語",
      original: "原文",
      summary: "要約",
      en: "英語",
      zh: "中国語",
      ja: "日本語"
    }
  };

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionOriginal, setTranscriptionOriginal] = useState<string>("");
  const [transcriptionSummary, setTranscriptionSummary] = useState<string>("");
  const [allTranslations, setAllTranslations] = useState<{[key: string]: string}>({});
  const [allSummaries, setAllSummaries] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputLanguage, setInputLanguage] = useState("en");
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [resultMode, setResultMode] = useState("original"); // "original" or "summary"
  const [resultLang, setResultLang] = useState("en"); // "en", "zh", "ja"


  // Get current translations based on selected language
  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

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
    } else {
      alert(t.pleaseSelectValidVideo);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setIsFileSelected(true);
    } else if (file) {
      alert(t.pleaseSelectValidVideo);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTranscriptionOriginal("");
    setTranscriptionSummary("");
    setIsFileSelected(false);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    setIsTranscribing(true);
    setTranscriptionOriginal("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllSummaries({});

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('inputLanguage', inputLanguage);
      formData.append('outputLanguage', outputLanguage);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscriptionOriginal(data.original);
      setTranscriptionSummary(data.summary);
      setAllTranslations(data.translations || {});
      setAllSummaries(data.summaries || {});
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscribeYouTube = async () => {
    if (!selectedFile) return;

    setIsTranscribing(true);
    setTranscriptionOriginal("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllSummaries({});

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('inputLanguage', inputLanguage);
      formData.append('outputLanguage', outputLanguage);
      formData.append('resultLang', resultLang);
      formData.append('resultMode', resultMode);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscriptionOriginal(data.original);
      setTranscriptionSummary(data.summary);
      setAllTranslations(data.translations || {});
      setAllSummaries(data.summaries || {});
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-8 gap-16 font-[family-name:var(--font-inter)] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-blue-100 text-black'} text-center relative transition-colors duration-300`}>
      {/* Language Selector and Dark Mode Toggle - Top Right */}
      <div className="absolute top-8 right-8 z-10 flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-sm border border-gray-300 dark:border-gray-600`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        
        {/* Language Selector */}
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`appearance-none rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-colors duration-200 ${
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`items-center justify-items-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {/* Icons above the title */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Video icon */}
          <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Arrow icon */}
          <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          
          {/* Text icon */}
          <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <p className="text-5xl font-extrabold">{t.title}</p>
        <p className="text-2xl font-normal">{t.subtitle}</p>
      </div>
      <div className={`flex flex-col lg:flex-row w-full ${selectedFile ? 'lg:w-[1440px]' : 'lg:w-[1080px]'} lg:h-[485px] h-[940px] gap-5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {/* Video File Card */}
        <div
          className={`flex flex-col items-center justify-center w-full ${selectedFile ? 'lg:w-1/3' : 'lg:w-1/2'} lg:h-full h-[485px] mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 border-dotted transition-colors duration-200 ${
            isDragOver
              ? isDarkMode 
                ? 'border-blue-400 bg-blue-900/20' 
                : 'border-blue-500 bg-blue-50'
              : selectedFile
                ? isDarkMode 
                  ? 'border-green-400 bg-green-900/20' 
                  : 'border-green-600 bg-green-50'
                : isDarkMode 
                  ? 'border-gray-600 bg-gray-800' 
                  : 'border-gray-300 bg-gray-100'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center w-full h-full">
            {/* Title */}
            <h2 className={`text-3xl font-bold pt-10 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t.transcribeVideoFile}</h2>
            {/* Language Selectors */}
            <div className="flex flex-row mb-10 w-full items-center">
              {/* Input Language Selector */}
              <div className="flex flex-col w-full items-center">
                <label className="text-sm font-semibold pt-10 mb-1 relative">{t.inputLanguage}</label>
                <select
                  value={inputLanguage}
                  onChange={e => setInputLanguage(e.target.value)}
                  className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              {/* Output Language Selector */}
              <div className="flex flex-col w-full items-center">
                <label className="text-sm font-semibold pt-10 mb-1 relative">{t.outputLanguage}</label>
                <select
                  value={outputLanguage}
                  onChange={e => setOutputLanguage(e.target.value)}
                  className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
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
                <p className={`text-sm font-semibold mt-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.dropOrUpload}</p>
              </div>
            )}
            
            {/* Spacer to push button to bottom 20% */}
            <div className="flex-1"></div>
            <button
              onClick={selectedFile ? handleTranscribe : handleUploadClick}
              className={`text-white p-3 rounded-full w-[150px] cursor-pointer font-extrabold transition-colors ${
                selectedFile
                  ? 'bg-green-500 hover:bg-green-400'
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
              disabled={isTranscribing}
                          >
                {isTranscribing ? t.transcribing : selectedFile ? t.transcribe : t.upload}
              </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-full flex justify-center mt-5">
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.supportedFormats}</p>
            </div>
          </div>
        </div>
        {/* YouTube Card */}
        <div className={`flex flex-col items-center ${selectedFile ? 'lg:w-1/3' : 'lg:w-1/2'} h-[485px] mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'
        }`}>
          <h2 className={`text-3xl font-bold pt-10 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t.transcribeYouTube}</h2>
          <div className="w-full flex justify-center">
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 hover:underline text-md font-medium ${isDarkMode ? 'dark:text-green-600' : ''}`}
            >
              https://www.youtube.com/
            </a>
          </div>
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-center w-full">
              <input
                type="text"
                placeholder={t.pasteYouTubeLink}
                className={`w-full max-w-md p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
            </div>
          </div>
          
          {/* Spacer to push button to bottom 20% */}
          <div className="flex-1"></div>
          <button
            className="text-white bg-blue-500 p-3 rounded-full w-[150px] cursor-pointer font-extrabold transition-colors"
          >
            {t.transcribe}
          </button>
          <div className="w-full flex justify-center">
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.pasteYouTubeDescription}</p>
          </div>
        </div>
        {/* Video Preview Card - Appears after file upload */}
        {selectedFile && (
          <div className={`flex flex-col items-center justify-center w-full lg:w-1/3 h-[485px] mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'
          }`}>
            <div className="flex flex-col items-center justify-center gap-5 w-full">
              <h2 className={`text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Video Preview</h2>
              <div className="w-full">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className={`rounded-xl shadow-lg max-h-64 w-auto border mx-auto block ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                />
              </div>
              <div className="text-center w-full">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Original | Summary Toggle - Show when transcription is complete OR for demo */}
      {(transcriptionOriginal || transcriptionSummary || !selectedFile) && (
        <div className={`w-full mx-auto flex flex-row justify-end items-center mt-1 ${selectedFile ? 'lg:w-[1440px]' : 'lg:w-[960px]'}`}>
          {/* Original | Summary Toggle */}
          <div className="flex items-center gap-1 mr-8">
            <button
              className={`px-6 py-3 rounded-l-xl border-2 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultMode === "original" 
                  ? (isDarkMode ? "bg-red-400 text-white border-red-400 shadow-red-400/25" : "bg-blue-500 text-white border-blue-500 shadow-blue-500/25")
                  : (isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
              }`}
              onClick={() => setResultMode("original")}
            >
              {t.original}
            </button>
            <button
              className={`px-6 py-3 rounded-r-xl border-2 border-l-0 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultMode === "summary" 
                  ? (isDarkMode ? "bg-red-400 text-white border-red-400 shadow-red-400/25" : "bg-blue-500 text-white border-blue-500 shadow-blue-500/25")
                  : (isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
              }`}
              onClick={() => setResultMode("summary")}
            >
              {t.summary}
            </button>
          </div>
          {/* EN | CH | JA Toggle */}
          <div className="flex items-center gap-1">
            <button
              className={`px-6 py-3 rounded-l-xl border-2 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultLang === "en" 
                  ? (isDarkMode ? "bg-red-400 text-white border-red-400 shadow-red-400/25" : "bg-blue-500 text-white border-blue-500 shadow-blue-500/25")
                  : (isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
              }`}
              onClick={() => setResultLang("en")}
            >
              {t.en}
            </button>
            <button
              className={`px-6 py-3 border-2 border-l-0 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultLang === "zh" 
                  ? (isDarkMode ? "bg-red-400 text-white border-red-400 shadow-red-400/25" : "bg-blue-500 text-white border-blue-500 shadow-blue-500/25")
                  : (isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
              }`}
              onClick={() => setResultLang("zh")}
            >
              {t.zh}
            </button>
            <button
              className={`px-6 py-3 rounded-r-xl border-2 border-l-0 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultLang === "ja" 
                  ? (isDarkMode ? "bg-red-400 text-white border-red-400 shadow-red-400/25" : "bg-blue-500 text-white border-blue-500 shadow-blue-500/25")
                  : (isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
              }`}
              onClick={() => setResultLang("ja")}
            >
              {t.ja}
            </button>
          </div>
        </div>
      )}
      {/* Transcription Result */}
      {resultMode === "original" && (transcriptionOriginal || Object.keys(allTranslations).length > 0 || !selectedFile) && (
        <div className={`w-full mx-auto ${selectedFile ? 'lg:w-[1440px]' : 'lg:w-[960px]'}`}>
          <div className={`p-8 rounded-3xl shadow-xl border-2 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 text-white shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 text-gray-800 shadow-gray-200/50'
          }`}>
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl">{t.transcriptionOriginal}</h3>
            </div>
            
            {/* Content */}
            <div className={`p-6 rounded-2xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="prose prose-lg max-w-none">
                <p className={`text-lg leading-relaxed whitespace-pre-wrap ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-700'
                }`}>
                  {!selectedFile 
                    ? (resultLang === "en" 
                        ? "This is a demo transcription result. Upload a video file to see the actual transcription of your content. The transcription will appear here with proper formatting and structure."
                        : resultLang === "zh"
                        ? "这是一个演示转录结果。上传视频文件以查看您内容的实际转录。转录将在此处显示，具有适当的格式和结构。"
                        : "これはデモの文字起こし結果です。ビデオファイルをアップロードして、コンテンツの実際の文字起こしを確認してください。文字起こしは適切なフォーマットと構造でここに表示されます。"
                      )
                    : (allTranslations[resultLang] || transcriptionOriginal)
                  }
                </p>
              </div>
            </div>
            
            {/* Footer with metadata */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-300/30">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Generated at {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  {resultLang.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {resultMode === "summary" && (transcriptionSummary || Object.keys(allSummaries).length > 0 || !selectedFile) && (
        <div className={`w-full mx-auto ${selectedFile ? 'lg:w-[1440px]' : 'lg:w-[960px]'}`}>
          <div className={`p-8 rounded-3xl shadow-xl border-2 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 text-white shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 text-gray-800 shadow-gray-200/50'
          }`}>
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl">{t.transcriptionSummary}</h3>
            </div>
            
            {/* Content */}
            <div className={`p-6 rounded-2xl ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="prose prose-lg max-w-none">
                <div className={`text-lg leading-relaxed whitespace-pre-wrap ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-700'
                }`}>
                  {!selectedFile 
                    ? (resultLang === "en" 
                        ? "This is a demo summary result. Upload a video file to see the actual summary of your content. The summary will provide a concise overview of the main points and key information from your video."
                        : resultLang === "zh"
                        ? "这是一个演示总结结果。上传视频文件以查看您内容的实际总结。总结将提供视频中要点和关键信息的简明概述。"
                        : "これはデモの要約結果です。ビデオファイルをアップロードして、コンテンツの実際の要約を確認してください。要約は、ビデオの要点と重要な情報の簡潔な概要を提供します。"
                      )
                    : (allSummaries[resultLang] || transcriptionSummary)
                  }
                </div>
              </div>
            </div>
            
            {/* Footer with metadata */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-300/30">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Generated at {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-green-600/20 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  {resultLang.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}