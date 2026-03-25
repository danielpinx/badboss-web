import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS 변수 기반 색상
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 사이버펑크 네온 색상
        "neon-green": "#00ff41",
        "neon-purple": "#bd00ff",
        "neon-red": "#ff0040",
        "neon-cyan": "#00f0ff",
        "neon-gold": "#ffd700",
        "neon-silver": "#c0c0c0",
        "neon-bronze": "#cd7f32",
        "cyber-bg": "#0a0a0f",
        "cyber-surface": "#12121a",
        "cyber-border": "#1a1a2e",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Noto Sans KR", "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        "pulse-neon": "pulse-neon 1.5s ease-in-out infinite",
        scanline: "scanline 6s linear infinite",
        typing: "typing 3s steps(24) 1s forwards, blink 0.75s step-end infinite",
        "particle-up": "particle-up 0.8s ease-out forwards",
        "siren": "siren 1s ease-in-out infinite alternate",
        "fade-in": "fade-in 0.5s ease-in-out",
      },
      keyframes: {
        glow: {
          "0%": { textShadow: "0 0 5px #00ff41, 0 0 10px #00ff41" },
          "100%": { textShadow: "0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        typing: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        blink: {
          "0%, 100%": { borderColor: "transparent" },
          "50%": { borderColor: "#00ff41" },
        },
        "particle-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-60px) scale(1.5)", opacity: "0" },
        },
        siren: {
          "0%": { borderColor: "#ff0040" },
          "100%": { borderColor: "#00f0ff" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
