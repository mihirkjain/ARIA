/**
 * useChatStream Hook
 * Handles chat message streaming and AI service coordination
 */

import { useState, useCallback } from 'react';
import { invokeSendChat, isTauriAvailable, AIStatus, invokeGetAIStatus } from '../utils/tauriUtils';

export interface StreamingMessage {
  id: string;
  text: string;
  sender: 'assistant';
  source: 'local' | 'cloud';
  model: string;
  latency_ms: number;
  timestamp: Date;
}

export interface UseChatStreamReturn {
  sendChatMessage: (message: string) => Promise<StreamingMessage>;
  isStreaming: boolean;
  error: string | null;
  aiStatus: AIStatus | null;
  loadAIStatus: () => Promise<void>;
}

export function useChatStream(): UseChatStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  const loadAIStatus = useCallback(async () => {
    try {
      if (!isTauriAvailable()) {
        console.warn('Tauri not available - running in web mode with mock AI');
        return;
      }
      const status = await invokeGetAIStatus();
      setAiStatus(status);
    } catch (err) {
      console.error('Failed to load AI status:', err);
    }
  }, []);

  const sendChatMessage = useCallback(
    async (message: string): Promise<StreamingMessage> => {
      setIsStreaming(true);
      setError(null);

      const messageId = Date.now().toString();
      const startTime = Date.now();

      try {
        if (!isTauriAvailable()) {
          // Fallback to web mode with simulated response
          console.warn('Tauri not available - using simulated response');
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

          return {
            id: messageId,
            text: 'Running in web mode. Desktop app required for real AI.',
            sender: 'assistant',
            source: 'local',
            model: 'simulated',
            latency_ms: Date.now() - startTime,
            timestamp: new Date(),
          };
        }

        // Call Tauri backend to get AI response
        const response = await invokeSendChat(message, true, true);

        return {
          id: messageId,
          text: response.response,
          sender: 'assistant',
          source: response.source,
          model: response.model,
          latency_ms: response.latency_ms,
          timestamp: new Date(),
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return {
    sendChatMessage,
    isStreaming,
    error,
    aiStatus,
    loadAIStatus,
  };
}
