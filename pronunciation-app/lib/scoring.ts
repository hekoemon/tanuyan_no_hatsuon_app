import pronunciationTips from "@/data/pronunciationTips.json";
import { ScoreResult } from "./types";

const tipsDictionary: Record<string, string> = pronunciationTips;

// 文字列を単語の配列に正規化する（小文字化・記号除去）
function normalizeToWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"']/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

// 2つの単語配列の最長共通部分列（LCS）を求める
// → どの単語が「正しく言えたか」を判定するために使う
function longestCommonSubsequence(a: string[], b: string[]): Set<number> {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // dpをたどって、目標文（a）の中で一致した単語のインデックスを集める
  const matchedIndexes = new Set<number>();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matchedIndexes.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return matchedIndexes;
}

// 2つの文字列の類似度（0〜1）をレーベンシュタイン距離から計算する
// 発音スコアの補助指標として使用
function charSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  const dp: number[][] = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));
  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  const distance = dp[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * 模範文（targetText）と児童の発話（recognizedText / confidence / 発話時間）から
 * 発音評価スコアとフィードバックを計算する。
 */
export function scorePronunciation(params: {
  targetText: string;
  recognizedText: string;
  confidence: number;
  durationMs: number;
}): ScoreResult {
  const { targetText, recognizedText, confidence, durationMs } = params;

  const targetWords = normalizeToWords(targetText);
  const spokenWords = normalizeToWords(recognizedText);

  // 1. 一致率：模範文の単語のうち、正しく言えた単語の割合
  const matchedIndexes = longestCommonSubsequence(targetWords, spokenWords);
  const matchRate =
    targetWords.length === 0
      ? 0
      : Math.round((matchedIndexes.size / targetWords.length) * 100);

  // 2. 発音スコア：文字レベルの類似度と、ブラウザが返す信頼度(confidence)を組み合わせる
  const similarity = charSimilarity(
    normalizeToWords(targetText).join(" "),
    normalizeToWords(recognizedText).join(" ")
  );
  const safeConfidence = Number.isFinite(confidence) && confidence > 0 ? confidence : 0.75;
  const pronunciationScore = Math.round(
    Math.min(1, similarity * 0.6 + safeConfidence * 0.4) * 100
  );

  // 3. 流暢さ：単語数に対してちょうどよい速さで話せたかを評価する
  //    目安：1単語あたり 0.35〜0.6秒 程度を「なめらか」とする
  const wordCount = Math.max(targetWords.length, 1);
  const secondsPerWord = durationMs / 1000 / wordCount;
  let fluencyScore: number;
  if (secondsPerWord <= 0.15) {
    // 短すぎる＝おそらく発話が短く切れている
    fluencyScore = 55;
  } else if (secondsPerWord >= 0.3 && secondsPerWord <= 0.75) {
    fluencyScore = 100;
  } else if (secondsPerWord < 0.3) {
    fluencyScore = Math.round(70 + (secondsPerWord / 0.3) * 30);
  } else {
    // 長く時間がかかった＝ゆっくりすぎる
    const over = secondsPerWord - 0.75;
    fluencyScore = Math.max(50, Math.round(100 - over * 40));
  }

  // 総合スコア（一致率を重視しつつ、発音・流暢さも加味）
  const totalScore = Math.round(
    matchRate * 0.5 + pronunciationScore * 0.3 + fluencyScore * 0.2
  );

  const feedbackLines = buildFeedback({
    targetWords,
    matchedIndexes,
    matchRate,
    pronunciationScore,
    fluencyScore,
    recognizedText,
  });

  return {
    matchRate,
    pronunciationScore,
    fluencyScore,
    totalScore: Math.min(100, totalScore),
    recognizedText,
    feedbackLines,
  };
}

function buildFeedback(params: {
  targetWords: string[];
  matchedIndexes: Set<number>;
  matchRate: number;
  pronunciationScore: number;
  fluencyScore: number;
  recognizedText: string;
}): string[] {
  const { targetWords, matchedIndexes, matchRate, pronunciationScore, fluencyScore, recognizedText } =
    params;
  const lines: string[] = [];

  if (!recognizedText || recognizedText.trim().length === 0) {
    return [
      "声をにんしきできませんでした。",
      "マイクの近くで、はっきりと話してみましょう。",
    ];
  }

  // 全体の一言コメント
  if (matchRate >= 90) {
    lines.push("Great job! とても上手に言えました。");
  } else if (matchRate >= 70) {
    lines.push("Good! よくがんばりました。");
  } else if (matchRate >= 40) {
    lines.push("Nice try! もう少し練習してみましょう。");
  } else {
    lines.push("Let's try again! もう一度チャレンジしてみましょう。");
  }

  // 言えていた単語をほめる（最大2つ）
  const goodWords = targetWords.filter((_, i) => matchedIndexes.has(i));
  if (goodWords.length > 0) {
    const pickedGood = goodWords.slice(-2);
    lines.push(`「${pickedGood.join("」「")}」の発音がとても上手です。`);
  }

  // 言えていなかった単語について、具体的なアドバイス（最大2つ）
  const missedWords = targetWords.filter((w, i) => !matchedIndexes.has(i));
  const advisedWords = missedWords.slice(0, 2);
  for (const word of advisedWords) {
    const tip = tipsDictionary[word];
    if (tip) {
      lines.push(tip);
    } else {
      lines.push(`「${word}」の発音をもう一度、ゆっくり練習してみましょう。`);
    }
  }

  // 流暢さについてのコメント
  if (fluencyScore < 65) {
    lines.push("もう少し自然なスピードで、すらすら言えるように練習しましょう。");
  }

  // 発音スコアが低い場合の全体アドバイス
  if (pronunciationScore < 60 && missedWords.length === 0) {
    lines.push("お手本の発音をもう一度聞いてから、まねして言ってみましょう。");
  }

  return lines;
}
