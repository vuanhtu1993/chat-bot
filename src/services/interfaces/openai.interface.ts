export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  functions?: boolean;
  saveHistory?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
}

export interface SearchGoogleResponse {
  results: any[];
  totalResults: number;
  error?: string;
}

export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
}

export interface ChatCompletionResponse {
  response: string;
  functionCall?: FunctionCallResult;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  title: string;
  createdAt: string;
  updatedAt: string;
}
