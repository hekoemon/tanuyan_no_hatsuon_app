"use client";

import { ScoreResult as ScoreResultType } from "@/lib/types";

interface ScoreResultProps {
  result: ScoreResultType;
  onRetry: () => void;
  onNext: () => void;
  hasNext: boolean;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-grass";
  if (score >= 60) return "text-sunny";
  return "text-coral";
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between font-body font-bold text-sm text-navy mb-1">
        <span>{label}</span>
        <span>{value}点</span>
      </div>
      <div className="w-full h-4 bg-white rounded-full shadow-inner overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky to-grass rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreResult({ result, onRetry, onNext, hasNext }: ScoreResultProps) {
  return (
    <div className="animate-popIn bg-white rounded-xl3 shadow-chunky p-6 sm:p-8 flex flex-col items-center gap-6 max-w-xl mx-auto">
      <div className="flex flex-col items-center">
        <p className="font-body text-sm text-navy/70 mb-1">そうごうスコア</p>
        <p className={`font-display font-semibold text-6xl ${scoreColor(result.totalScore)}`}>
          {result.totalScore}
          <span className="text-2xl">点</span>
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <ScoreBar label="一致率" value={result.matchRate} />
        <ScoreBar label="発音スコア" value={result.pronunciationScore} />
        <ScoreBar label="流暢さ" value={result.fluencyScore} />
      </div>

      <div className="w-full bg-cream rounded-xl2 p-4">
        <p className="font-body text-xs text-navy/60 mb-2">あなたが言ったことば：</p>
        <p className="font-display text-lg text-navy mb-3">
          {result.recognizedText || "（聞き取れませんでした）"}
        </p>
        <div className="border-t border-navy/10 pt-3 flex flex-col gap-1.5">
          {result.feedbackLines.map((line, idx) => (
            <p key={idx} className="font-body text-navy text-base leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <button
          onClick={onRetry}
          className="bg-sky text-white font-display font-semibold text-lg rounded-xl2 shadow-chunky-sm py-4 active:translate-y-1 active:shadow-none transition-all"
        >
          🔁 もう一回
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="bg-coral text-white font-display font-semibold text-lg rounded-xl2 shadow-chunky-sm py-4 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:active:translate-y-0"
        >
          つぎへ ➡️
        </button>
      </div>
    </div>
  );
}
