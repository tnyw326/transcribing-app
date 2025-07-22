import type { Metadata } from "next";
import { Geist, Geist_Mono, Tinos, Lusitana } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ThemeProvider from "./context/ThemeProvider";
import LanguageProvider from "./context/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lusitana = Lusitana({
  variable: "--font-lusitana",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "transcribe your videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tinos.variable} ${lusitana.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
