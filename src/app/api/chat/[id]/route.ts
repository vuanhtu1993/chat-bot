import { NextResponse } from 'next/server';
import { ChatHistoryService } from '@/lib/db/chatHistory';
import { initializeMongoDBForAPI } from '@/lib/db/initMongoDB';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Initialize MongoDB connection at API start
    await initializeMongoDBForAPI();

    const sessionId = params.id;
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id;
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id;
    const { title } = await req.json();
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
