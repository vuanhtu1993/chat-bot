import { NextResponse } from 'next/server';
import { ChatHistoryService } from '@/lib/db/chatHistory';
import { initializeMongoDBForAPI } from '@/lib/db/initMongoDB';

export async function POST(req: Request) {
  try {
    // Initialize MongoDB connection at API start
    await initializeMongoDBForAPI();

    const chatHistoryService = new ChatHistoryService();
    const { sessionId, role, content, userId } = await req.json();

    if (!sessionId) {
      // Tạo session mới nếu chưa có
      const newSessionId = await chatHistoryService.createSession(userId);
      await chatHistoryService.saveMessage(newSessionId, role, content, userId);
      return NextResponse.json({ success: true, sessionId: newSessionId });
    }

    // Lưu tin nhắn vào session có sẵn
    await chatHistoryService.saveMessage(sessionId, role, content, userId);
    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Initialize MongoDB connection at API start
    await initializeMongoDBForAPI();

    const chatHistoryService = new ChatHistoryService();
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    // Nếu có sessionId, trả về tin nhắn của session đó
    if (sessionId) {
      const messages = await chatHistoryService.getMessages(sessionId);
      return NextResponse.json({ messages });
    }

    // Nếu không có sessionId, trả về danh sách sessions
    const userId = url.searchParams.get('userId') || undefined;
    const sessions = await chatHistoryService.getSessions(userId);
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
