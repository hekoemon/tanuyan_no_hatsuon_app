"use client";

import { useState } from "react";
import sentenceData from "@/data/sentences.json";
import { Grade, Screen, SentenceDatabase, UnitData } from "@/lib/types";
import Header from "@/components/Header";
import GradeSelect from "@/components/GradeSelect";
import UnitSelect from "@/components/UnitSelect";
import SentencePractice from "@/components/SentencePractice";
import HistoryView from "@/components/HistoryView";

const database = sentenceData as unknown as SentenceDatabase;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("grade");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [screenBeforeHistory, setScreenBeforeHistory] = useState<Screen>("grade");

  function handleSelectGrade(g: Grade) {
    setGrade(g);
    setScreen("unit");
  }

  function handleSelectUnit(u: UnitData) {
    setUnit(u);
    setScreen("practice");
  }

  function goToHistory() {
    setScreenBeforeHistory(screen);
    setScreen("history");
  }

  function goBack() {
    if (screen === "practice") {
      setScreen("unit");
      setUnit(null);
    } else if (screen === "unit") {
      setScreen("grade");
      setGrade(null);
    } else if (screen === "history") {
      setScreen(screenBeforeHistory);
    }
  }

  const title =
    screen === "grade"
      ? "えいご はつおん れんしゅう"
      : screen === "unit"
      ? `${grade}年生`
      : screen === "practice"
      ? unit?.unitName ?? ""
      : "がくしゅうきろく";

  return (
    <main className="min-h-screen bg-cream">
      <Header
        title={title}
        onBack={screen === "grade" ? undefined : goBack}
        onHistory={screen === "history" ? undefined : goToHistory}
      />

      {screen === "grade" && <GradeSelect onSelect={handleSelectGrade} />}

      {screen === "unit" && grade && (
        <UnitSelect units={database[grade]} onSelect={handleSelectUnit} />
      )}

      {screen === "practice" && grade && unit && (
        <SentencePractice grade={grade} unit={unit} />
      )}

      {screen === "history" && <HistoryView />}
    </main>
  );
}
