import { ChatHistoryService } from '@/lib/db/chatHistory';
import { initializeMongoDBForAPI } from '@/lib/db/initMongoDB';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await initializeMongoDBForAPI();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    const chatHistoryService = new ChatHistoryService();

    const session = await chatHistoryService.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await initializeMongoDBForAPI();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    const chatHistoryService = new ChatHistoryService();

    await chatHistoryService.deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await initializeMongoDBForAPI();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { title } = data;
    const chatHistoryService = new ChatHistoryService();

    await chatHistoryService.updateSessionTitle(sessionId, title);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: 500 }
    );
  }
}
