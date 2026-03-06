import { Suggestion } from '../types';

interface SuggestedTopicsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  disabled?: boolean;
}

export function SuggestedTopics({ suggestions, onSelect, disabled }: SuggestedTopicsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="pg-suggestions">
      {suggestions.map((s, i) => (
        <button
          key={`${s.action}-${i}`}
          className={`pg-suggestion-chip ${s.type === 'nba' ? 'pg-suggestion-nba' : ''}`}
          onClick={() => onSelect(s)}
          disabled={disabled}
        >
          {s.type === 'nba' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
          {s.label}
        </button>
      ))}
    </div>
  );
}
