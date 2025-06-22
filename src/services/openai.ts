import axios from 'axios';
import { OpenAIConfig, ChatMessage, ChatCompletionResponse, ChatSession } from './interfaces/openai.interface';
import { API_ENDPOINTS, searchGoogleFunction } from './functions/openai.functions';

const defaultConfig: OpenAIConfig = {
  model: 'gpt-4.1-nano',
  temperature: 0.7,
  functions: true,
  saveHistory: true,
};

export class OpenAIService {
  private config: OpenAIConfig;
  private sessionId: string | null = null;

  constructor(config: Partial<OpenAIConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Set session ID for saving chat history
   */
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Create a new session and return its ID
   */
  async createNewSession(): Promise<string> {
    try {
      const response = await axios.post('/api/chat', {
        role: 'system',
        content: 'Bắt đầu cuộc trò chuyện mới',
        userId: undefined // Optional user ID if you want to track per-user sessions
      });

      const sessionId = response.data.sessionId;
      if (!sessionId) {
        throw new Error('Session ID not returned from server');
      }
      this.sessionId = sessionId;
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Save message to chat history
   */
  private async saveToChatHistory(role: ChatMessage['role'], content: string) {
    if (!this.config.saveHistory) return;

    try {
      if (!this.sessionId) {
        await this.createNewSession();
      }

      await axios.post(API_ENDPOINTS.CHAT, {
        sessionId: this.sessionId,
        role,
        content,
        userId: undefined
      });
    } catch (error) {
      console.error('Error saving to chat history:', error);
      throw error;
    }
  }

  /**
   * Load chat history from a session
   */
  async loadChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      this.sessionId = sessionId;

      const response = await axios.get(`/api/chat?sessionId=${sessionId}`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Get all chat sessions
   */
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.CHAT);
      return response.data.sessions || [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  async sendMessage(message: string, context: string[] = []): Promise<string> {
    try {
      await this.saveToChatHistory('user', message);

      const messages = [
        {
          role: 'system' as const,
          content: 'You are Trợ lý cá nhân của Anh Tú, a helpful AI assistant. Use the search_google function when you need real-time information or need to verify facts.'
        },
        ...context.map(msg => ({ role: 'user' as const, content: msg })),
        { role: 'user' as const, content: message }
      ];

      const response = await axios.post<ChatCompletionResponse>(API_ENDPOINTS.CHAT_COMPLETION, {
        messages,
        config: {
          model: this.config.model,
          temperature: this.config.temperature,
          functions: this.config.functions ? [searchGoogleFunction] : undefined,
        }
      });

      const finalResponse = response.data.response;
      await this.saveToChatHistory('assistant', finalResponse);

      if (response.data.functionCall) {
        await this.saveToChatHistory(
          'function',
          `Function ${response.data.functionCall.name} called with args: ${JSON.stringify(response.data.functionCall.args)}`
        );
      }

      return finalResponse;
    } catch (error) {
      console.error('Error calling chat API:', error);
      throw error;
    }
  }

  updateConfig(newConfig: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}
