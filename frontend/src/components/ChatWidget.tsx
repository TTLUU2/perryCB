import { useState, useCallback } from 'react';
import { ChatPanel } from './ChatPanel';
import { PerryIcon } from './PerryIcon';
import { useChat } from '../hooks/useChat';
import { usePageContext } from '../hooks/usePageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSavedItems } from '../hooks/useSavedItems';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { trackCtaClick } from '../services/api';
import { Suggestion } from '../types';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pageContext = usePageContext();
  const { profile, updateField, hasAnyPreference } = useUserProfile();
  const { items: savedItems, saveMessage, removeItem, updateNotes, isSaved, count: savedCount } = useSavedItems();
  const learning = useLearningProgress();
  const { messages, isStreaming, suggestions, sessionId, send } = useChat(
    pageContext,
    hasAnyPreference ? profile : null,
  );

  const handleCtaClick = useCallback(
    (ctaId: string) => {
      if (sessionId) {
        trackCtaClick(sessionId, ctaId);
      }
    },
    [sessionId],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === 'nba' && suggestion.url) {
        window.open(suggestion.url, '_blank', 'noopener');
        if (sessionId) {
          trackCtaClick(sessionId, suggestion.action);
        }
      } else {
        send(suggestion.label);
      }
    },
    [send, sessionId],
  );

  if (!isOpen) {
    return (
      <div className="pg-widget-container">
        <button
          onClick={() => setIsOpen(true)}
          className="pg-fab-pulse group flex items-center gap-3 rounded-full
                     pl-3 pr-6 py-2.5
                     bg-gradient-to-r from-[#374B6A] to-[#A83D80]
                     text-white hover:from-[#2D3E54] hover:to-[#8B2D60]
                     transition-all duration-200 cursor-pointer"
          aria-label="Chat with Perry"
        >
          <PerryIcon size={44} />
          <span className="text-sm font-medium hidden sm:inline">Need help with points?</span>
          <span className="text-sm font-medium sm:hidden">Ask Perry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pg-widget-container pg-widget-container--open">
      <ChatPanel
        messages={messages}
        isStreaming={isStreaming}
        suggestions={suggestions}
        onSend={send}
        onClose={() => setIsOpen(false)}
        onCtaClick={handleCtaClick}
        onSuggestionClick={handleSuggestionClick}
        profile={profile}
        onProfileUpdate={updateField}
        savedItems={savedItems}
        onBookmark={saveMessage}
        onRemoveSaved={removeItem}
        onUpdateNotes={updateNotes}
        isSaved={isSaved}
        savedCount={savedCount}
        learning={learning}
      />
    </div>
  );
}
