/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",    
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your Premium Demo Colors Map
        'campus-bg':      '#050508',
        'campus-bg2':     '#0b0b12',
        'campus-bg3':     '#111120',
        'campus-cyan':    '#38d9f5',
        'campus-violet':  '#a259ff',
        'campus-pink':    '#ff5fa0',
        'campus-green':   '#4fffb0',
        'campus-muted':   '#6b6d85',
        'campus-surface': 'rgba(255,255,255,0.04)',
        'campus-border':  'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'drift-1':   'drift1 22s ease-in-out infinite alternate',
        'drift-2':   'drift2 18s ease-in-out infinite alternate',
        'drift-3':   'drift3 25s ease-in-out infinite alternate',
        'fade-up':   'fadeUp 0.6s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'blink':     'blink 1s step-end infinite',
        'bounce-typing': 'typingBounce 1.4s ease-in-out infinite',
      },
      keyframes: {
        drift1: {
          from: { transform: 'translate(0,0) scale(1)' },
          to:   { transform: 'translate(40px,30px) scale(1.08)' },
        },
        drift2: {
          from: { transform: 'translate(0,0) scale(1)' },
          to:   { transform: 'translate(-30px,40px) scale(1.05)' },
        },
        drift3: {
          from: { transform: 'translate(-50%,-50%) scale(1)' },
          to:   { transform: 'translate(-50%,-50%) scale(1.12)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(79,255,176,0.5)' },
          '50%':     { boxShadow: '0 0 0 6px rgba(79,255,176,0)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        typingBounce: {
          '0%,60%,100%': { transform: 'translateY(0)', background: '#6b6d85' },
          '30%':          { transform: 'translateY(-8px)', background: '#38d9f5' },
        },
      },
    },
  },
  plugins: [],
};