"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRemoveFile = () => setSelectedFile(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)] bg-blue-100 text-center">

      <div className="text-black items-center justify-items-center">
        <p className="text-5xl font-extrabold ">Convert video to text for free!</p>
        <p>High accuracy and 200+ languages</p>
      </div>
      <div className="text-black flex flex-col lg:flex-row w-full lg:w-[960px] lg:h-[500px] h-[800px] gap-0">
        {/* Video File Card */}
        <div
          className={`flex flex-col items-center justify-center bg-gray-100 w-full lg:w-1/2 lg:mr-5 h-1/2 lg:h-full mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 border-dotted transition-colors duration-200 ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <h2 className="absolute top-4 text-3xl font-bold text-black pt-10">Transcribe a video file</h2>
          <div className="flex flex-col items-center justify-center gap-5 mt-20 w-full relative h-full pt-0">
            {selectedFile ? (
              <div className="text-center w-full flex flex-col items-center gap-1 relative">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-green-600 font-semibold mt-10 lg:mt-0">✓ File selected</p>
                  <button
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                    className="ml-1 p-1 rounded-full hover:bg-gray-200 transition-colors  mt-10 lg:mt-0"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 hover:text-red-500">
                      <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.415L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                <p className="text-sm text-gray-700 font-semibold mt-2">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 mt-2">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Drop or upload your video here</p>
            )}
            <button
              onClick={selectedFile ? undefined : handleUploadClick}
              className={`text-white p-3 rounded-full w-[150px] cursor-pointer font-extrabold transition-colors ${
                selectedFile
                  ? 'bg-green-500 hover:bg-green-400 mb-40'
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              {selectedFile ? 'Transcribe' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {!selectedFile && (
              <p className="text-gray-400 text-xs mt-2">Supported formats: mp4, mov, avi, mkv, etc.</p>
            )}
            {/* Video Preview at the bottom */}
            {selectedFile && (
              <div className="absolute left-0 right-0 bottom-6 flex justify-center">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className="rounded-xl shadow-lg max-h-32 w-auto border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
        {/* YouTube Card */}
        <div className="flex flex-col items-center pt-17 bg-gray-100 w-full lg:w-1/2 h-1/2 lg:h-full mb-5 lg:mt-0 rounded-3xl gap-5 relative p-6 border-4 border-gray-300">
          <h2 className="absolute top-4 text-3xl font-bold text-black pt-10">Transcribe a YouTube video</h2>
          <div className="flex flex-col items-center justify-center gap-5 mt-10 w-full pt-20">
            <div className="text-center w-full">
              <input
                type="text"
                placeholder="Paste YouTube link here"
                className="w-full max-w-md p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
            </div>
            <button
              className="text-white bg-blue-500 p-3 rounded-full w-[150px] cursor-pointer hover:bg-blue-400 font-extrabold"
            >
              Transcribe
            </button>
            <p className="text-gray-400 text-xs mt-2">Paste a YouTube link to transcribe its audio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}