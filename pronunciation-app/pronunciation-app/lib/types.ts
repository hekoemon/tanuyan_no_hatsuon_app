// 学年
export type Grade = "5" | "6";

// 1つの練習センテンス
export interface SentenceItem {
  id: string;
  text: string;
  meaning: string;
}

// 1つのUnit（複数のセンテンスを持つ）
export interface UnitData {
  unitId: string;
  unitName: string;
  sentences: SentenceItem[];
}

// data/sentences.json 全体の型
export type SentenceDatabase = Record<Grade, UnitData[]>;

// 発音評価の結果
export interface ScoreResult {
  matchRate: number; // 一致率 (0-100)
  pronunciationScore: number; // 発音スコア (0-100)
  fluencyScore: number; // 流暢さ (0-100)
  totalScore: number; // 総合スコア (0-100)
  recognizedText: string; // 児童が話した内容（音声認識結果）
  feedbackLines: string[]; // 日本語フィードバック（複数行）
}

// LocalStorageに保存する学習履歴の1件
export interface HistoryRecord {
  id: string;
  grade: Grade;
  unitId: string;
  unitName: string;
  sentenceId: string;
  sentenceText: string;
  date: string; // ISO文字列
  totalScore: number;
  matchRate: number;
  pronunciationScore: number;
  fluencyScore: number;
}

// アプリの画面状態
export type Screen = "grade" | "unit" | "practice" | "history";
