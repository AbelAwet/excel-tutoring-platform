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
        // Enhanced EXCEL Brand Colors - More Vibrant!
        navy: {
          50: '#e8f0ff',
          100: '#d4e4ff',
          200: '#b3ccff',
          300: '#85a8ff',
          400: '#5c7cff',
          500: '#3d5eff',
          600: '#2541f5',
          700: '#1d32d8',
          800: '#1e2bae',
          900: '#1f2989', // Primary Navy Blue - Deeper & Richer
          950: '#141b52',
        },
        lightblue: {
          50: '#eff9ff',
          100: '#def2ff',
          200: '#b6e7ff',
          300: '#75d7ff',
          400: '#2cc5ff',
          500: '#00aff5', // Secondary Light Blue - More Vibrant
          600: '#008dd1',
          700: '#0070a9',
          800: '#005f8b',
          900: '#064e73',
        },
        gold: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#ffe485',
          300: '#ffcf46',
          400: '#ffb81c',
          500: '#ff9500', // Accent Gold - Brighter Orange-Gold
          600: '#e26d00',
          700: '#bb4902',
          800: '#983808',
          900: '#7c2e0b',
        },
        // Additional Accent Colors
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // Keep primary/secondary for backward compatibility
        primary: {
          50: '#e8f0ff',
          100: '#d4e4ff',
          200: '#b3ccff',
          300: '#85a8ff',
          400: '#5c7cff',
          500: '#3d5eff',
          600: '#2541f5',
          700: '#1d32d8',
          800: '#1e2bae',
          900: '#1f2989',
        },
        secondary: {
          50: '#eff9ff',
          100: '#def2ff',
          200: '#b6e7ff',
          300: '#75d7ff',
          400: '#2cc5ff',
          500: '#00aff5',
          600: '#008dd1',
          700: '#0070a9',
          800: '#005f8b',
          900: '#064e73',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
