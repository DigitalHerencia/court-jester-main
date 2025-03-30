import type { Config } from "tailwindcss"
import typography from '@tailwindcss/typography';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      colors: {
        border: "hsl(36, 33%, 90%)",
        input: "hsl(36, 33%, 90%)",
        ring: "hsl(36, 33%, 90%)",
        background: " hsl(38, 44%, 85%)",
        foreground: "hsl(36, 10%, 15%)",
        primary: {
          DEFAULT: "hsl(36, 10%, 15%)",
          foreground: "hsl(36, 33%, 85%)",
        },
        secondary: {
          DEFAULT: "hsl(25, 29%, 28%)",
          foreground: "hsl(36, 33%, 85%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 65%, 40%)",
          foreground: "hsl(36, 33%, 85%)",
        },
        muted: {
          DEFAULT: "hsl(36, 10%, 20%)",
          foreground: "hsl(36, 33%, 70%)",
        },
        accent: {
          DEFAULT: "hsl(36, 33%, 75%)",
          foreground: "hsl(36, 10%, 15%)",
        },
        popover: {
          DEFAULT: "hsl(36, 33%, 85%)",
          foreground: "hsl(36, 10%, 15%)",
        },
        card: {
          DEFAULT: "hsl(36, 33%, 85%)",
          foreground: "hsl(36, 10%, 15%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        kings: ["Kings", "serif"],
        jacquard: ['"Jacquard 24 Charted"', "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "100" },
        },
        "accordion-up": {
          from: { height:"100" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate,typography],
} satisfies Config

export default config