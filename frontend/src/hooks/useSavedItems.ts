import { useState, useCallback } from 'react';
import { ChatMessage, SavedItem } from '../types';

const STORAGE_KEY = 'pg_saved_items';

function loadItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data — reset
  }
  return [];
}

function persistItems(items: SavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>(loadItems);

  const saveMessage = useCallback((message: ChatMessage) => {
    setItems((prev) => {
      // Don't duplicate
      if (prev.some((item) => item.id === message.id)) return prev;
      const newItem: SavedItem = {
        ...message,
        savedAt: new Date().toISOString(),
      };
      const updated = [newItem, ...prev];
      persistItems(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((messageId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== messageId);
      persistItems(updated);
      return updated;
    });
  }, []);

  const isSaved = useCallback(
    (messageId: string) => items.some((item) => item.id === messageId),
    [items],
  );

  return { items, saveMessage, removeItem, isSaved, count: items.length };
}
