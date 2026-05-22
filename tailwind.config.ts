import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e17',
        secondary: '#111827',
        tertiary: '#1a2332',
        border: '#1e293b',
        foreground: '#e8ecf1',
        muted: '#8892a4',
        accent: '#00e5c3',
        accentAlt: '#00b4d8',
        danger: '#ff4757',
        warning: '#ffa502',
        success: '#2ed573'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,229,195,0.15), 0 18px 60px rgba(0,229,195,0.12)'
      },
      borderRadius: {
        xl: '0.9rem'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'slide-in': 'slide-in 220ms ease-out',
        'scale-in': 'scale-in 180ms ease-out'
      }
    }
  },
  plugins: []
};

export default config;