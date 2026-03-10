import { LearningModule } from '../../types';
import { PerryIcon } from '../PerryIcon';

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5 5.1 3 -1.9 2-1.4-.2c-.4-.1-.8.1-1 .4l-.3.4 2.4 1.2 1.2 2.4.4-.3c.3-.2.5-.6.4-1l-.2-1.4 2-1.9 3 5.1.5-.3c.4-.2.6-.6.5-1.1z" />
    </svg>
  );
}

const MODULE_ICONS: Record<string, () => React.ReactNode> = {
  'first-90-days': CreditCardIcon,
  'earning': TrendingUpIcon,
  'redeeming': PlaneIcon,
};

interface LearningHubProps {
  modules: LearningModule[];
  totalCompleted: number;
  totalLessons: number;
  getModuleProgress: (lessonIds: string[]) => { completed: number; total: number; percent: number };
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

export function LearningHub({
  modules,
  totalCompleted,
  totalLessons,
  getModuleProgress,
  onSelectModule,
  onBack,
}: LearningHubProps) {
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

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
        Back to chat
      </button>

      {/* Title with Perry icon */}
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-1">
        <PerryIcon size={32} />
        Learn with Perry
      </h2>
      <p className="text-sm text-gray-500 mb-3">
        {totalCompleted} of {totalLessons} lessons completed
      </p>

      {/* Overall progress bar */}
      <div className="pg-overall-progress">
        <div className="pg-progress-bar">
          <div
            className="pg-progress-fill pg-progress-fill--overall"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Module cards */}
      {modules.map((module) => {
        const lessonIds = module.lessons.map((l) => l.id);
        const progress = getModuleProgress(lessonIds);
        const IconComponent = MODULE_ICONS[module.id];

        return (
          <div
            key={module.id}
            className={`pg-module-card pg-module-card--${module.color}`}
            onClick={() => onSelectModule(module.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectModule(module.id)}
          >
            {IconComponent && (
              <div className={`pg-module-icon pg-module-icon--${module.color}`}>
                <IconComponent />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className="text-[15px] font-semibold text-gray-900">{module.title}</div>
                {progress.percent === 100 && (
                  <span className="pg-module-complete-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {module.lessons.length} lessons · {progress.completed}/{progress.total} complete
              </div>
              <div className="pg-progress-bar">
                <div
                  className={`pg-progress-fill pg-progress-fill--${module.color}`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center text-gray-400 ml-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
