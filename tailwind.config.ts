import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#0C0C0C',
        'card-bg': '#151515',
        primary: '#F3B25E',
        'text-primary': '#FFFFFF',
        'text-muted': '#A0A0A0',
        border: '#222222',
        'roblox-blue': '#0074FF',
        'stock-disabled': '#5A452B',
        'stock-disabled-text': '#D4C4A8',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '24px',
        'xl': '32px',
        'card': '16px',
        'sm': '8px',
        'pill': '9999px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
