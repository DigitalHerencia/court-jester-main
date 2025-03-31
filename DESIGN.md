---
id: 99sct4rtl0zv3dpf78l9j0w
title: Overview
desc: ''
updated: 1743313527591
created: 1743311600918
---
# Court⚖️Jester Design | System

## Overview

---

This comprehensive set of files and configurations will allow you to implement the Court Jester design system in any Next.js 15 TypeScript 5 project with shadcn/ui 2. The design system features a beige/cream background with dark brown/black text and UI elements, providing a consistent and visually appealing user interface.

## Configuration

---

Here are the essential files to implement the Court Jester design system in any Next.js 15 TypeScript 5 project with shadcn/ui 2:

### 1. tailwind.config.ts

```typescript
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        border: "hsl(36, 33%, 90%)",
        input: "hsl(36, 33%, 90%)",
        ring: "hsl(36, 33%, 90%)",
        background: "hsl(36, 33%, 85%)",
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
        sans: ["var(--font-sans)", ...fontFamily.sans],
        kings: ["Kings", "serif"],
        jacquard: ['"Jacquard 24 Charted"', "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config

