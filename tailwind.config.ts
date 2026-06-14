import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        surface: "#111114",
        border: "rgba(255,255,255,0.08)",
        "text-primary": "#f0f0f0",
        "text-muted": "#888891",
        accent: {
          purple: "#7c5cfc",
          coral: "#e05c7a",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #7c5cfc, #e05c7a)",
      },
    },
  },
  plugins: [],
};
export default config;
