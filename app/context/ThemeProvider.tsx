"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}>({
  isDarkMode: true,
  toggleDarkMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleDarkMode = () => setIsDarkMode((d) => !d);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty("--background", "#0a0a0a");
      root.style.setProperty("--foreground", "#ededed");
    } else {
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#171717");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
