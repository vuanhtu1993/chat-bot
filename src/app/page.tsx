'use client';
import ChatInterface from '@/components/ChatInterface';
import SettingsComponent from '@/components/SettingsComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gray-50">
      {/* Settings button is now positioned better for mobile */}
      <div className="fixed top-2 right-2 z-50 md:top-4 md:right-4">
        <SettingsComponent />
      </div>
      {/* Chat container with better mobile padding and max height */}
      <div className="w-full h-screen">
        <ChatInterface />
      </div>
    </main>
  );
}
