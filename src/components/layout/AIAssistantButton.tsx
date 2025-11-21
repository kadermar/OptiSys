'use client';

import { usePathname } from 'next/navigation';
import { AIAssistantPopup } from '@/components/ui/AIAssistantPopup';

export function AIAssistantButton() {
  const pathname = usePathname();

  // Hide on AI assistant page
  if (pathname === '/chat') {
    return null;
  }

  return <AIAssistantPopup />;
}
