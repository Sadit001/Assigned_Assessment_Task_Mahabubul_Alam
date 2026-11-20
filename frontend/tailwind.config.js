/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080A10',
        'surface-dark': '#10141F',
        'surface-card': '#151B29',
        'surface-card-hover': '#1C2438',
        crimson: {
          DEFAULT: '#E63946',
          hover: '#FF4D5E',
          glow: 'rgba(230, 57, 70, 0.35)',
        },
        gold: {
          DEFAULT: '#D6B36A',
          hover: '#E5C47D',
          glow: 'rgba(214, 179, 106, 0.35)',
        },
        'text-main': '#F5F5F7',
        'text-muted': '#9BA3B4',
        'border-subtle': '#222B3D',
        'border-highlight': '#354360',
      },
      fontFamily: {
        display: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'crimson-glow': '0 0 25px -5px rgba(230, 57, 70, 0.4)',
        'gold-glow': '0 0 25px -5px rgba(214, 179, 106, 0.4)',
        'cinematic': '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(230, 57, 70, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
