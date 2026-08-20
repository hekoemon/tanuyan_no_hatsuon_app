import type { Metadata, Viewport } from "next";
import { Fredoka, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

const zenmaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-zenmaru",
});

export const metadata: Metadata = {
  title: "えいご はつおん れんしゅう",
  description: "NEW HORIZON Elementary 対応 英語発音練習アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${fredoka.variable} ${zenmaru.variable} font-body bg-cream text-navy`}>
        {children}
      </body>
    </html>
  );
}
