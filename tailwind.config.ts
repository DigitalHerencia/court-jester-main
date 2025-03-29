import type { Config } from "tailwindcss";

const config: Config = {
  // For Next.js 15, ensure you include your app, pages, components, and any custom directories:
  content: [
    "./app/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,md,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebarBorder: "var(--sidebar-border)",
        sidebarAccent: "var(--sidebar-accent)",
        sidebarWidthIcon: "var(--sidebar-width-icon)",
        sidebarWidth: "var(--sidebar-width)",
      },
      fontFamily: {
        jacquard: ['"Jacquard 24 Charted"', "serif"],
        kings: ["Kings", "serif"]
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
