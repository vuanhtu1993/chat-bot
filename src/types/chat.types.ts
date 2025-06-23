// Message Types
export interface Message {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

// Session Types
export interface ChatSession {
  _id?: string;
  userId?: string;
  messages: Message[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// OpenAI Service Types
export interface OpenAIConfig {
  /** The model to use for chat completion */
  model?: string;
  /** The temperature (randomness) of the model's output */
  temperature?: number;
  /** Whether to enable function calling capabilities */
  functions?: boolean;
  /** Whether to save chat history */
  saveHistory?: boolean;
}

export interface FunctionCallResult {
  /** The name of the function that was called */
  name: string;
  /** The arguments passed to the function */
  args: Record<string, any>;
}

export interface ChatCompletionResponse {
  /** The text response from the model */
  response: string;
  /** Optional function call information if the model decides to call a function */
  functionCall?: FunctionCallResult;
}

export interface SearchResult {
  /** Array of search results */
  results: any[];
  /** Total number of results found */
  totalResults: number;
  /** Optional error message if the search fails */
  error?: string;
}

// Type Guards
/**
 * Type guard to verify if the data is an array of ChatSession objects
 * @param data The data to check
 * @returns True if the data is a valid ChatSession array
 */
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

// Google
export type SearchGoogleResponse = {
  results: any[];
  totalResults: number;
  error?: string;
};

// Constants
export const PROCESSING_MESSAGE = '⌛ Đang tìm kiếm thông tin...';
