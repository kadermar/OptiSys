'use client';

import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';

export default function ChatPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Opti</h1>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered operational intelligence assistant
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <AnimatedAIChat />
      </div>
    </div>
  );
}
