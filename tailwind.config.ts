import type { Config } from "tailwindcss"

const config: Config = {
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#e8ddca", // Beige background
        foreground: "#292520", // Dark brown text/button color
        primary: "#292520", // Accent
      },
      fontFamily: {
        jacquard: ['"Jacquard 24 Charted"', "serif"],
        kings: ["Kings", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#292520",
            a: {
              color: "#292520",
              "&:hover": {
                color: "#292520",
              },
            },
            h1: {
              color: "#292520",
            },
            h2: {
              color: "#292520",
            },
            h3: {
              color: "#292520",
            },
            h4: {
              color: "#292520",
            },
            h5: {
              color: "#292520",
            },
            h6: {
              color: "#292520",
            },
            strong: {
              color: "#292520",
            },
            code: {
              color: "#292520",
            },
            figcaption: {
              color: "#292520",
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
export default config

