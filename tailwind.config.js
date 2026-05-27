/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#111118', // near-black text
          900: '#ffffff', // pure white bg
          850: '#ffffff', // white card
          800: '#fafafc', // soft white card
          700: '#f4f4f8', // input/panel bg
          600: '#e4e4ec'  // borders
        },
        violet: {
          50:  '#f4f4ff',
          100: '#e8e8ff',
          200: '#d0d0ff',
          300: '#5468e0',
          400: '#4352c8',
          500: '#5468e0',
          600: '#4352c8',
          700: '#3540b0',
          800: '#2a3298',
          900: '#1e2480',
          glow: '#5468e0'
        },
        cyan: {
          50:  '#f4f4ff',
          100: '#e8e8ff',
          200: '#d0d0ff',
          300: '#5468e0',
          400: '#4352c8',
          500: '#5468e0',
          600: '#4352c8',
          700: '#3540b0',
          800: '#2a3298',
          900: '#1e2480',
          950: '#e8e8ff'
        },
        slate: {
          50:  '#111118',
          100: '#1e1e2a',
          200: '#2e2e3c',
          250: '#3e3e4e',
          300: '#5a5a6e',
          400: '#7a7a8e',
          500: '#9a9aae',
          600: '#c4c4d4',
          700: '#e0e0ea',
          800: '#f0f0f6',
          900: '#f8f8fc'
        },
        green: {
          950: '#e6f7ee',
          400: '#15803d',
          500: '#16a34a',
        },
        amber: {
          950: '#fef9e7',
          400: '#b45309',
          500: '#d97706',
        },
        red: {
          950: '#fef2f2',
          400: '#b91c1c',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
        },
        good: '#10b981',
        warn: '#f59e0b',
        bad:  '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px rgba(84, 104, 224, 0.12)',
        'glow-lg': '0 0 40px rgba(84, 104, 224, 0.10)',
      }
    }
  },
  plugins: []
};
