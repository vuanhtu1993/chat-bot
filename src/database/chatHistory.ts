import { ObjectId } from 'mongodb';
import { ChatSession, Message } from '@/types/chat.types';
import clientPromise from './mongodb';

export class ChatHistoryService {
  private client: any;
  private db: any;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    this.client = await clientPromise;
    this.db = this.client.db();
  }

  /**
   * Tạo session chat mới
   */
  async createSession(userId?: string): Promise<string> {
    await this.ensureInitialized();

    const session: ChatSession = {
      userId,
      title: 'Cuộc hội thoại mới',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };

    const result = await this.db.collection('chat_sessions').insertOne(session);
    return result.insertedId.toString();
  }

  /**
   * Cập nhật tiêu đề session
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    await this.ensureInitialized();

    await this.db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { title, updatedAt: new Date() } }
    );
  }

  /**
   * Lưu tin nhắn mới vào session
   */
  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system' | 'function',
    content: string,
    userId?: string
  ): Promise<void> {
    await this.ensureInitialized();

    const message: Message = {
      userId,
      role,
      content,
      timestamp: new Date(),
      sessionId
    };

    await this.db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Lấy tất cả sessions của user
   */
  async getSessions(userId?: string): Promise<ChatSession[]> {
    await this.ensureInitialized();

    const query = userId ? { userId } : {};
    const sessions = await this.db
      .collection('chat_sessions')
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    // Convert ObjectId to string
    return sessions.map((session: any) => ({
      ...session,
      _id: session._id.toString()
    }));
  }

  /**
   * Lấy session và tin nhắn theo ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    await this.ensureInitialized();

    const session = await this.db
      .collection('chat_sessions')
      .findOne({ _id: new ObjectId(sessionId) });

    if (session) {
      session._id = session._id.toString();
    }

    return session;
  }

  /**
   * Lấy tin nhắn của 1 session
   */
  async getMessages(sessionId: string): Promise<Message[]> {
    await this.ensureInitialized();

    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  /**
   * Xóa session theo ID
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db();

    // Delete the session
    const result = await db.collection('chat_sessions').deleteOne({
      _id: new ObjectId(sessionId)
    });

    if (result.deletedCount === 0) {
      return false;
    }

    // Delete all messages associated with this session
    await db.collection('messages').deleteMany({
      sessionId: sessionId
    });

    return true;
  }

  private async ensureInitialized() {
    if (!this.client || !this.db) {
      await this.initialize();
    }
  }
}
