/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        dark: {
          DEFAULT: '#1C1C1E',
          light: '#2C2C2E',
          lighter: '#3A3A3C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
        'card-elevated': '0 12px 40px -8px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'glow-orange': '0 0 20px -4px rgba(249, 115, 22, 0.25), 0 4px 16px -4px rgba(249, 115, 22, 0.15)',
        'glow-blue': '0 0 20px -4px rgba(59, 130, 246, 0.25), 0 4px 16px -4px rgba(59, 130, 246, 0.15)',
        'glow-green': '0 0 20px -4px rgba(34, 197, 94, 0.25), 0 4px 16px -4px rgba(34, 197, 94, 0.15)',
        'glow-purple': '0 0 20px -4px rgba(168, 85, 247, 0.25), 0 4px 16px -4px rgba(168, 85, 247, 0.15)',
        'glow-red': '0 0 20px -4px rgba(239, 68, 68, 0.25), 0 4px 16px -4px rgba(239, 68, 68, 0.15)',
        'glow-indigo': '0 0 20px -4px rgba(99, 102, 241, 0.25), 0 4px 16px -4px rgba(99, 102, 241, 0.15)',
        'inner-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
        'section-hero': '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
