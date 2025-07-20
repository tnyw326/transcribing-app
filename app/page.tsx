"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import fs from "fs";
import OpenAI from "openai";
import { useTheme } from "./context/ThemeProvider";
import { useLanguage } from "./context/LanguageProvider";

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
    languageSelector:
      "Please select the language of the input and output video.",
    inputLanguage: "Input Language",
    outputLanguage: "Output Language",
    original: "Original",
    summary: "Summary",
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
    transcriptionSummary: "总结结果：",
    languageSelector: "请选择输入和输出视频的语言。",
    inputLanguage: "视频语言",
    outputLanguage: "输出语言",
    original: "原文",
    summary: "总结",
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
    pasteYouTubeDescription:
      "YouTubeリンクを貼り付けて音声を文字起こしします。",
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
    ja: "日本語",
  },
};

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isTranscribingVideo, setIsTranscribingVideo] = useState(false);
  const [isTranscribingYouTube, setIsTranscribingYouTube] = useState(false);
  const [transcriptionOriginal, setTranscriptionOriginal] =
    useState<string>("");
  const [transcriptionSummary, setTranscriptionSummary] = useState<string>("");
  const [allTranslations, setAllTranslations] = useState<{
    [key: string]: string;
  }>({});
  const [allSummaries, setAllSummaries] = useState<{ [key: string]: string }>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputLanguage, setInputLanguage] = useState("en");
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [resultMode, setResultMode] = useState("original"); // "original" or "summary"
  const [resultLang, setResultLang] = useState("en"); // "en", "zh", "ja"
  const [youtubeError, setYoutubeError] = useState("");
  const [youtubeLanguage, setYoutubeLanguage] = useState("en");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    { code: "zu", name: "Zulu" },
  ];

  // Get current translations based on selected language
  const t =
    translations[currentLanguage as keyof typeof translations] ||
    translations.en;

  // Check if video is uploaded
  const isVideoUploaded = selectedFile !== null && isFileSelected;
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
    const videoFile = files.find((file) => file.type.startsWith("video/"));

    if (videoFile) {
      setSelectedFile(videoFile);
      setIsFileSelected(true);
    } else {
      alert(t.pleaseSelectValidVideo);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setIsFileSelected(true);
      setYoutubeError("");
      setTranscriptionOriginal("");
      setTranscriptionSummary("");
      setAllTranslations({});
      setAllSummaries({});
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

    setIsTranscribingVideo(true);
    setTranscriptionOriginal("");
    setTranscriptionSummary("");
    setAllTranslations({});
    setAllSummaries({});

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("inputLanguage", inputLanguage);
      formData.append("outputLanguage", outputLanguage);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscriptionOriginal(data.original);
      setTranscriptionSummary(data.summary);
      setAllTranslations(data.translations || {});
      setAllSummaries(data.summaries || {});
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Transcription failed. Please try again.");
    } finally {
      setIsTranscribingVideo(false);
    }
  };

  const handleTranscribeYouTube = async () => {
    const url = urlInputRef.current?.value;
    if (!url) {
      setYoutubeError("No link is provided");
      return;
    }

    const YOUTUBE_VIDEO_REGEX =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    if (!YOUTUBE_VIDEO_REGEX.test(url)) {
      setYoutubeError("Please provide a valid YouTube video link");
      return;
    }

    setIsFileSelected(false);
    setSelectedFile(null);
    setYoutubeError("");
    setIsTranscribingYouTube(true);
    // setIsFileSelected(false);
    // setSelectedFile(null);

    try {
      const response = await fetch(
        `/api/youtube-captions?url=${url}&text=true&lang=${youtubeLanguage}`
      );
      const data = await response.json();
      const captions = data.content || data.details || data.message;
      const paragraph = captions.replace(/\n+/g, " ");

      setTranscriptionOriginal(paragraph);
      setAllTranslations({
        en: paragraph,
        zh: "此功能目前不适用于 YouTube 视频。",
        ja: "この機能は現在 YouTube 動画ではご利用いただけません。",
      });
      setTranscriptionSummary(
        "This feature is currently not available for YouTube videos."
      );
      setAllSummaries({
        en: "This feature is currently not available for YouTube videos.",
        zh: "此功能目前不适用于 YouTube 视频。",
        ja: "この機能は現在 YouTube 動画ではご利用いただけません。",
      });
    } catch (error) {
      console.error("YouTube transcription error:", error);
      setYoutubeError("Failed to transcribe video. Please try again.");
    } finally {
      setIsTranscribingYouTube(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 gap-16 font-[family-name:var(--font-inter)] ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-[#f7f9fb] text-[#222]"
      } text-center relative transition-colors duration-300`}
    >
      <div
        className={`items-center justify-items-center ${
          isDarkMode ? "text-white" : "text-[#222]"
        }`}
      >
        {/* Icons above the title */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Video icon */}
          <div
            className={`p-4 rounded-full ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <svg
              className="w-8 h-8 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Arrow icon */}
          <div
            className={`p-2 rounded-full ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* Text icon */}
          <div
            className={`p-4 rounded-full ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <svg
              className="w-8 h-8 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h4a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <p className="text-5xl font-extrabold">{t.title}</p>
        <p className="text-2xl font-normal">{t.subtitle}</p>
      </div>
      <div
        className={`flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-5 ${
          isDarkMode ? "text-white" : "text-[#222]"
        }`}
      >
        {/* Video File Card */}
        <div
          className={`flex flex-col items-center justify-center w-full ${
            isVideoUploaded ? "lg:w-1/3" : "lg:w-1/2"
          } lg:h-[485px] h-[485px] mb-5 lg:mb-0 rounded-3xl gap-5 relative p-6 border-4 border-dotted transition-colors duration-200 ${
            isDragOver
              ? isDarkMode
                ? "border-blue-400 bg-blue-900/20"
                : "border-[#2563eb] bg-[#e8f0fe]"
              : selectedFile
              ? isDarkMode
                ? "border-green-400 bg-green-900/20"
                : "border-[#22c55e] bg-[#e7fbe9]"
              : isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-[#e5e7eb] bg-white shadow-lg"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center w-full h-full">
            {/* Title */}
            <h2
              className={`text-3xl font-bold pt-10 ${
                isDarkMode ? "text-white" : "text-[#222]"
              }`}
            >
              {t.transcribeVideoFile}
            </h2>
            {/* Language Selectors */}
            <div className="flex flex-row mb-10 w-full items-center">
              {/* Input Language Selector */}
              <div className="flex flex-col w-full items-center">
                <label className="text-sm font-semibold pt-10 mb-1 relative">
                  {t.inputLanguage}
                </label>
                <select
                  value={inputLanguage}
                  onChange={(e) => setInputLanguage(e.target.value)}
                  className={`rounded-lg p-3 border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              {/* Output Language Selector */}
              <div className="flex flex-col w-full items-center">
                <label className="text-sm font-semibold pt-10 mb-1 relative">
                  {t.outputLanguage}
                </label>
                <select
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className={`rounded-lg p-3 border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
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
                  <p className="text-green-600 font-semibold mt-0">
                    {t.fileSelected}
                  </p>
                  <button
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                    className={`ml-1 p-1 rounded-full transition-colors mt-0 ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-gray-400 hover:text-red-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 8.586l4.95-4.95a1 1 0 111.414 1.415L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                  <p
                    className={`text-sm font-semibold mt-5 ${
                      isDarkMode ? "text-gray-300" : "text-[#374151]"
                    }`}
                  >
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-[#64748b]"
                  }`}
                >
                  {t.dropOrUpload}
                </p>
              </div>
            )}

            {/* Spacer to push button to bottom 20% */}
            <div className="flex-1"></div>
            <button
              onClick={selectedFile ? handleTranscribe : handleUploadClick}
              className={`text-white p-3 rounded-full w-[150px] cursor-pointer font-extrabold transition-colors flex items-center justify-center gap-2 ${
                selectedFile
                  ? "bg-[#22c55e] hover:bg-[#16a34a]"
                  : "bg-[#2563eb] hover:bg-[#1d4ed8]"
              } ${isTranscribingVideo ? "animate-pulse" : ""}`}
              disabled={isTranscribingVideo}
            >
              {isTranscribingVideo && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isTranscribingVideo
                ? t.transcribing
                : selectedFile
                ? t.transcribe
                : t.upload}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-full flex justify-center mt-5">
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-500" : "text-[#94a3b8]"
                }`}
              >
                {t.supportedFormats}
              </p>
            </div>
          </div>
        </div>
        {/* YouTube Card */}
        <div
          className={`flex flex-col items-center w-full ${
            isVideoUploaded ? "lg:w-1/3" : "lg:w-1/2"
          } h-[485px] mb-5 lg:mb-0 rounded-3xl gap-5 relative p-6 border-4 ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-[#e5e7eb] shadow-lg"
          }`}
        >
          <h2
            className={`text-3xl font-bold pt-10 ${
              isDarkMode ? "text-white" : "text-[#222]"
            }`}
          >
            {t.transcribeYouTube}
          </h2>
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full flex justify-center">
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-blue-600 hover:underline text-md font-medium ${
                  isDarkMode ? "dark:text-green-600" : ""
                }`}
              >
                https://www.youtube.com/
              </a>
            </div>
            <div className="text-center w-full">
              <input
                ref={urlInputRef}
                type="text"
                placeholder={t.pasteYouTubeLink}
                className={`w-full max-w-md p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-[#e5e7eb] text-[#374151] placeholder-[#94a3b8]"
                }`}
                onChange={() => setYoutubeError("")}
              />
              <p
                className={`mt-2 text-xs ${
                  youtubeError ? "text-red-500" : "invisible"
                }`}
              >
                {youtubeError || "placeholder"}
              </p>
            </div>
          </div>
          {/* Language Dropdown */}
          <div className="flex flex-col items-center w-full mt-2">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-semibold">
                {t.outputLanguage}
              </label>
              <div className="relative group">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold cursor-help ${
                    isDarkMode
                      ? "bg-gray-600 text-gray-300"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  ?
                </div>
                <div
                  className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 leading-tight whitespace-nowrap ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-200 border border-gray-600"
                      : "bg-gray-100 text-black border border-gray-300"
                  }`}
                >
                  Note: Please select a language that captions are available{" "}
                  <br />
                  in for the video. Otherwise, the result will be in English{" "}
                  <br />
                  or the first available caption language for that video.
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                      isDarkMode ? "border-t-gray-800" : "border-t-gray-100"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            <div className="relative w-full max-w-md" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full rounded-lg p-3 border text-left flex justify-between items-center ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <span>
                  {youtubeLanguages.find(
                    (lang) => lang.code === youtubeLanguage
                  )?.name || "English"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div
                  className={`absolute z-10 w-full mt-1 rounded-lg border max-h-48 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  } shadow-lg`}
                >
                  {/* Search Input */}
                  <div className="sticky top-0 p-2 border-b border-gray-300 dark:border-gray-600 bg-inherit">
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-700 placeholder-gray-500"
                      }`}
                      autoFocus
                    />
                  </div>
                  {/* Filtered Languages */}
                  <div className="overflow-y-auto max-h-36">
                    {youtubeLanguages
                      .filter(
                        (language) =>
                          language.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          language.code
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((language) => (
                        <button
                          key={language.code}
                          type="button"
                          onClick={() => {
                            setYoutubeLanguage(language.code);
                            setIsDropdownOpen(false);
                            setSearchTerm("");
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                            isDarkMode ? "hover:bg-gray-600" : ""
                          } ${
                            youtubeLanguage === language.code
                              ? isDarkMode
                                ? "bg-gray-600"
                                : "bg-gray-100"
                              : ""
                          }`}
                        >
                          {language.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spacer to push button to bottom 20% */}
          <div className="flex-1"></div>
          <button
            className={`text-white bg-[#22c55e] hover:bg-[#16a34a] p-3 rounded-full w-[150px] cursor-pointer font-extrabold transition-colors flex items-center justify-center gap-2 ${
              isTranscribingYouTube ? "animate-pulse" : ""
            }`}
            onClick={handleTranscribeYouTube}
            disabled={isTranscribingYouTube}
          >
            {isTranscribingYouTube && (
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isTranscribingYouTube ? t.transcribing : t.transcribe}
          </button>
          <div className="w-full flex justify-center">
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-500" : "text-[#94a3b8]"
              }`}
            >
              {t.pasteYouTubeDescription}
            </p>
          </div>
        </div>
        {/* Video Preview Card - Appears after file upload */}
        {isVideoUploaded && (
          <div
            className={`flex flex-col items-center justify-center w-full lg:w-1/3 h-[485px] mb-5 lg:mb-0 rounded-3xl gap-5 relative p-6 border-4 ${
              isDarkMode
                ? "bg-gray-800 border-gray-600"
                : "bg-white border-[#e5e7eb] shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-5 w-full">
              <h2
                className={`text-3xl font-bold text-center ${
                  isDarkMode ? "text-white" : "text-[#222]"
                }`}
              >
                Video Preview
              </h2>
              <div className="w-full">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className={`rounded-xl shadow-lg max-h-64 w-auto border mx-auto block ${
                    isDarkMode ? "border-gray-600" : "border-gray-300"
                  }`}
                />
              </div>
              <div className="text-center w-full">
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-[#374151]"
                  }`}
                >
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Original | Summary Toggle - Show when transcription is complete OR for demo */}
      {(transcriptionOriginal || transcriptionSummary || !isVideoUploaded) && (
        <div
          className={`w-full max-w-7xl mx-auto flex flex-row justify-end items-center mt-1`}
        >
          {/* Original | Summary Toggle */}
          <div className="flex items-center gap-1 mr-8">
            <button
              className={`px-6 py-3 rounded-l-xl border-2 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultMode === "original"
                  ? "bg-red-400 text-white border-red-400 shadow-red-400/25"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  : "bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f1f5f9]"
              }`}
              onClick={() => setResultMode("original")}
            >
              {t.original}
            </button>
            <button
              className={`px-6 py-3 rounded-r-xl border-2 border-l-0 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                resultMode === "summary"
                  ? "bg-red-400 text-white border-red-400 shadow-red-400/25"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  : "bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f1f5f9]"
              }`}
              onClick={() => setResultMode("summary")}
            >
              {t.summary}
            </button>
          </div>
        </div>
      )}
      {/* Transcription Result */}
      {resultMode === "original" && (
        <div className={`w-full max-w-7xl mx-auto`}>
          <div
            className={`p-8 rounded-3xl shadow-xl border-2 transition-all duration-300 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 text-white shadow-gray-900/50"
                : "bg-gradient-to-br from-white to-[#f7f9fb] border-[#e5e7eb] text-[#222] shadow-[#e5e7eb]/50"
            }`}
          >
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-2 rounded-full ${
                  isDarkMode ? "bg-blue-600/20" : "bg-blue-100"
                }`}
              >
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-2xl">{t.transcriptionOriginal}</h3>
            </div>

            {/* Content */}
            <div
              className={`p-6 rounded-2xl ${
                isDarkMode ? "bg-gray-700/50" : "bg-[#f1f5f9]"
              }`}
            >
              <div className="prose prose-lg max-w-none">
                <p
                  className={`text-lg leading-relaxed whitespace-pre-wrap ${
                    isDarkMode ? "text-gray-100" : "text-[#374151]"
                  }`}
                >
                  {transcriptionOriginal
                    ? allTranslations[resultLang] || transcriptionOriginal
                    : resultLang === "en"
                    ? "This is a demo transcription result. Upload a video file to see the actual transcription of your content. The transcription will appear here with proper formatting and structure."
                    : resultLang === "zh"
                    ? "这是一个演示转录结果。上传视频文件以查看您内容的实际转录。转录将在此处显示，具有适当的格式和结构。"
                    : "これはデモの文字起こし結果です。ビデオファイルをアップロードして、コンテンツの実際の文字起こしを確認してください。文字起こしは適切なフォーマットと構造でここに表示されます。"}
                </p>
              </div>
            </div>

            {/* Footer with metadata */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-300/30">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {/* <span>Generated at {new Date().toLocaleTimeString()}</span> */}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? "bg-blue-600/20 text-blue-300"
                      : "bg-[#e8f0fe] text-[#2563eb]"
                  }`}
                >
                  {resultLang.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {resultMode === "summary" && (
        <div className={`w-full max-w-7xl mx-auto`}>
          <div
            className={`p-8 rounded-3xl shadow-xl border-2 transition-all duration-300 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 text-white shadow-gray-900/50"
                : "bg-gradient-to-br from-white to-[#f7f9fb] border-[#e5e7eb] text-[#222] shadow-[#e5e7eb]/50"
            }`}
          >
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-2 rounded-full ${
                  isDarkMode ? "bg-green-600/20" : "bg-green-100"
                }`}
              >
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-2xl">{t.transcriptionSummary}</h3>
            </div>

            {/* Content */}
            <div
              className={`p-6 rounded-2xl ${
                isDarkMode ? "bg-gray-700/50" : "bg-[#f1f5f9]"
              }`}
            >
              <div className="prose prose-lg max-w-none">
                <div
                  className={`text-lg leading-relaxed whitespace-pre-wrap ${
                    isDarkMode ? "text-gray-100" : "text-[#374151]"
                  }`}
                >
                  {allSummaries[resultLang] || transcriptionSummary
                    ? allSummaries[resultLang] || transcriptionSummary
                    : resultLang === "en"
                    ? "This is a demo summary result. Upload a video file to see the actual summary of your content. The summary will provide a concise overview of the main points and key information from your video."
                    : resultLang === "zh"
                    ? "这是一个演示总结结果。上传视频文件以查看您内容的实际总结。总结将提供视频中要点和关键信息的简明概述。"
                    : "これはデモの要約結果です。ビデオファイルをアップロードして、コンテンツの実際の要約を確認してください。要約は、ビデオの要点と重要な情報の簡潔な概要を提供します。"}
                </div>
              </div>
            </div>

            {/* Footer with metadata */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-300/30">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Generated at {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? "bg-green-600/20 text-green-300"
                      : "bg-[#e7fbe9] text-[#22c55e]"
                  }`}
                >
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
