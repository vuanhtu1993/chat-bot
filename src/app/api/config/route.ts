import { NextResponse } from 'next/server';

export async function GET() {
  // Only return non-sensitive configuration
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGoogleSearch: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX),
    hasBingSearch: !!process.env.BING_API_KEY,
  });
}
