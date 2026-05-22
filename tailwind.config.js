/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Winga primary sky blue #0284C7
        skybrand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Accent orange
        accent: {
          DEFAULT: '#f97316',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        navysoft: '#082f49',
        cyanice: '#bae6fd',
        market: {
          up: '#22c55e',
          down: '#ef4444',
          cyan: '#06b6d4',
          warm: '#f97316',
          gray: '#e2e8f0',
        },
      },
      fontFamily: {
        display: ['Manrope', 'Poppins', 'Inter', 'ui-sans-serif', 'sans-serif'],
        body: ['Inter', 'Manrope', 'ui-sans-serif', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(2, 132, 199, 0.10)',
        'glass-lg': '0 16px 48px rgba(2, 132, 199, 0.18)',
        'glow-sky': '0 0 24px rgba(2, 132, 199, 0.45)',
        'glow-orange': '0 0 24px rgba(249, 115, 22, 0.45)',
        card: '0 4px 24px rgba(8, 47, 73, 0.10)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floaty2: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pulseRate: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.5' },
        },
        tickerFlash: {
          '0%': { boxShadow: '0 0 0 rgba(2,132,199,0)' },
          '50%': { boxShadow: '0 0 18px rgba(2,132,199,0.75)' },
          '100%': { boxShadow: '0 0 0 rgba(2,132,199,0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        floaty2: 'floaty2 6s ease-in-out infinite',
        pulseRate: 'pulseRate 2s ease-in-out infinite',
        tickerFlash: 'tickerFlash 0.8s ease-out',
        fadeUp: 'fadeUp 0.5s ease-out',
        scaleIn: 'scaleIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}

