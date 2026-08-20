"use client";

import Image from "next/image";

interface TanukiMascotProps {
  // 判定結果が出ているかどうか（true: end画像 / false: 通常画像）
  showEnd: boolean;
}

export default function TanukiMascot({ showEnd }: TanukiMascotProps) {
  return (
    <div className="flex justify-center">
      <div
        className={`relative w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-300 ${
          showEnd ? "scale-110" : "scale-100"
        }`}
      >
        <Image
          src={showEnd ? "/tanuki-end.png" : "/tanuki-normal.png"}
          alt="たぬやん"
          fill
          sizes="112px"
          className="object-contain drop-shadow-md animate-popIn"
          priority
        />
      </div>
    </div>
  );
}
