"use client";

import { useEffect, useState } from "react";
import { HistoryRecord } from "@/lib/types";
import { calculateSummary, clearHistory, loadHistory } from "@/lib/storage";

export default function HistoryView() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const summary = calculateSummary(history);
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  function handleClear() {
    if (window.confirm("がくしゅうきろくを すべてけしますか？この操作はもとにもどせません。")) {
      clearHistory();
      setHistory([]);
    }
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }

  return (
    <div className="px-4 sm:px-8 py-6 max-w-3xl mx-auto flex flex-col gap-6">
      <h2 className="font-display font-semibold text-2xl sm:text-3xl text-navy text-center">
        がくしゅう きろく
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-sky text-white rounded-xl2 shadow-chunky-sm p-4 flex flex-col items-center">
          <span className="font-body text-xs opacity-90">練習回数</span>
          <span className="font-display font-semibold text-3xl">{summary.count}</span>
        </div>
        <div className="bg-grass text-white rounded-xl2 shadow-chunky-sm p-4 flex flex-col items-center">
          <span className="font-body text-xs opacity-90">平均点</span>
          <span className="font-display font-semibold text-3xl">{summary.averageScore}</span>
        </div>
        <div className="bg-coral text-white rounded-xl2 shadow-chunky-sm p-4 flex flex-col items-center">
          <span className="font-body text-xs opacity-90">最高点</span>
          <span className="font-display font-semibold text-3xl">{summary.bestScore}</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center font-body text-navy/60 py-10">
          まだ きろくがありません。れんしゅうしてみよう！
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl2 shadow-chunky-sm p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-body text-xs text-navy/50">
                  {record.grade}年生 ・ {record.unitName} ・ {formatDate(record.date)}
                </p>
                <p className="font-display text-base text-navy truncate">{record.sentenceText}</p>
              </div>
              <div
                className={`font-display font-semibold text-2xl shrink-0 ${
                  record.totalScore >= 85
                    ? "text-grass"
                    : record.totalScore >= 60
                    ? "text-sunny"
                    : "text-coral"
                }`}
              >
                {record.totalScore}
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <button
          onClick={handleClear}
          className="self-center mt-4 text-navy/50 font-body text-sm underline"
        >
          きろくをリセットする
        </button>
      )}
    </div>
  );
}
