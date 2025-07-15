import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//   const videoId = request.nextUrl.searchParams.get('videoId');
//   if (!videoId) {
//     return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
//   }

//   const apiKey = process.env.YOUTUBE_API_KEY;
//   if (!apiKey) {
//     return NextResponse.json({ error: 'YouTube API key is required' }, { status: 500 });
//   }

//   const response = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`);
//   const data = await response.json();

//   return NextResponse.json(data);
// }


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const text = searchParams.get('text');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  
  const params = new URLSearchParams();
  params.set('url', url!);
  params.set('text', text!);

  const res = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?${params}`,
    { headers: { 'x-api-key': process.env.SUPADATA_API_KEY! } }
  );

  const data = await res.json();
  return NextResponse.json(data);
}