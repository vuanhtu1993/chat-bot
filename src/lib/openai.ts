import axios from 'axios';

interface OpenAIConfig {
  model?: string;
  temperature?: number;
  functions?: boolean;
  saveHistory?: boolean;
}

const defaultConfig: OpenAIConfig = {
  model: 'gpt-4.1-nano',
  temperature: 0.7,
  functions: true,
  saveHistory: true,
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
}

// Define the functions that can be called
export const availableFunctions = {
  search_google: async (args: { query: string }): Promise<any> => {
    try {
      const response = await axios.post('/api/chat-completion', {
        messages: [
          { role: 'user', content: args.query }
        ],
        config: {
          functions: [{
            name: 'search_google',
            description: 'Search Google for real-time information',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
              },
              required: ['query'],
            },
          }],
        }
      });

      return response.data.functionCall?.result || { results: [], totalResults: 0 };
    } catch (error) {
      console.error('Error searching Google:', error);
      return { results: [], totalResults: 0, error: 'Error searching Google' };
    }
  }
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
  private async saveToChatHistory(role: 'user' | 'assistant' | 'system' | 'function', content: string) {
    if (!this.config.saveHistory) return;

    try {
      // Create new session if none exists
      if (!this.sessionId) {
        await this.createNewSession();
      }

      // Save message to database
      await axios.post('/api/chat', {
        sessionId: this.sessionId,
        role,
        content,
        userId: undefined // Optional user ID
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
  async getChatSessions(): Promise<any[]> {
    try {
      const response = await axios.get('/api/chat');
      return response.data.sessions || [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  async sendMessage(message: string, context: string[] = []) {
    try {
      // Save user message to history first
      await this.saveToChatHistory('user', message);

      const messages = [
        {
          role: 'system',
          content: 'You are Trợ lý cá nhân của Anh Tú, a helpful AI assistant. Use the search_google function when you need real-time information or need to verify facts.'
        },
        ...context.map(msg => ({ role: 'user', content: msg })),
        { role: 'user', content: message }
      ];

      const response = await axios.post('/api/chat-completion', {
        messages,
        config: {
          model: this.config.model,
          temperature: this.config.temperature,
          functions: this.config.functions ? [{
            name: 'search_google',
            description: 'Search Google for real-time information',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
              },
              required: ['query'],
            },
          }] : undefined,
        }
      });

      const finalResponse = response.data.response;

      // Save assistant response to history
      await this.saveToChatHistory('assistant', finalResponse);

      // If there was a function call, save that to history too
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
