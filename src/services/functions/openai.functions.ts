import axios from 'axios';
import { SearchGoogleResponse } from '../interfaces/openai.interface';

export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  CHAT_COMPLETION: '/api/chat-completion'
} as const;

export const searchGoogleFunction = {
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
};

export const availableFunctions = {
  search_google: async (args: { query: string }): Promise<SearchGoogleResponse> => {
    try {
      const response = await axios.post(API_ENDPOINTS.CHAT_COMPLETION, {
        messages: [
          { role: 'user', content: args.query }
        ],
        config: {
          functions: [searchGoogleFunction],
        }
      });

      return response.data.functionCall?.result || { results: [], totalResults: 0 };
    } catch (error) {
      console.error('Error searching Google:', error);
      return { results: [], totalResults: 0, error: 'Error searching Google' };
    }
  }
};
