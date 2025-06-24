'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
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
  const [showSideBar, setShowSideBar] = useState(false);
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

  const handleDeleteSession = async (sessionId: string) => {
    if (!openAIService.current) return;

    try {
      await openAIService.current.deleteSession(sessionId);

      // If deleted current session, clear the UI
      if (currentSession === sessionId) {
        setMessages([]);
        setCurrentSession(null);
      }

      // Reload sessions list
      await loadSessions();
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const startNewSession = () => {
    // Just clear the UI state
    setMessages([]);
    setCurrentSession(null);
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
          const sessionId = await openAIService.current.createNewSession(trimmedInput);
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
    <div className="h-full flex">
      {/* Side bar */}
      <Sidebar
        show={showSideBar}
        sessions={sessions}
        loadSession={loadSession}
        startNewSession={startNewSession}
        onDeleteSession={handleDeleteSession}
        toggleSidebar={() => setShowSideBar(!showSideBar)}
      />
      {/* Main */}
      <main className="flex-1 flex flex-col h-full bg-gray-100">
        {/* Header with dropdown menu */}
        <div className="flex justify-between items-center p-3 md:p-4 bg-white shadow-sm">
          <button
            onClick={() => setShowSideBar(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Image src="/vai2.png" alt="Logo" width={100} height={40} />
          <div className="w-6" /> {/* Spacer for alignment */}
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
            />
            <button
              disabled={isLoading}
              type="submit"
              className="p-2 text-blue-500 hover:text-blue-700 active:text-blue-900 transition-colors disabled:opacity-50 touch-manipulation"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
