"use client";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onHistory?: () => void;
}

export default function Header({ title, onBack, onHistory }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-sky/95 backdrop-blur px-4 py-3 shadow-chunky-sm flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-[64px]">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="もどる"
            className="bg-white text-navy font-display font-semibold text-2xl px-4 py-2 rounded-xl2 shadow-chunky-sm active:translate-y-1 active:shadow-none transition-all"
          >
            ←
          </button>
        )}
      </div>
      <h1 className="font-display font-semibold text-xl sm:text-2xl text-white drop-shadow-sm text-center flex-1 truncate px-2">
        {title}
      </h1>
      <div className="flex items-center gap-2 min-w-[64px] justify-end">
        {onHistory && (
          <button
            onClick={onHistory}
            aria-label="きろくをみる"
            className="bg-sunny text-navy font-display font-semibold text-2xl px-4 py-2 rounded-xl2 shadow-chunky-sm active:translate-y-1 active:shadow-none transition-all"
          >
            📊
          </button>
        )}
      </div>
    </header>
  );
}
