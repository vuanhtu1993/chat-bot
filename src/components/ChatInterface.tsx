'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { OpenAIService } from '@/lib/openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openAIService = useRef<OpenAIService | null>(null);

  useEffect(() => {
    // Initialize OpenAI service with Google search capabilities
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const googleCx = process.env.NEXT_PUBLIC_GOOGLE_CX;

    if (apiKey) {
      openAIService.current = new OpenAIService(
        apiKey,
        googleApiKey?.toString() || '',
        googleCx?.toString() || '',
        { functions: true }
      );
    } else {
      console.error('OpenAI API key not found');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = { role: 'user', content: input } as Message;
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      if (!openAIService.current) {
        throw new Error('OpenAI service not initialized');
      }

      // Get conversation context (last 5 messages)
      const context = messages.slice(-5).map(msg => msg.content);

      // Hiển thị thông báo nếu chatbot đang tìm kiếm thông tin
      const processingMessage = {
        role: 'assistant',
        content: '⌛ Đang tìm kiếm thông tin...'
      } as Message;
      setMessages(prev => [...prev, processingMessage]);

      // Call OpenAI API (with function calling)
      const response = await openAIService.current.sendMessage(input, context);

      // Replace the processing message with the actual response
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          role: 'assistant',
          content: response
        } as Message;
        return updatedMessages;
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error sending message');

      // Remove the processing message if there was an error
      setMessages(prev => prev.filter(msg => msg.content !== '⌛ Đang tìm kiếm thông tin...'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700"
            onClick={() => {
              // Implement voice input
            }}
          >
            <MicrophoneIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
