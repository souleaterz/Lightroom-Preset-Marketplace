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
        // Semantic tokens — driven by CSS variables so they flip with the theme.
        canvas: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        foreground: "var(--fg)",
        muted: "var(--muted)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        overlay: "var(--overlay)",
        "overlay-strong": "var(--overlay-strong)",
        nav: "var(--nav-bg)",
        // Brand accents stay constant across themes.
        brand: "#7c5cfc",
        "brand-soft": "#cbb9ff",
        coral: "#e05c7a",
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
