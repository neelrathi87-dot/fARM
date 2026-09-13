import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: "#f3f9f4",
          100: "#e3f2e5",
          200: "#c7e4cc",
          300: "#9dcea6",
          400: "#6eb17b",
          500: "#489556",
          600: "#367942",
          700: "#2c6035",
          800: "#264c2d",
          900: "#213f26",
          950: "#0d2211",
        },
        water: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        sage: {
          50: "#f6f8f6",
          100: "#eaf0ea",
          200: "#d7e2d7",
          300: "#bacab9",
          400: "#98ac98",
          500: "#7b917b",
          600: "#607460",
          700: "#4d5d4d",
          800: "#404b40",
          900: "#373f37",
        }
      },
    },
  },
  plugins: [],
};

export default config;
