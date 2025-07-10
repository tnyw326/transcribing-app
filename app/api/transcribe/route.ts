import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
 
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    console.error("❌ Missing API key");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }
  
  const response = await fetch('https://api.deepgram.com/v1/listen', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${deepgramApiKey!}`,
      'Content-Type': file.type,
    },
    body: buffer,
  });
  
  const result = await response.json();
  const transcript = result.results.channels[0].alternatives[0].transcript;

  return NextResponse.json({ text: transcript });
}