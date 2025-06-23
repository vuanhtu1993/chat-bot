'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { OpenAIService } from '@/services/openai';
import SettingsComponent from './SettingsComponent';
import { Message, ChatSession, PROCESSING_MESSAGE } from '@/types/chat.types';
import Sidebar from './Sidebar';
import ChatMessageList from './ChatMessageList';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openAIService = useRef<OpenAIService | null>(null);

  useEffect(() => {
    // Initialize OpenAI service
    openAIService.current = new OpenAIService({
      functions: true,
      saveHistory: true
    });

    // Load chat sessions
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!openAIService.current) {
      console.error('OpenAI service not initialized');
      return;
    }

    try {
      const chatSessions = await openAIService.current.getChatSessions();
      if (!Array.isArray(chatSessions)) {
        throw new Error('Invalid sessions data received');
      }
      setSessions(chatSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat sessions');
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
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      setIsLoading(true);

      if (!openAIService.current) {
        throw new Error('OpenAI service not initialized');
      }

      // Add user message to the UI and clear input
      const userMessage: Message = {
        role: 'user',
        content: trimmedInput,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      try {
        // Create a new session if none exists
        if (!currentSession) {
          const sessionId = await openAIService.current.createNewSession();
          if (!sessionId) throw new Error('Failed to create session');
          setCurrentSession(sessionId);
          await loadSessions();
        }

        // Make sure OpenAI service has the current session ID
        openAIService.current.setSessionId(currentSession!);
      } catch (error) {
        console.error('Session error:', error);
        toast.error('Error managing chat session');
        setIsLoading(false);
        return;
      }

      // Show processing message
      const processingMessage: Message = {
        role: 'assistant',
        content: PROCESSING_MESSAGE,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMessage]);

      // Send message and get response
      const response = await openAIService.current.sendMessage(
        trimmedInput,
        messages.slice(-5).map(msg => msg.content)
      );

      if (!response) throw new Error('No response received');

      // Update UI with actual response
      setMessages(prev => {
        const updatedMessages = [...prev];
        // Only replace the last message if it's the processing message
        if (updatedMessages[updatedMessages.length - 1]?.content === PROCESSING_MESSAGE) {
          updatedMessages[updatedMessages.length - 1] = {
            role: 'assistant',
            content: response,
            timestamp: new Date()
          };
        } else {
          // If somehow the processing message was removed, add the response as a new message
          updatedMessages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
          });
        }
        return updatedMessages;
      });

      // Reload sessions to update titles and timestamps
      await loadSessions();

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error sending message');

      // Remove processing message on error
      setMessages(prev =>
        prev.filter(msg => msg.content !== PROCESSING_MESSAGE)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-3 gap-4">
      {/* Side bar */}
      <Sidebar sessions={sessions} loadSession={loadSession} startNewSession={startNewSession} />
      {/* Main */}
      <main className="col-span-2 flex flex-col h-full bg-gray-100">
        {/* Header with dropdown menu */}
        <div className="container mx-auto flex justify-between items-center p-3 md:p-4 border-b bg-white shadow-sm">
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation">
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </Menu.Button>
            <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowSessions(!showSessions)}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                    >
                      <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-3 text-gray-600" />
                      Lịch sử trò chuyện
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={startNewSession}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                    >
                      <ArrowPathIcon className="w-5 h-5 mr-3 text-red-600" />
                      Tạo cuộc trò chuyện mới
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
          <h1 className="text-lg md:text-xl font-semibold">Vừng ơi</h1>
          <div className="w-10" /> {/* Spacer to balance the header */}
        </div>

        {/* Settings Modal */}
        {showSettings && <SettingsComponent onClose={() => setShowSettings(false)} />}

        {/* Chat Messages List */}
        <ChatMessageList messages={messages} messagesEndRef={messagesEndRef} />

        {/* Input Form - Now more touch-friendly */}
        <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors touch-manipulation"
              onClick={() => {
                // Voice input implementation
              }}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              disabled={isLoading || showSessions}
            />
            <button
              type="submit"
              className="p-2 text-blue-500 hover:text-blue-700 active:text-blue-900 transition-colors disabled:opacity-50 touch-manipulation"
              disabled={isLoading || showSessions || !input.trim()}
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
