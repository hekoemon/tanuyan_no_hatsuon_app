"use client";

import { Grade } from "@/lib/types";

interface GradeSelectProps {
  onSelect: (grade: Grade) => void;
}

export default function GradeSelect({ onSelect }: GradeSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-10 gap-8">
      <div className="text-center">
        <p className="font-display text-3xl sm:text-4xl text-coral mb-2">🎤 Let's Speak! 🎤</p>
        <h2 className="font-display font-semibold text-2xl sm:text-3xl text-navy">
          がくねんを えらんでね
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => onSelect("5")}
          className="group bg-grass text-white rounded-xl3 shadow-chunky px-8 py-10 flex flex-col items-center gap-3 active:translate-y-1.5 active:shadow-none transition-all"
        >
          <span className="text-6xl">🌱</span>
          <span className="font-display font-semibold text-3xl">5年生</span>
          <span className="font-body text-sm opacity-90">Grade 5</span>
        </button>

        <button
          onClick={() => onSelect("6")}
          className="group bg-grape text-white rounded-xl3 shadow-chunky px-8 py-10 flex flex-col items-center gap-3 active:translate-y-1.5 active:shadow-none transition-all"
        >
          <span className="text-6xl">🌟</span>
          <span className="font-display font-semibold text-3xl">6年生</span>
          <span className="font-body text-sm opacity-90">Grade 6</span>
        </button>
      </div>
    </div>
  );
}
