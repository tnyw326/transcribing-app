// app/api/youtube-captions/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "";
  const lang = searchParams.get("lang") || "en";
  const asText = searchParams.get("text") === "true";
  const signal = req.signal;

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    // Replace with your actual captions source
    const r = await fetch(
      `https://your-caption-service.example/captions?url=${encodeURIComponent(url)}&lang=${encodeURIComponent(lang)}&text=${asText}`,
      { signal }
    );

    if (!r.ok) {
      return new NextResponse("Failed to fetch captions", { status: 500 });
    }

    const data = await r.json();
    return NextResponse.json(data);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return new NextResponse("Client Closed Request", { status: 499 });
    }
    console.error("YouTube captions route error:", err);
    return new NextResponse("Failed to fetch captions", { status: 500 });
  }
}
