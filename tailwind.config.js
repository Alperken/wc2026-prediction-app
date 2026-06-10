/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fifa: {
          blue:    '#003F8A',
          navy:    '#001B44',
          gold:    '#C9A84C',
          lightgold: '#E8C96A',
          silver:  '#8E9BAD',
          pitch:   '#1A4731',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-dark': "linear-gradient(135deg, #001B44 0%, #003F8A 50%, #001B44 100%)",
        'hero-light': "linear-gradient(135deg, #E8F0FB 0%, #C5D8F7 50%, #E8F0FB 100%)",
        'gold-shimmer': "linear-gradient(90deg, #C9A84C, #E8C96A, #C9A84C)",
      }
    },
  },
  plugins: [],
}
