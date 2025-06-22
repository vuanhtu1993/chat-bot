'use client';
import ChatInterface from '@/components/ChatInterface';
import SettingsComponent from '@/components/SettingsComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="fixed top-4 right-4 z-50">
        <SettingsComponent />
      </div>
      <div className="w-full max-w-4xl h-screen">
        <ChatInterface />
      </div>
    </main>
  );
}
