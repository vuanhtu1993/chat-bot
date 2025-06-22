import { ChatHistoryService } from '@/lib/db/chatHistory';
import { initializeMongoDBForAPI } from '@/lib/db/initMongoDB';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await initializeMongoDBForAPI();

    const data = await request.json();
    const { sessionId, role, content, userId } = data;

    const chatHistoryService = new ChatHistoryService();

    if (!sessionId) {
      // Create new session
      const newSessionId = await chatHistoryService.createSession(userId);
      console.log('New session created with ID:', newSessionId);

      // Save initial message if provided
      if (role && content) {
        await chatHistoryService.saveMessage(newSessionId, role, content, userId);
      }

      const savedSession = await chatHistoryService.getSession(newSessionId);
      return NextResponse.json({ ...savedSession, sessionId: newSessionId });
    } else {
      // Save message to existing session
      await chatHistoryService.saveMessage(sessionId, role, content, userId);
      return NextResponse.json({ success: true, sessionId });
    }
  } catch (error: any) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await initializeMongoDBForAPI();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const chatHistoryService = new ChatHistoryService();

    if (sessionId) {
      // Get messages for a specific session
      const messages = await chatHistoryService.getMessages(sessionId);
      return NextResponse.json({ messages });
    } else {
      // Get all sessions
      const sessions = await chatHistoryService.getSessions(userId || undefined);
      return NextResponse.json({ sessions });
    }
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
