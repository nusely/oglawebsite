/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'la-veeda': {
          primary: '#8B4513',
          secondary: '#D2691E',
          accent: '#F4A460',
        },
        'afrismocks': {
          primary: '#FF6B35',
          secondary: '#F7931E',
          accent: '#FFD23F',
        },
        'ogribusiness': {
          primary: '#2E7D32',
          secondary: '#4CAF50',
          accent: '#8BC34A',
        },
        // Custom golden color
        'golden': {
          50: '#fefdf7',
          100: '#fdf9e8',
          200: '#faf0c3',
          300: '#f6e39a',
          400: '#f0d16c',
          500: '#b5a033',
          600: '#a08f2e',
          700: '#857429',
          800: '#6c5d24',
          900: '#5a4d1f',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
