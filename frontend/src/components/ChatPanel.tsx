import { useState, useCallback } from 'react';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { SuggestedTopics } from './SuggestedTopics';
import { PerryIcon } from './PerryIcon';
import { ToolsDrawer } from './ToolsDrawer';
import { UserProfile } from './UserProfile';
import { SavedItems } from './SavedItems';
import { ChatMessage, Suggestion, UserProfile as UserProfileType, SavedItem } from '../types';

type ViewState = 'chat' | 'profile' | 'saved';

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  suggestions: Suggestion[];
  onSend: (message: string) => void;
  onClose: () => void;
  onCtaClick: (ctaId: string) => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
  // User profile
  profile: UserProfileType;
  onProfileUpdate: <K extends keyof UserProfileType>(key: K, value: UserProfileType[K]) => void;
  // Saved items
  savedItems: SavedItem[];
  onBookmark: (message: ChatMessage) => void;
  onRemoveSaved: (messageId: string) => void;
  isSaved: (messageId: string) => boolean;
  savedCount: number;
}

export function ChatPanel({
  messages,
  isStreaming,
  suggestions,
  onSend,
  onClose,
  onCtaClick,
  onSuggestionClick,
  profile,
  onProfileUpdate,
  savedItems,
  onBookmark,
  onRemoveSaved,
  isSaved,
  savedCount,
}: ChatPanelProps) {
  const [view, setView] = useState<ViewState>('chat');

  const handleToolsInteraction = useCallback(() => {
    // No-op for now — could collapse drawer on link click
  }, []);

  return (
    <div className="pg-chat-panel">
      {/* Header */}
      <div className="pg-header flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5 relative z-10">
          <PerryIcon size={44} />
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Perry</div>
            <div className="text-xs text-white/90">your points co-pilot</div>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          {/* Saved items button */}
          <button
            onClick={() => setView(view === 'saved' ? 'chat' : 'saved')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative ${
              view === 'saved' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            aria-label="Saved recommendations"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill={view === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M5 3a2 2 0 00-2 2v12l7-4 7 4V5a2 2 0 00-2-2H5z" />
            </svg>
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 text-[9px] font-bold text-ph-gray-800 rounded-full flex items-center justify-center">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>

          {/* Profile button */}
          <button
            onClick={() => setView(view === 'profile' ? 'chat' : 'profile')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              view === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            aria-label="Your preferences"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tools & Resources Drawer — always above content */}
      {view === 'chat' && <ToolsDrawer onInteraction={handleToolsInteraction} />}

      {/* View: Chat | Profile | Saved */}
      {view === 'chat' && (
        <>
          <MessageList
            messages={messages}
            onCtaClick={onCtaClick}
            onBookmark={onBookmark}
            isSaved={isSaved}
          />
          <SuggestedTopics
            suggestions={suggestions}
            onSelect={onSuggestionClick}
            disabled={isStreaming}
          />
          <InputBar onSend={onSend} disabled={isStreaming} />
        </>
      )}

      {view === 'profile' && (
        <UserProfile
          profile={profile}
          onUpdate={onProfileUpdate}
          onBack={() => setView('chat')}
        />
      )}

      {view === 'saved' && (
        <SavedItems
          items={savedItems}
          onRemove={onRemoveSaved}
          onBack={() => setView('chat')}
        />
      )}
    </div>
  );
}
