"use client";

import { UnitData } from "@/lib/types";

interface UnitSelectProps {
  units: UnitData[];
  onSelect: (unit: UnitData) => void;
}

const UNIT_COLORS = ["bg-coral", "bg-sky", "bg-grass", "bg-grape", "bg-sunny"];
const UNIT_EMOJI = ["📘", "📗", "📙", "📕", "📓", "📔"];

export default function UnitSelect({ units, onSelect }: UnitSelectProps) {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <h2 className="font-display font-semibold text-2xl sm:text-3xl text-navy text-center mb-8">
        ユニットを えらんでね
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {units.map((unit, idx) => {
          const color = UNIT_COLORS[idx % UNIT_COLORS.length];
          const isSunny = color === "bg-sunny";
          return (
            <button
              key={unit.unitId}
              onClick={() => onSelect(unit)}
              className={`${color} ${
                isSunny ? "text-navy" : "text-white"
              } rounded-xl3 shadow-chunky px-6 py-6 text-left flex items-center gap-4 active:translate-y-1.5 active:shadow-none transition-all`}
            >
              <span className="text-4xl">{UNIT_EMOJI[idx % UNIT_EMOJI.length]}</span>
              <div>
                <p className="font-display font-semibold text-xl">{unit.unitName}</p>
                <p className="font-body text-sm opacity-90 mt-1">
                  {unit.sentences.length}こ の れんしゅうもんだい
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
