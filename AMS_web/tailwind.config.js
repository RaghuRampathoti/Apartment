/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#00897B', dark: '#00695C', light: '#E0F2F1', hover: '#00796B' },
        secondary: { DEFAULT: '#4DB6AC', muted: '#B2DFDB', pale: '#80CBC4' },
        sidebar: { DEFAULT: '#263238', hover: '#37474F' },
        surface: { DEFAULT: '#F1F1F1', alt: '#FFFFFF', card: '#F5F5F5' },
        textmain: { DEFAULT: '#212121', sub: '#555555', muted: '#9E9E9E' },
        success: { DEFAULT: '#10B981', bg: '#ECFDF5' },
        warning: { DEFAULT: '#F59E0B', bg: '#FFFBEB' },
        danger: { DEFAULT: '#EF4444', bg: '#FEF2F2' },
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        lg: '0 10px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
    },
  },
  plugins: [],
}
