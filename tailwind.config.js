/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper:  '#f7f4ee',   // warm off-white canvas
        card:   '#ffffff',
        ink:    { DEFAULT: '#1c1a17', soft: '#4a453d', faint: '#8a8378' },
        line:   '#e6e0d5',
        accent: { DEFAULT: '#b4531b', soft: '#f3e6d8' },  // burnt sienna, used sparingly
        good:   '#3f7d4e',
      },
      fontFamily: {
        // Fraunces = warm editorial serif (headings). Inter = clean body.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,26,23,.04), 0 8px 24px rgba(28,26,23,.06)',
        lift: '0 4px 12px rgba(28,26,23,.08), 0 16px 40px rgba(28,26,23,.10)',
      },
      keyframes: {
        'sheet-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        'fade': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'toast-in': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'sheet-up': 'sheet-up .28s cubic-bezier(.16,1,.3,1)',
        'fade': 'fade .2s ease-out',
        'toast-in': 'toast-in .2s ease-out',
      },
    },
  },
  plugins: [],
};
