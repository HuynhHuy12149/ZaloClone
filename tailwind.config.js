/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        zalo: {
          blue: "#0068ff",
          primary: "#0068ff",
          lightBlue: "#e8f0fe",
          darkBg: "#000000",
          darkCard: "#1c1c1e",
          darkSection: "#111111",
          darkInput: "#2c2c2e",
          darkBorder: "#2c2c2e",
          darkText: "#f9f9f9",
          darkMuted: "#8e8e93",
          lightBg: "#f2f2f7",
          lightCard: "#ffffff",
          lightSection: "#f2f2f7",
          lightInput: "#e5e5ea",
          lightBorder: "#e5e7eb",
          lightText: "#0a0a0a",
          lightMuted: "#6b7280",
          online: "#22c55e",
          badge: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
