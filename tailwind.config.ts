import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,md,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      fontFamily: {
        jacquard: ['"Jacquard 24 Charted"', "serif"],
        kings: ["Kings", "serif"]
      }
    },
  },
},
plugins: [],
};
export default config