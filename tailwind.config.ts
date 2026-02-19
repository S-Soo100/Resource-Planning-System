import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // KARS 디자인 토큰 — 하이픈 다중 토큰명이 Tailwind 스캐너에 누락되는 문제 방지
    // bg-*
    "bg-Back-Lowest-00","bg-Back-Low-10","bg-Back-Mid-20","bg-Back-High-25","bg-Back-Highest-30",
    "bg-Text-Highest-100","bg-Text-High-90","bg-Text-Low-70","bg-Text-Lowest-60",
    "bg-Primary-Main","bg-Primary-Container",
    "bg-Error-Main","bg-Error-Container","bg-On-Error","bg-On-Error-Container",
    "bg-Outline","bg-Outline-Variant",
    "bg-Gray-Sub-High-80","bg-Gray-Sub-Low-50","bg-Gray-Sub-Disabled-40",
    "bg-Neutral-White","bg-Neutral-Black",
    // text-*
    "text-Back-Lowest-00","text-Back-Low-10","text-Back-Mid-20","text-Back-High-25","text-Back-Highest-30",
    "text-Text-Highest-100","text-Text-High-90","text-Text-Low-70","text-Text-Lowest-60",
    "text-Primary-Main","text-Primary-Container",
    "text-Error-Main","text-Error-Container","text-On-Error","text-On-Error-Container",
    "text-Outline","text-Outline-Variant",
    "text-Gray-Sub-High-80","text-Gray-Sub-Low-50","text-Gray-Sub-Disabled-40",
    "text-Neutral-White","text-Neutral-Black",
    // border-*
    "border-Back-Lowest-00","border-Back-Low-10","border-Back-Mid-20","border-Back-High-25","border-Back-Highest-30",
    "border-Text-Highest-100","border-Text-High-90","border-Text-Low-70","border-Text-Lowest-60",
    "border-Primary-Main","border-Primary-Container",
    "border-Error-Main","border-Error-Container",
    "border-Outline","border-Outline-Variant",
    "border-Gray-Sub-High-80","border-Gray-Sub-Low-50","border-Gray-Sub-Disabled-40",
    // outline-*
    "outline-Primary-Main","outline-Outline","outline-Outline-Variant",
    // ring-*
    "ring-Primary-Main","ring-Outline",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 디자인 시스템 토큰 — CSS custom properties 참조 (globals.css에 hex 정의)
        "Back-Lowest-00":  "var(--Back-Lowest-00)",
        "Back-Low-10":     "var(--Back-Low-10)",
        "Back-Mid-20":     "var(--Back-Mid-20)",
        "Back-High-25":    "var(--Back-High-25)",
        "Back-Highest-30": "var(--Back-Highest-30)",
        "Text-Highest-100": "var(--Text-Highest-100)",
        "Text-High-90":     "var(--Text-High-90)",
        "Text-Low-70":      "var(--Text-Low-70)",
        "Text-Lowest-60":   "var(--Text-Lowest-60)",
        "Primary-Main":      "var(--Primary-Main)",
        "Primary-Container": "var(--Primary-Container)",
        "Error-Main":         "var(--Error-Main)",
        "Error-Container":    "var(--Error-Container)",
        "On-Error":           "var(--On-Error)",
        "On-Error-Container": "var(--On-Error-Container)",
        "Outline":         "var(--Outline)",
        "Outline-Variant": "var(--Outline-Variant)",
        "Gray-Sub-High-80":     "var(--Gray-Sub-High-80)",
        "Gray-Sub-Low-50":      "var(--Gray-Sub-Low-50)",
        "Gray-Sub-Disabled-40": "var(--Gray-Sub-Disabled-40)",
        "Neutral-White": "var(--Neutral-White)",
        "Neutral-Black": "var(--Neutral-Black)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
