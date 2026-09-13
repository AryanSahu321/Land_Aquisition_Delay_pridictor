/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nhai: {
          navy: "#0b2545",
          blue: "#134074",
          accent: "#1d70b8",
          gold: "#c59b27",
          surface: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
