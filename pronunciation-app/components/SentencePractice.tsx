"use client";

import { useEffect, useRef, useState } from "react";
import { Grade, ScoreResult as ScoreResultType, SentenceItem, UnitData } from "@/lib/types";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  startSpeechRecognition,
  warmUpVoices,
} from "@/lib/speech";
import { scorePronunciation } from "@/lib/scoring";
import { addHistoryRecord } from "@/lib/storage";
import ScoreResult from "./ScoreResult";
import TanukiMascot from "./TanukiMascot";

interface SentencePracticeProps {
  grade: Grade;
  unit: UnitData;
}

type RecordingState = "idle" | "recording" | "processing" | "error";

export default function SentencePractice({ grade, unit }: SentencePracticeProps) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResultType | null>(null);
  const [micSupported, setMicSupported] = useState(true);
  const [synthSupported, setSynthSupported] = useState(true);
  const stopRef = useRef<{ stop: () => void } | null>(null);

  const currentSentence: SentenceItem = unit.sentences[sentenceIndex];
  const hasNext = sentenceIndex < unit.sentences.length - 1;

  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported());
    setSynthSupported(isSpeechSynthesisSupported());
    warmUpVoices(); // Safariで声のリスト読み込みを早める
  }, []);

  useEffect(() => {
    // センテンスが変わったら状態をリセット
    setResult(null);
    setRecordingState("idle");
    setErrorMessage(null);
    return () => {
      stopRef.current?.stop();
    };
  }, [sentenceIndex, unit.unitId]);

  function handleListen() {
    speakText(currentSentence.text);
  }

  function handleRecord() {
    if (!micSupported) {
      setErrorMessage("このタブレット・パソコンでは音声にんしきが使えません。");
      return;
    }
    setErrorMessage(null);
    setResult(null);
    setRecordingState("recording");

    const controller = startSpeechRecognition({
      onStart: () => setRecordingState("recording"),
      onResult: (data) => {
        setRecordingState("processing");
        const scored = scorePronunciation({
          targetText: currentSentence.text,
          recognizedText: data.transcript,
          confidence: data.confidence,
          durationMs: data.durationMs,
        });
        setResult(scored);
        setRecordingState("idle");

        addHistoryRecord({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          grade,
          unitId: unit.unitId,
          unitName: unit.unitName,
          sentenceId: currentSentence.id,
          sentenceText: currentSentence.text,
          date: new Date().toISOString(),
          totalScore: scored.totalScore,
          matchRate: scored.matchRate,
          pronunciationScore: scored.pronunciationScore,
          fluencyScore: scored.fluencyScore,
        });
      },
      onError: (message) => {
        setErrorMessage(message);
        setRecordingState("error");
      },
      onEnd: () => {
        setRecordingState((prev) => (prev === "recording" ? "idle" : prev));
      },
    });

    stopRef.current = controller;
  }

  function handleRetry() {
    setResult(null);
    setErrorMessage(null);
    setRecordingState("idle");
  }

  function handleNext() {
    if (hasNext) {
      setSentenceIndex((i) => i + 1);
    }
  }

  return (
    <div className="px-4 sm:px-8 py-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* たぬやん（マスコット）。判定が出るとポーズが変わる */}
      <TanukiMascot showEnd={result !== null} />

      {/* 進捗 */}
      <div className="flex items-center justify-center gap-2">
        {unit.sentences.map((_, idx) => (
          <span
            key={idx}
            className={`h-3 rounded-full transition-all ${
              idx === sentenceIndex
                ? "w-8 bg-coral"
                : idx < sentenceIndex
                ? "w-3 bg-grass"
                : "w-3 bg-navy/20"
            }`}
          />
        ))}
      </div>

      {!micSupported && (
        <div className="bg-coral/10 border-2 border-coral text-navy rounded-xl2 p-4 text-center font-body">
          この端末・ブラウザは音声にんしきに対応していません。<strong>Google Chrome</strong>
          または<strong>Safari（最新版）</strong>でひらいてください。Safariの場合、初回のみ
          「音声にんしき」の使用許可を聞かれることがあります。
        </div>
      )}

      {/* センテンスカード */}
      <div className="bg-white rounded-xl3 shadow-chunky p-6 sm:p-10 flex flex-col items-center gap-4 text-center">
        <p className="font-body text-sm text-navy/50">{unit.unitName}</p>
        <p className="font-display font-semibold text-3xl sm:text-4xl text-navy leading-snug">
          {currentSentence.text}
        </p>
        <p className="font-body text-navy/60 text-base">{currentSentence.meaning}</p>

        <button
          onClick={handleListen}
          disabled={!synthSupported}
          className="mt-2 bg-sky text-white font-display font-semibold text-lg rounded-xl2 shadow-chunky-sm px-6 py-3 flex items-center gap-2 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40"
        >
          🔊 お手本をきく
        </button>
      </div>

      {/* マイクボタン */}
      {!result && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleRecord}
            disabled={recordingState === "recording" || recordingState === "processing" || !micSupported}
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-6xl shadow-chunky transition-all active:translate-y-1.5 active:shadow-none ${
              recordingState === "recording"
                ? "bg-coral animate-pulseMic"
                : "bg-grass"
            } disabled:opacity-50`}
          >
            🎤
          </button>
          <p className="font-display font-semibold text-lg text-navy">
            {recordingState === "recording"
              ? "きこえています…はなしてね"
              : recordingState === "processing"
              ? "はんてい中…"
              : "タップして はなそう"}
          </p>
          {errorMessage && (
            <p className="font-body text-coral text-center max-w-sm">{errorMessage}</p>
          )}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <ScoreResult result={result} onRetry={handleRetry} onNext={handleNext} hasNext={hasNext} />
      )}
    </div>
  );
}
