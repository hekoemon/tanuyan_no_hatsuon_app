import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: "#4FC3F7",
        sunny: "#FFD54F",
        coral: "#FF7043",
        grass: "#66BB6A",
        navy: "#2D3142",
        cream: "#FFF9F0",
        grape: "#9575CD",
      },
      fontFamily: {
        display: ["var(--font-fredoka)", "sans-serif"],
        body: ["var(--font-zenmaru)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.5rem",
        xl3: "2rem",
      },
      boxShadow: {
        chunky: "0 6px 0 rgba(0,0,0,0.15)",
        "chunky-sm": "0 4px 0 rgba(0,0,0,0.15)",
      },
      keyframes: {
        pulseMic: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        popIn: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        pulseMic: "pulseMic 1.1s ease-in-out infinite",
        popIn: "popIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
