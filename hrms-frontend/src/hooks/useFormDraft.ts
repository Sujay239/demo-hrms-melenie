import { useEffect, useRef, useCallback } from 'react';
import { mockStorage } from '@/services/mock-storage';

export interface UseFormDraftOptions<T> {
  draftKey: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
}

export function useFormDraft<T>({
  draftKey,
  data,
  enabled = true,
  debounceMs = 300,
}: UseFormDraftOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Auto-save on data change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled || !draftKey) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      mockStorage.saveFormDraft(draftKey, data);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draftKey, data, enabled, debounceMs]);

  const loadDraft = useCallback(() => {
    return mockStorage.getFormDraft<T>(draftKey);
  }, [draftKey]);

  const saveDraftNow = useCallback(
    (currentData?: T) => {
      mockStorage.saveFormDraft(draftKey, currentData !== undefined ? currentData : data);
    },
    [draftKey, data]
  );

  const clearDraft = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    mockStorage.clearFormDraft(draftKey);
  }, [draftKey]);

  return {
    loadDraft,
    saveDraftNow,
    clearDraft,
  };
}
