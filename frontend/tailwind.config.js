/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000", // black
        accent: "#dc2626", // red
        light: "#ffffff", // white
      },
    },
  },
  plugins: [],
};
