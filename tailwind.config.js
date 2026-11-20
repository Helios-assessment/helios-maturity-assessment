/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0b1730", 800: "#12224a", 700: "#1b3166", 100: "#e6ebf5" },
        gold: { 700: "#6f4f12", 600: "#8a6418", 500: "#a97c22", 300: "#d9bd7a", 100: "#f7efdc" },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
        sans: ["system-ui", "-apple-system", "'Segoe UI'", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
