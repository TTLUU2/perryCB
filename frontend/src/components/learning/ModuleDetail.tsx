import { LearningModule } from '../../types';

interface ModuleDetailProps {
  module: LearningModule;
  isCompleted: (lessonId: string) => boolean;
  getModuleProgress: (lessonIds: string[]) => { completed: number; total: number; percent: number };
  onSelectLesson: (lessonId: string) => void;
  onBack: () => void;
}

export function ModuleDetail({
  module,
  isCompleted,
  getModuleProgress,
  onSelectLesson,
  onBack,
}: ModuleDetailProps) {
  const lessonIds = module.lessons.map((l) => l.id);
  const progress = getModuleProgress(lessonIds);

  return (
    <div className="pg-learn-panel">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-ph-blue hover:underline mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        All modules
      </button>

      {/* Module header */}
      <h2 className="text-lg font-bold text-gray-900 mb-1">{module.title}</h2>
      <p className="text-sm text-gray-500 mb-3">{module.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">
          {progress.completed}/{progress.total} lessons complete
        </div>
        <div className="pg-progress-bar">
          <div
            className={`pg-progress-fill pg-progress-fill--${module.color}`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Lesson rows */}
      {module.lessons.map((lesson) => {
        const done = isCompleted(lesson.id);
        return (
          <div
            key={lesson.id}
            className="pg-lesson-row"
            onClick={() => onSelectLesson(lesson.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectLesson(lesson.id)}
          >
            <div className={`pg-check-circle ${done ? 'pg-check-circle--done' : ''}`}>
              {done && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
            </div>
            <span className="pg-duration-badge">{lesson.durationMinutes} min</span>
          </div>
        );
      })}
    </div>
  );
}
