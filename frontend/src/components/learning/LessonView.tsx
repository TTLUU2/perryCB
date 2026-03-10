import { useState, useCallback, useRef, useEffect } from 'react';
import { LearningModule, LearningLesson } from '../../types';
import { renderMarkdown } from '../../utils/markdown';

interface LessonViewProps {
  module: LearningModule;
  lesson: LearningLesson;
  isCompleted: boolean;
  onMarkComplete: (lessonId: string) => void;
  onMarkIncomplete: (lessonId: string) => void;
  onNextLesson: (lessonId: string) => void;
  nextLesson: LearningLesson | null;
  onBack: () => void;
  onAskPerry?: (prompt: string) => void;
}

export function LessonView({
  module,
  lesson,
  isCompleted,
  onMarkComplete,
  onMarkIncomplete,
  onNextLesson,
  nextLesson,
  onBack,
  onAskPerry,
}: LessonViewProps) {
  const [celebrating, setCelebrating] = useState(false);
  const [showAskMenu, setShowAskMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMarkComplete = useCallback((lessonId: string) => {
    setCelebrating(true);
    onMarkComplete(lessonId);
    setTimeout(() => setCelebrating(false), 600);
  }, [onMarkComplete]);

  // Close menu on outside click
  useEffect(() => {
    if (!showAskMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAskMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAskMenu]);

  // Close menu when lesson changes
  useEffect(() => {
    setShowAskMenu(false);
  }, [lesson.id]);

  const prompts = lesson.askPerryPrompts ?? (lesson.askPerryPrompt ? [lesson.askPerryPrompt] : []);

  return (
    <div className="flex flex-col" style={{ flex: 1, minHeight: 0 }}>
      {/* Header area */}
      <div className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-ph-blue hover:underline mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {module.title}
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-gray-900">{lesson.title}</h2>
          <span className="pg-duration-badge">{lesson.durationMinutes} min</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="pg-lesson-content">
        <div
          className="pg-message-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }}
        />
      </div>

      {/* Sticky footer */}
      <div className="pg-lesson-footer">
        {isCompleted ? (
          <button
            className="pg-complete-btn--done"
            onClick={() => onMarkIncomplete(lesson.id)}
          >
            Completed ✓
          </button>
        ) : (
          <button
            className={`pg-complete-btn--pending${celebrating ? ' pg-complete-btn--celebrating' : ''}`}
            onClick={() => handleMarkComplete(lesson.id)}
          >
            Mark as Complete
          </button>
        )}
        {prompts.length > 0 && onAskPerry && (
          <div className="pg-ask-perry-wrapper" ref={menuRef}>
            <button
              className="pg-ask-perry-btn"
              onClick={() => setShowAskMenu(!showAskMenu)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Ask Perry
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
                <polyline points={showAskMenu ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
              </svg>
            </button>
            {showAskMenu && (
              <div className="pg-ask-menu">
                {prompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="pg-ask-menu-item"
                    onClick={() => {
                      setShowAskMenu(false);
                      onAskPerry(prompt);
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pg-ask-menu-icon">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {prompt}
                  </button>
                ))}
                <button
                  className="pg-ask-menu-item pg-ask-menu-item--custom"
                  onClick={() => {
                    setShowAskMenu(false);
                    onAskPerry(`I was just reading about ${lesson.title.toLowerCase()}. Can you help me with something related?`);
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pg-ask-menu-icon">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Ask something else
                </button>
              </div>
            )}
          </div>
        )}
        {nextLesson && (
          <button
            onClick={() => onNextLesson(nextLesson.id)}
            className="text-sm text-ph-blue hover:underline font-medium whitespace-nowrap"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
