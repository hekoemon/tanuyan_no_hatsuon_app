import { HistoryRecord } from "./types";

const STORAGE_KEY = "eigo-hatsuon-history-v1";

// 保存されている全履歴を取得する
export function loadHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryRecord[];
  } catch (e) {
    console.error("履歴の読み込みに失敗しました", e);
    return [];
  }
}

// 新しい履歴を1件追加する
export function addHistoryRecord(record: HistoryRecord): void {
  if (typeof window === "undefined") return;
  const current = loadHistory();
  const updated = [...current, record];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("履歴の保存に失敗しました", e);
  }
}

// 履歴をすべて削除する（リセット機能用）
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// 児童ごとの平均点などをまとめて計算する
export function calculateSummary(history: HistoryRecord[]): {
  count: number;
  averageScore: number;
  bestScore: number;
} {
  if (history.length === 0) {
    return { count: 0, averageScore: 0, bestScore: 0 };
  }
  const total = history.reduce((sum, h) => sum + h.totalScore, 0);
  const best = Math.max(...history.map((h) => h.totalScore));
  return {
    count: history.length,
    averageScore: Math.round(total / history.length),
    bestScore: best,
  };
}
