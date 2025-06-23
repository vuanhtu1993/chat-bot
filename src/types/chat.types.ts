// Base message type for all chat messages
export interface Message {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

// Session type for database and UI
export interface ChatSession {
  _id?: string;
  userId?: string;
  messages: Message[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// OpenAI specific types
export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  functions?: boolean;
  saveHistory?: boolean;
}

export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
}

export interface ChatCompletionResponse {
  response: string;
  functionCall?: FunctionCallResult;
}

export interface SearchResult {
  results: any[];
  totalResults: number;
  error?: string;
}

// Type guards
export function isChatSessionArray(data: any): data is ChatSession[] {
  if (!Array.isArray(data)) return false;
  return data.every(item =>
    typeof item === 'object' &&
    typeof item._id === 'string' &&
    typeof item.title === 'string' &&
    (item.createdAt instanceof Date || typeof item.createdAt === 'string') &&
    (item.updatedAt instanceof Date || typeof item.updatedAt === 'string') &&
    Array.isArray(item.messages)
  );
}

// Constants
export const PROCESSING_MESSAGE = '⌛ Đang tìm kiếm thông tin...';
