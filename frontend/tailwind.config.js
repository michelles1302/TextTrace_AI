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
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        exact: '#ef4444',
        high: '#f97316',
        paraphrase: '#f59e0b',
        related: '#3b82f6',
        original: '#10b981',
      },
    },
  },
  plugins: [],
}
