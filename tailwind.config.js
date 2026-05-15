/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--line-hsl) / <alpha-value>)",
        input: "hsl(var(--line-hsl) / <alpha-value>)",
        ring: "hsl(var(--accent-hsl) / <alpha-value>)",
        background: "hsl(var(--paper-hsl) / <alpha-value>)",
        foreground: "hsl(var(--ink-hsl) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--accent-hsl) / <alpha-value>)",
          foreground: "hsl(var(--paper-hsl) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--paper-2-hsl) / <alpha-value>)",
          foreground: "hsl(var(--ink-2-hsl) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--err-hsl) / <alpha-value>)",
          foreground: "hsl(var(--paper-hsl) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--paper-2-hsl) / <alpha-value>)",
          foreground: "hsl(var(--ink-3-hsl) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--paper-3-hsl) / <alpha-value>)",
          foreground: "hsl(var(--ink-2-hsl) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--paper-hsl) / <alpha-value>)",
          foreground: "hsl(var(--ink-hsl) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--paper-hsl) / <alpha-value>)",
          foreground: "hsl(var(--ink-hsl) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
        'mobile-nav': 'var(--mobile-nav-total)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'dialog-overlay-show': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'dialog-content-show': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'dialog-overlay-show': 'dialog-overlay-show 150ms ease-out',
        'dialog-content-show': 'dialog-content-show 150ms ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}