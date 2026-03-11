import { useState, useCallback, useRef } from 'react';
import { ChatMessage, CtaEvent, PageContext, Suggestion, UserProfile } from '../types';
import { sendMessage } from '../services/api';

const SESSION_KEY = 'pg_session_id';

export function useChat(pageContext: PageContext, userProfile?: UserProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY),
  );
  const messageIdRef = useRef(0);

  const genId = () => `msg-${++messageIdRef.current}-${Date.now()}`;

  const send = useCallback(
    async (text: string, suggestionClicked?: string) => {
      if (!text.trim() || isStreaming) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Add placeholder assistant message
      const assistantId = genId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        ctas: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);
      setSuggestions([]);

      await sendMessage(sessionId, text.trim(), pageContext, {
        onTextDelta: (content: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + content }
                : m,
            ),
          );
        },
        onCta: (cta: CtaEvent) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, ctas: [...(m.ctas || []), cta] }
                : m,
            ),
          );
        },
        onDone: (newSessionId: string, newSuggestions?: Suggestion[]) => {
          if (newSessionId) {
            setSessionId(newSessionId);
            localStorage.setItem(SESSION_KEY, newSessionId);
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m,
            ),
          );
          if (newSuggestions?.length) {
            setSuggestions(newSuggestions);
          }
          setIsStreaming(false);
        },
        onError: (error: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "I'm having a bit of trouble right now. Please try again in a moment.",
                    isStreaming: false,
                  }
                : m,
            ),
          );
          setIsStreaming(false);
          console.error('Chat error:', error);
        },
      }, userProfile, suggestionClicked);
    },
    [sessionId, pageContext, isStreaming, userProfile],
  );

  const resetSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    suggestions,
    sessionId,
    send,
    resetSession,
  };
}
