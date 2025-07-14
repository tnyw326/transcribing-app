"use client";
import { useState, useRef } from "react";
import Link from 'next/link';

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
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
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else if (file) {
      alert('Please select a valid video file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  async function handleTranscribeClick(selectedFile: File) {
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server error:", text);
        return;
      }
      
      const result = await response.json();
      console.log(result.text);
    } catch (error) {
      console.error("Transcription error:", error);
    } finally {
      resetToOriginalState();
    }
  }

  const handleRemoveFile = () => setSelectedFile(null);

  const resetToOriginalState = () => {
    setSelectedFile(null);
    setIsTranscribing(false);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-8 gap-16 font-[family-name:var(--font-lusitana)] ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-blue-100 text-black'} text-center relative transition-colors duration-300`}>
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
        <p className="text-5xl font-extrabold">Convert video to text for free!</p>
        <p className="text-2xl font-normal">High accuracy and 200+ languages</p>
      </div>
      <div className={`flex flex-col lg:flex-row w-full lg:w-[960px] lg:h-[500px] h-[800px] gap-0 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        {/* Video File Card */}
        <div
          className={`flex flex-col items-center justify-center w-full lg:w-1/2 lg:mr-5 h-1/2 lg:h-full mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 border-dotted transition-colors duration-200 ${
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
          <h2 className={`absolute top-4 text-3xl font-bold pt-10 ${isDarkMode ? 'text-white' : 'text-black'}`}>Transcribe a video file</h2>
          <div className="flex flex-col items-center justify-center gap-5 mt-20 w-full relative h-full pt-0">
            {selectedFile ? (
              <div className="text-center w-full flex flex-col items-center gap-1 relative">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-green-600 font-semibold mt-10 lg:mt-0">✓ File selected</p>
                  <button
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                    className={`ml-1 p-1 rounded-full transition-colors mt-10 lg:mt-0 ${
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
                <p className={`text-sm font-semibold mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-2">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Drop or upload your video here</p>
            )}
            <button
              onClick={selectedFile ? () => handleTranscribeClick(selectedFile) : handleUploadClick}
              disabled={isTranscribing}
              className={`text-white p-3 rounded-full w-[150px] cursor-pointer font-extrabold transition-colors ${
                selectedFile
                  ? isTranscribing 
                    ? 'bg-gray-400 cursor-not-allowed mb-40'
                    : 'bg-green-500 hover:bg-green-400 mb-40'
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              {selectedFile 
                ? isTranscribing 
                  ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Transcribing...</span>
                    </div>
                  )
                  : 'Transcribe' 
                : 'Upload'
              }
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {!selectedFile && (
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Supported formats: mp4, mov, avi, mkv, etc.</p>
            )}
            {/* Video Preview at the bottom */}
            {selectedFile && (
              <div className="absolute left-0 right-0 bottom-6 flex justify-center">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className={`rounded-xl shadow-lg max-h-32 w-auto border ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
        {/* YouTube Card */}
        <div className={`flex flex-col items-center pt-17 w-full lg:w-1/2 h-1/2 lg:h-full mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'
        }`}>
          <h2 className={`absolute top-4 text-3xl font-bold pt-10 ${isDarkMode ? 'text-white' : 'text-black'}`}>Transcribe a YouTube video</h2>
          <div className="w-full flex justify-center mt-10">
            <Link
              href={{
                pathname: '/transcribe',
                query: {
                  url: 'https://www.youtube.com/'
                }
              }}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              https://www.youtube.com/
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center gap-5 mt- w-full pt-20">
            <div className="text-center w-full">
              <input
                type="text"
                placeholder="Paste YouTube link here"
                className={`w-full max-w-md p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
            </div>
            <button
              className="text-white bg-blue-500 p-3 rounded-full w-[150px] cursor-pointer hover:bg-blue-400 font-extrabold"
            >
              Transcribe
            </button>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Paste a YouTube link to transcribe its audio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}