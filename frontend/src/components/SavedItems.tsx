import { useState } from 'react';
import { SavedItem } from '../types';

interface SavedItemsProps {
  items: SavedItem[];
  onRemove: (messageId: string) => void;
  onUpdateNotes: (messageId: string, notes: string) => void;
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

export function SavedItems({ items, onRemove, onUpdateNotes, onBack }: SavedItemsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
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

          {/* Notes */}
          {editingId === item.id ? (
            <div className="pg-saved-notes-editor">
              <textarea
                className="pg-saved-notes-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 mt-1.5">
                <button
                  className="pg-saved-notes-save"
                  onClick={() => { onUpdateNotes(item.id, draft); setEditingId(null); }}
                >
                  Save
                </button>
                <button
                  className="pg-saved-notes-cancel"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : item.notes ? (
            <div
              className="pg-saved-notes-display"
              onClick={() => { setEditingId(item.id); setDraft(item.notes || ''); }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>{item.notes}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ph-gray-400">{formatDate(item.savedAt)}</span>
            <div className="flex items-center gap-3">
              {editingId !== item.id && (
                <button
                  onClick={() => { setEditingId(item.id); setDraft(item.notes || ''); }}
                  className="text-[10px] text-ph-blue hover:underline transition-colors"
                >
                  {item.notes ? 'Edit note' : 'Add note'}
                </button>
              )}
              <button
                onClick={() => onRemove(item.id)}
                className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
