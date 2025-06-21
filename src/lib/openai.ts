import axios from 'axios';

interface OpenAIConfig {
  model: string;
  temperature: number;
}

const defaultConfig: OpenAIConfig = {
  model: 'gpt-4.1-nano',
  temperature: 0.7,
};

export class OpenAIService {
  private config: OpenAIConfig;
  private apiKey: string;

  constructor(apiKey: string, config: Partial<OpenAIConfig> = {}) {
    this.apiKey = apiKey;
    this.config = { ...defaultConfig, ...config };
  }

  async sendMessage(message: string, context: string[] = []) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages: [
            { role: 'system', content: 'You are Trợ lý cá nhân của Anh Tú, a helpful AI assistant.' },
            ...context.map(msg => ({ role: 'user', content: msg })),
            { role: 'user', content: message }
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

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  updateConfig(newConfig: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}
