/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: '#C1272D',
          gold: '#D4961F',
        },
        status: {
          green: '#22C55E',
          yellow: '#EAB308',
          red: '#C1272D',
        },
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
