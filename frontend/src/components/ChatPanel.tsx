import { useState, useCallback, useMemo } from 'react';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { SuggestedTopics } from './SuggestedTopics';
import { PerryIcon } from './PerryIcon';
import { ToolsDrawer } from './ToolsDrawer';
import { UserProfile } from './UserProfile';
import { SavedItems } from './SavedItems';
import { LearningHub } from './learning/LearningHub';
import { ModuleDetail } from './learning/ModuleDetail';
import { LessonView } from './learning/LessonView';
import { LEARNING_MODULES } from '../data/learningModules';
import { ChatMessage, Suggestion, UserProfile as UserProfileType, SavedItem } from '../types';
import { findRelevantLesson } from '../utils/lessonKeywords';

type ViewState = 'chat' | 'profile' | 'saved' | 'learn';

interface LearnNavState {
  screen: 'hub' | 'module' | 'lesson';
  moduleId?: string;
  lessonId?: string;
}

interface LearningHookOutput {
  markComplete: (lessonId: string) => void;
  markIncomplete: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  getModuleProgress: (lessonIds: string[]) => { completed: number; total: number; percent: number };
  totalCompleted: number;
}

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
  onUpdateNotes: (messageId: string, notes: string) => void;
  isSaved: (messageId: string) => boolean;
  savedCount: number;
  // Learning
  learning: LearningHookOutput;
}

const TOTAL_LESSONS = LEARNING_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

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
  onUpdateNotes,
  isSaved,
  savedCount,
  learning,
}: ChatPanelProps) {
  const [view, setView] = useState<ViewState>('chat');
  const [learnNav, setLearnNav] = useState<LearnNavState>({ screen: 'hub' });

  // Enrich suggestions with lesson chip if assistant message mentions a learning topic
  const enrichedSuggestions = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return suggestions;

    const match = findRelevantLesson(lastAssistant.content);
    if (!match) return suggestions;

    // Don't add duplicate
    if (suggestions.some((s) => s.type === 'lesson' && s.lessonId === match.lessonId)) {
      return suggestions;
    }

    const lessonSuggestion: Suggestion = {
      label: `Read: ${match.title}`,
      action: `lesson:${match.lessonId}`,
      type: 'lesson',
      lessonId: match.lessonId,
    };

    return [...suggestions, lessonSuggestion];
  }, [messages, suggestions]);

  // Handle suggestion clicks — intercept lesson type to navigate
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === 'lesson' && suggestion.lessonId) {
        // Find the module for this lesson
        const mod = LEARNING_MODULES.find((m) =>
          m.lessons.some((l) => l.id === suggestion.lessonId)
        );
        if (mod) {
          setView('learn');
          setLearnNav({ screen: 'lesson', moduleId: mod.id, lessonId: suggestion.lessonId });
        }
        return;
      }
      onSuggestionClick(suggestion);
    },
    [onSuggestionClick]
  );

  // Ask Perry from a lesson — switch to chat and send the prompt
  const askPerryFromLesson = useCallback(
    (prompt: string) => {
      setView('chat');
      setTimeout(() => onSend(prompt), 100);
    },
    [onSend]
  );

  const handleToolsInteraction = useCallback(() => {
    // No-op for now — could collapse drawer on link click
  }, []);

  const openLearn = useCallback(() => {
    if (view === 'learn') {
      setView('chat');
    } else {
      setLearnNav({ screen: 'hub' });
      setView('learn');
    }
  }, [view]);

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

          {/* Learn button */}
          <button
            onClick={openLearn}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative ${
              view === 'learn' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            aria-label="Learning modules"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
            </svg>
            {learning.totalCompleted > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-400 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                {learning.totalCompleted > 9 ? '9+' : learning.totalCompleted}
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

          {/* Minimise button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Minimise chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
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
            suggestions={enrichedSuggestions}
            onSelect={handleSuggestionClick}
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
          onUpdateNotes={onUpdateNotes}
          onBack={() => setView('chat')}
        />
      )}

      {view === 'learn' && learnNav.screen === 'hub' && (
        <LearningHub
          modules={LEARNING_MODULES}
          totalCompleted={learning.totalCompleted}
          totalLessons={TOTAL_LESSONS}
          getModuleProgress={learning.getModuleProgress}
          onSelectModule={(moduleId) => setLearnNav({ screen: 'module', moduleId })}
          onBack={() => setView('chat')}
        />
      )}

      {view === 'learn' && learnNav.screen === 'module' && (() => {
        const mod = LEARNING_MODULES.find((m) => m.id === learnNav.moduleId);
        if (!mod) return null;
        return (
          <ModuleDetail
            module={mod}
            isCompleted={learning.isCompleted}
            getModuleProgress={learning.getModuleProgress}
            onSelectLesson={(lessonId) =>
              setLearnNav({ screen: 'lesson', moduleId: mod.id, lessonId })
            }
            onBack={() => setLearnNav({ screen: 'hub' })}
          />
        );
      })()}

      {view === 'learn' && learnNav.screen === 'lesson' && (() => {
        const mod = LEARNING_MODULES.find((m) => m.id === learnNav.moduleId);
        if (!mod) return null;
        const lessonIdx = mod.lessons.findIndex((l) => l.id === learnNav.lessonId);
        const lesson = mod.lessons[lessonIdx];
        if (!lesson) return null;
        const nextLesson = mod.lessons[lessonIdx + 1] ?? null;
        return (
          <LessonView
            module={mod}
            lesson={lesson}
            isCompleted={learning.isCompleted(lesson.id)}
            onMarkComplete={learning.markComplete}
            onMarkIncomplete={learning.markIncomplete}
            onNextLesson={(nextId) =>
              setLearnNav({ screen: 'lesson', moduleId: mod.id, lessonId: nextId })
            }
            nextLesson={nextLesson}
            onBack={() => setLearnNav({ screen: 'module', moduleId: mod.id })}
            onAskPerry={askPerryFromLesson}
          />
        );
      })()}
    </div>
  );
}
