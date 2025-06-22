import axios from 'axios';

interface OpenAIConfig {
  model: string;
  temperature: number;
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

// Define các function có thể gọi từ OpenAI
export const availableFunctions = {
  search_google: async (args: { query: string, googleApiKey: string, googleCx: string }): Promise<any> => {
    const { query, googleApiKey, googleCx } = args;
    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`,
        {
          params: {
            key: googleApiKey,
            cx: googleCx,
            q: query,
          },
        }
      );

      return {
        results: response.data.items?.map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        })) || [],
        totalResults: response.data.searchInformation?.totalResults || 0,
      };
    } catch (error) {
      console.error('Error searching Google:', error);
      return { results: [], totalResults: 0, error: 'Error searching Google' };
    }
  }
};

// Định nghĩa các function để gửi tới OpenAI
const functionDefinitions = [
  {
    name: 'search_google',
    description: 'Tìm kiếm thông tin trên Google để truy cập dữ liệu thời gian thực',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Chuỗi tìm kiếm, ví dụ "thời tiết tại Hà Nội"',
        },
      },
      required: ['query'],
    },
  },
];

export class OpenAIService {
  private config: OpenAIConfig;
  private apiKey: string;
  private googleApiKey: string;
  private googleCx: string;
  private sessionId: string | null = null;

  constructor(
    apiKey: string,
    googleApiKey: string = '',
    googleCx: string = '',
    config: Partial<OpenAIConfig> = {}
  ) {
    this.apiKey = apiKey;
    this.googleApiKey = googleApiKey;
    this.googleCx = googleCx;
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

      const payload: any = {
        model: this.config.model,
        messages: [
          { role: 'system', content: 'You are Trợ lý cá nhân của Anh Tú, a helpful AI assistant. Use the search_google function when you need real-time information or need to verify facts.' },
          ...context.map(msg => ({ role: 'user', content: msg })),
          { role: 'user', content: message }
        ],
        temperature: this.config.temperature,
      };

      // Thêm function calling nếu được bật
      if (this.config.functions) {
        payload.functions = functionDefinitions;
        payload.function_call = 'auto'; // cho phép model tự quyết định khi nào gọi function
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseMessage = response.data.choices[0].message;

      // Xử lý function calling nếu có
      if (responseMessage.function_call) {
        const functionCall = responseMessage.function_call;
        const functionName = functionCall.name;
        const functionArgs = JSON.parse(functionCall.arguments);

        // Save function call to history
        await this.saveToChatHistory(
          'function',
          `Function ${functionName} called with args: ${JSON.stringify(functionArgs)}`
        );

        let functionResponse: any = null;

        if (functionName === 'search_google') {
          functionResponse = await availableFunctions.search_google({
            query: functionArgs.query,
            googleApiKey: this.googleApiKey,
            googleCx: this.googleCx
          });
        }

        // Gửi kết quả function call lại cho OpenAI để nhận phản hồi cuối cùng
        const secondResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: this.config.model,
            messages: [
              { role: 'system', content: 'You are Trợ lý cá nhân của Anh Tú, a helpful AI assistant.' },
              ...context.map(msg => ({ role: 'user', content: msg })),
              { role: 'user', content: message },
              responseMessage,
              {
                role: 'function',
                name: functionName,
                content: JSON.stringify(functionResponse)
              }
            ],
            temperature: this.config.temperature,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const finalResponse = secondResponse.data.choices[0].message.content;

        // Save assistant response to history
        await this.saveToChatHistory('assistant', finalResponse);

        return finalResponse;
      }

      // Save assistant response to history
      await this.saveToChatHistory('assistant', responseMessage.content);

      return responseMessage.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  updateConfig(newConfig: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}
