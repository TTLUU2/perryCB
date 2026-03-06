import { SavedItem } from '../types';

interface SavedItemsProps {
  items: SavedItem[];
  onRemove: (messageId: string) => void;
  onBack: () => void;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function SavedItems({ items, onRemove, onBack }: SavedItemsProps) {
  return (
    <div className="pg-saved-panel">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-ph-blue hover:underline mb-4"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to chat
      </button>

      <h3 className="text-sm font-semibold text-ph-gray-800 mb-1">Saved Recommendations</h3>
      <p className="text-xs text-ph-gray-500 mb-4">
        {items.length === 0
          ? 'No saved items yet. Bookmark Perry\'s responses to save them here.'
          : `${items.length} saved item${items.length !== 1 ? 's' : ''}`}
      </p>

      {items.map((item) => (
        <div key={item.id} className="pg-saved-item">
          <div className="text-sm text-ph-gray-800 leading-relaxed mb-2">
            {truncate(item.content, 200)}
          </div>

          {item.ctas && item.ctas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {item.ctas.map((cta, i) => (
                <a
                  key={`${cta.cta_id}-${i}`}
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ph-blue hover:underline font-medium"
                >
                  {cta.label}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ph-gray-400">{formatDate(item.savedAt)}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
