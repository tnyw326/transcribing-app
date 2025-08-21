// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // ensure Node runtime so req.signal is usable

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const signal = req.signal;

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const inputLanguage = String(form.get("inputLanguage") || "en");
    const outputLanguage = String(form.get("outputLanguage") || "en");

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // 1) Transcribe (pass signal)
    const transcription = await client.audio.transcriptions.create(
      {
        // The SDK supports Blob/File in Node >=18
        file,                             // File from formData
        model: "gpt-4o-transcribe",       // or "whisper-1" if that's what you use
        // language: inputLanguage,       // set if you rely on a language hint
      },
      { signal }
    );

    const originalText = transcription.text ?? "";

    // 2) Translate if output !== input (pass signal)
    let translatedText = originalText;
    if (outputLanguage !== inputLanguage && originalText) {
      const tr = await client.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Translate faithfully, preserve meaning and names." },
            { role: "user", content: `Translate to ${outputLanguage}:\n\n${originalText}` },
          ],
        },
        { signal }
      );
      translatedText = tr.choices[0]?.message?.content?.trim() || originalText;
    }

    // 3) Summarize (pass signal)
    const sr = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Summarize concisely and clearly." },
          { role: "user", content: translatedText || originalText },
        ],
      },
      { signal }
    );
    const summary = sr.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      original: translatedText || originalText,
      summary,
      translations: { [outputLanguage]: translatedText || originalText },
      summaries: { [outputLanguage]: summary },
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      // Client clicked "Stop"
      return new NextResponse("Client Closed Request", { status: 499 });
    }
    console.error("Transcribe route error:", err);
    return new NextResponse("Transcription failed", { status: 500 });
  }
}
