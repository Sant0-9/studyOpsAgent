import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error auto-saving session:', error);
    return NextResponse.json({ error: 'Failed to auto-save session' }, { status: 500 });
  }
}
