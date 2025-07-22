"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "../context/ThemeProvider";
import { useLanguage } from "../context/LanguageProvider";
import LanguageSelector from "./LanguageSelector";

const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
];

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Log in", href: "/login" },
    { label: "Subscription", href: "/subscription" },
  ];

  return (
    <nav
      className={`w-full px-4 py-2 flex items-center justify-between shadow-md border-b ${
        isDarkMode
          ? "bg-[#10172a] text-[#e0e7ef] border-[#223056]"
          : "bg-white text-[#1a202c] border-[#e2e8f0]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <span>Video2Text</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {/* Navigation Links */}
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`px-3 py-1 rounded font-medium transition-colors duration-150 ${
              pathname === link.href
                ? isDarkMode
                  ? "bg-[#223056] text-[#e0e7ef] opacity-100"
                  : "bg-[#f0f5ff] text-[#1a202c] opacity-100"
                : isDarkMode
                ? "text-[#e0e7ef] opacity-80 hover:bg-[#223056]"
                : "text-[#1a202c] opacity-80 hover:bg-[#f1f5ff]"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors duration-200 shadow ${
            isDarkMode
              ? "bg-[#223056] text-yellow-300 hover:bg-[#1a233a] border border-[#2d3a5a]"
              : "bg-[#f7fafc] text-[#1a202c] hover:bg-[#e2e8f0] border border-[#cbd5e1]"
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        {/* Language Selector */}
        <LanguageSelector
          value={currentLanguage}
          onChange={(e) => setCurrentLanguage(e.target.value)}
          isDarkMode={isDarkMode}
          languages={languages}
        />
      </div>
    </nav>
  );
}
