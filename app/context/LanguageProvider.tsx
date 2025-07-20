"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const LanguageContext = createContext<{
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
}>({
  currentLanguage: "en",
  setCurrentLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
