'use client';
import ChatInterface from '@/components/ChatInterface';
import SettingsComponent from '@/components/SettingsComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      {/* Settings button is now positioned better for mobile */}
      <div className="fixed top-2 right-2 z-50 md:top-4 md:right-4">
        <SettingsComponent />
      </div>
      {/* Chat container with better mobile padding and max height */}
      <div className="w-full h-screen max-w-3xl px-2 md:px-4 relative">
        <ChatInterface />
      </div>
    </main>
  );
}
