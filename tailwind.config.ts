import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "var(--black)",
        white: "var(--white)",
        "off-white": "var(--off-white)",
        "mid-gray": "var(--mid-gray)",
        "light-gray": "var(--light-gray)",
        red: "var(--red)",
      },
      fontFamily: {
        courier: ["Courier New", "Courier", "monospace"],
        helvetica: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        arial: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
