'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { OpenAIService } from '@/lib/openai';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp?: Date;
}

interface ChatSession {
  _id: string;
  title: string;
  updatedAt: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
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
        { functions: true, saveHistory: true }
      );

      // Load chat sessions
      loadSessions();
    } else {
      console.error('OpenAI API key not found');
    }
  }, []);

  const loadSessions = async () => {
    if (!openAIService.current) return;

    try {
      const chatSessions = await openAIService.current.getChatSessions();
      setSessions(chatSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startNewSession = async () => {
    if (!openAIService.current) return;

    try {
      // Clear messages
      setMessages([]);

      // Create new session
      const sessionId = await openAIService.current.createNewSession();
      setCurrentSession(sessionId);

      // Reload sessions list
      await loadSessions();
    } catch (error) {
      console.error('Error creating new session:', error);
      toast.error('Failed to create new session');
    }
  };

  const loadSession = async (sessionId: string) => {
    if (!openAIService.current) return;

    try {
      setIsLoading(true);

      // Load chat history
      const history = await openAIService.current.loadChatHistory(sessionId);

      // Set current session and messages
      setCurrentSession(sessionId);
      setMessages(history);
      setShowSessions(false);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      if (!openAIService.current) {
        throw new Error('OpenAI service not initialized');
      }

      // Add user message to the UI
      const userMessage = { role: 'user', content: input } as Message;
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Create a new session if none exists
      if (!currentSession) {
        const sessionId = await openAIService.current.createNewSession();
        setCurrentSession(sessionId);
        await loadSessions();
      } else {
        // Make sure OpenAI service has the current session ID
        openAIService.current.setSessionId(currentSession);
      }

      // Show processing message
      const processingMessage = {
        role: 'assistant',
        content: '⌛ Đang tìm kiếm thông tin...'
      } as Message;
      setMessages(prev => [...prev, processingMessage]);

      // Send message and get response
      const response = await openAIService.current.sendMessage(
        input,
        messages.slice(-5).map(msg => msg.content)
      );

      // Update UI with actual response
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          role: 'assistant',
          content: response
        } as Message;
        return updatedMessages;
      });

      // Reload sessions to update titles and timestamps
      await loadSessions();

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error sending message');

      // Remove processing message on error
      setMessages(prev => 
        prev.filter(msg => msg.content !== '⌛ Đang tìm kiếm thông tin...')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-2 border-b">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowSessions(!showSessions)}
        >
          <DocumentTextIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Goodboy Chatbot</h1>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={startNewSession}
        >
          <ArrowPathIcon className="w-6 h-6 text-red-600" />
        </button>
      </div>

      {showSessions ? (
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-lg font-medium mb-4">Lịch sử trò chuyện</h2>
          {sessions.length > 0 ? (
            <ul className="space-y-2">
              {sessions.map(session => (
                <li key={session._id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadSession(session._id)}>
                  <h3 className="font-medium">{session.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(session.updatedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Không có lịch sử trò chuyện</p>
          )}
        </div>
      ) : (
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
      )}

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
            disabled={isLoading || showSessions}
          />
          <button
            type="submit"
            className="p-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
            disabled={isLoading || showSessions || !input.trim()}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
