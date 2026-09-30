/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FE',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#5B4DFB',
          dark: '#4838EA',
          light: '#EEECFF',
          hover: '#4838EA'
        },
        mainText: '#181A2A',
        subText: '#7E8497',
        cardBorder: '#ECEEF6',
        divider: '#F0F2F9',
        accentPurple: '#7C3AED',
        pastel: {
          purple: '#F3E8FF',
          blue: '#E0F2FE',
          green: '#DCFCE7',
          orange: '#FFEDD5',
          pink: '#FCE7F3'
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(0,0,0,0.03)',
        card: '0 4px 20px -2px rgba(24, 26, 42, 0.04), 0 2px 6px -1px rgba(24, 26, 42, 0.02)',
        glow: '0 10px 25px -5px rgba(91, 77, 251, 0.35)',
        mobile: '0 -4px 20px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
