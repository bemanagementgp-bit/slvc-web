/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,ejs}", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        bordo: { DEFAULT: '#6B0F1A', dark: '#4A0A12', light: '#8B1425' },
        gold: '#C8A951',
        'slvc-blue': '#1a2a4a',
      },
      fontFamily: {
        nexa: ['Nexa', 'sans-serif'],
        zing: ['ZingRust', 'serif'],
        'zing-sans': ['ZingSans', 'serif'],
      },
    },
  },
  plugins: [],
}
