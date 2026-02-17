/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f5',
          100: '#e0e0eb',
          200: '#c2c2d6',
          300: '#9393b8',
          400: '#6b6b9a',
          500: '#4a4a7c',
          600: '#363663',
          700: '#24244a',
          800: '#141430',
          900: '#0a0a1a',
          950: '#05050d',
        },
        neon: {
          cyan: '#00f5d4',
          purple: '#b57bee',
          amber: '#ffbe0b',
          rose: '#ff4d6d',
          green: '#06d6a0',
        }
      },
    },
  },
  plugins: [],
}
