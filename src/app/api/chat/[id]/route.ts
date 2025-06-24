import { ChatHistoryService } from '@/database/chatHistory';
import { initializeMongoDBForAPI } from '@/database/initMongoDB';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await initializeMongoDBForAPI();
    const chatHistoryService = new ChatHistoryService();

    const session = await chatHistoryService.getSession(id);

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

/**
 * DELETE /api/chat/[id]
 * Delete a specific chat session and its messages
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await initializeMongoDBForAPI();
    const chatHistoryService = new ChatHistoryService();

    // Delete the session using the service
    const success = await chatHistoryService.deleteSession(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await initializeMongoDBForAPI();
    const data = await request.json();
    const { title } = data;
    const chatHistoryService = new ChatHistoryService();

    await chatHistoryService.updateSessionTitle(id, title);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: 500 }
    );
  }
}
