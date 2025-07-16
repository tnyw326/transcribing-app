import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const text = searchParams.get('text');
  const lang = searchParams.get('lang');
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set('url', url!);
  params.set('text', text ?? 'false');
  params.set('lang', lang ?? 'en');

  const res = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?${params}`,
    { headers: { 'x-api-key': process.env.SUPADATA_API_KEY! } }
  );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube transcript' }, { status: 500 });
  }
}