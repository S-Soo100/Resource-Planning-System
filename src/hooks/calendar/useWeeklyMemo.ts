import { useState, useEffect, useCallback } from 'react';
import { WeeklyMemo } from '@/types/calendar/calendar';
import { getWeeklyMemoStorageKey } from '@/utils/calendar/calendarUtils';
import toast from 'react-hot-toast';

/**
 * 주별 메모를 관리하는 훅 (로컬스토리지 기반)
 */
export function useWeeklyMemo(weekKey: string) {
  const [memo, setMemo] = useState<WeeklyMemo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 로컬스토리지에서 메모 로드
  const loadMemo = useCallback(() => {
    try {
      setIsLoading(true);
      const storageKey = getWeeklyMemoStorageKey(weekKey);
      const savedMemo = localStorage.getItem(storageKey);

      if (savedMemo) {
        const parsedMemo: WeeklyMemo = JSON.parse(savedMemo);
        setMemo(parsedMemo);
      } else {
        setMemo(null);
      }
    } catch (error) {
      console.error('메모 로드 실패:', error);
      setMemo(null);
    } finally {
      setIsLoading(false);
    }
  }, [weekKey]);

  // 메모 저장
  const saveMemo = useCallback(async (content: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      const storageKey = getWeeklyMemoStorageKey(weekKey);

      if (content.trim() === '') {
        // 빈 내용이면 메모 삭제
        localStorage.removeItem(storageKey);
        setMemo(null);
        toast.success('메모가 삭제되었습니다');
        return true;
      }

      const newMemo: WeeklyMemo = {
        weekKey,
        content: content.trim(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(newMemo));
      setMemo(newMemo);
      toast.success('메모가 저장되었습니다');
      return true;
    } catch (error) {
      console.error('메모 저장 실패:', error);
      toast.error('메모 저장에 실패했습니다');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [weekKey]);

  // 메모 삭제
  const deleteMemo = useCallback(async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      const storageKey = getWeeklyMemoStorageKey(weekKey);
      localStorage.removeItem(storageKey);
      setMemo(null);
      toast.success('메모가 삭제되었습니다');
      return true;
    } catch (error) {
      console.error('메모 삭제 실패:', error);
      toast.error('메모 삭제에 실패했습니다');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [weekKey]);

  // weekKey가 변경되면 새로운 메모 로드
  useEffect(() => {
    loadMemo();
  }, [loadMemo]);

  return {
    memo,
    isLoading,
    isSaving,
    saveMemo,
    deleteMemo,
    reloadMemo: loadMemo,
  };
}

/**
 * 자동 저장 기능이 있는 주별 메모 훅
 */
export function useWeeklyMemoWithAutoSave(weekKey: string, autoSaveDelay: number = 3000) {
  const { memo, isLoading, isSaving, saveMemo, deleteMemo, reloadMemo } = useWeeklyMemo(weekKey);
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 메모가 로드되면 content 업데이트
  useEffect(() => {
    setContent(memo?.content || '');
    setHasUnsavedChanges(false);
  }, [memo]);

  // 자동 저장 타이머
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      if (hasUnsavedChanges) {
        saveMemo(content);
        setHasUnsavedChanges(false);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges, saveMemo, autoSaveDelay]);

  // 내용 변경 핸들러
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  // 수동 저장
  const handleManualSave = useCallback(async () => {
    const success = await saveMemo(content);
    if (success) {
      setHasUnsavedChanges(false);
    }
    return success;
  }, [content, saveMemo]);

  // 삭제
  const handleDelete = useCallback(async () => {
    const success = await deleteMemo();
    if (success) {
      setContent('');
      setHasUnsavedChanges(false);
    }
    return success;
  }, [deleteMemo]);

  return {
    content,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    handleContentChange,
    handleManualSave,
    handleDelete,
    reloadMemo,
  };
}