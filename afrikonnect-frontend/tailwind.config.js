/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green:   { DEFAULT: '#1D9E75', dark: '#0F6E56', light: '#E1F5EE' },
        orange:  { DEFAULT: '#D85A30', light: '#FBF0EB' },
        gold:    '#BA7517',
        bg:      { DEFAULT: '#0B100E', 2: '#111916' },
        surface: { DEFAULT: '#1C2620', 2: '#232E29', 3: '#2A3632' },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
