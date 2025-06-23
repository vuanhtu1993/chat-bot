export interface Message {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Type guard to verify ChatSession array
export function isChatSessionArray(data: any): data is ChatSession[] {
  if (!Array.isArray(data)) return false;
  return data.every(item =>
    typeof item === 'object' &&
    typeof item.sessionId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
}

export const PROCESSING_MESSAGE = '⌛ Đang tìm kiếm thông tin...';
