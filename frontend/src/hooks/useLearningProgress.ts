import { useState, useCallback } from 'react';
import { LessonProgress } from '../types';

const STORAGE_KEY = 'pg_learning_progress';

function loadProgress(): LessonProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data — reset
  }
  return [];
}

function persistProgress(items: LessonProgress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useLearningProgress() {
  const [completedLessons, setCompletedLessons] = useState<LessonProgress[]>(loadProgress);

  const markComplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => {
      if (prev.some((lp) => lp.lessonId === lessonId)) return prev;
      const updated = [...prev, { lessonId, completedAt: new Date().toISOString() }];
      persistProgress(updated);
      return updated;
    });
  }, []);

  const markIncomplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => {
      const updated = prev.filter((lp) => lp.lessonId !== lessonId);
      persistProgress(updated);
      return updated;
    });
  }, []);

  const isCompleted = useCallback(
    (lessonId: string) => completedLessons.some((lp) => lp.lessonId === lessonId),
    [completedLessons],
  );

  const getModuleProgress = useCallback(
    (lessonIds: string[]) => {
      const completed = lessonIds.filter((id) =>
        completedLessons.some((lp) => lp.lessonId === id),
      ).length;
      const total = lessonIds.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { completed, total, percent };
    },
    [completedLessons],
  );

  return {
    markComplete,
    markIncomplete,
    isCompleted,
    getModuleProgress,
    totalCompleted: completedLessons.length,
  };
}
