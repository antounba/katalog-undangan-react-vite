/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ocean': {
          900: '#0c4a6e', // Biru Laut Dalam
          800: '#075985',
        },
        'luxury-amber': {
          500: '#f59e0b', // Ornamen Amber
          600: '#d97706',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'], // Untuk kesan undangan elegan
      }
    },
  },
  plugins: [],
}