/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066ff',
          dark: '#0052cc',
          light: '#f0f5ff',
        },
      },
    },
  },
  plugins: [],
}
