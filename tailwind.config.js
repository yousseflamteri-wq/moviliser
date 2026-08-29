/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapped to a dark theme for the movie site
        ink: '#f4f4f5',        // Zinc 100 (White text)
        paper: '#09090b',      // Zinc 950 (Deep background)
        card: '#18181b',       // Zinc 900 (Modal background)
        line: '#27272a',       // Zinc 800 (Borders)
        'ink-soft': '#a1a1aa', // Zinc 400 (Secondary text)
        'ink-faint': '#52525b',// Zinc 600 (Muted text)
        accent: '#dc2626',     // Red 600 (Action color)
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'], // Adjust to your preferred font
      },
      animation: {
        'fade': 'fade 0.2s ease-out',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(15px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
