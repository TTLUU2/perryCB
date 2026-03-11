import { PageContext, SSEEvent, CtaEvent, Suggestion, UserProfile } from '../types';

const API_BASE = '/api';

export interface SendMessageCallbacks {
  onTextDelta: (text: string) => void;
  onCta: (cta: CtaEvent) => void;
  onDone: (sessionId: string, suggestions?: Suggestion[]) => void;
  onError: (error: string) => void;
}

export async function sendMessage(
  sessionId: string | null,
  message: string,
  pageContext: PageContext,
  callbacks: SendMessageCallbacks,
  userProfile?: UserProfile | null,
  suggestionClicked?: string | null,
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      session_id: sessionId,
      message,
      page_context: pageContext,
    };
    if (userProfile) {
      body.user_profile = userProfile;
    }
    if (suggestionClicked) {
      body.suggestion_clicked = suggestionClicked;
    }
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const event: SSEEvent = JSON.parse(data);

            switch (event.type) {
              case 'text_delta':
                if (typeof event.content === 'string') {
                  callbacks.onTextDelta(event.content);
                }
                break;
              case 'cta':
                if (event.content && typeof event.content === 'object') {
                  callbacks.onCta(event.content as CtaEvent);
                }
                break;
              case 'done':
                callbacks.onDone(event.session_id || '', event.suggestions);
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function trackCtaClick(sessionId: string, ctaId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/session/${sessionId}/cta-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cta_id: ctaId }),
    });
  } catch {
    // Non-critical — don't break UX for tracking failures
  }
}
