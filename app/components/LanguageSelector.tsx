import React from "react";

interface Language {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isDarkMode: boolean;
  languages: Language[];
}

export default function LanguageSelector({
  value,
  onChange,
  isDarkMode,
  languages,
}: LanguageSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`appearance-none rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-lg transition-colors duration-200 ${
          isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
        }`}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
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
      </div>
    </div>
  );
}
