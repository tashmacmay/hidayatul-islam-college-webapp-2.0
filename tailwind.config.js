/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        navy: {
          DEFAULT: "#0d2260",
          dark: "#081540",
        },
        "light-blue": "#3a7fc1",
        gold: {
          DEFAULT: "#c9a227",
          light: "#f0d080",
          pale: "#fdf6e3",
        },
        "off-white": "#f7f8fc",
        "text-muted": "#5a6a82",
      },
    },
  },
  plugins: [],
};