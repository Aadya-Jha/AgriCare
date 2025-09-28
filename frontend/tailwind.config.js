/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // AgriCare Brand Colors
        'agricare': {
          primary: '#557153',    // Deep forest green
          secondary: '#7D8F69',  // Medium sage green
          sage: '#A9AF7E',       // Light sage
          light: '#E6E5A3',      // Cream yellow
        },
        // Primary Agricultural Green Palette
        'agri-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main agri-green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Secondary Agricultural Yellow Palette
        'agri-yellow': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Main agri-yellow
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Agricultural Earth Tones
        'agri-brown': {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        // Crop Health Status Colors
        'crop-excellent': '#10b981', // Emerald-500
        'crop-good': '#22c55e',      // Green-500
        'crop-fair': '#eab308',      // Yellow-500
        'crop-poor': '#ef4444',      // Red-500
        'crop-critical': '#dc2626',  // Red-600
        
        // Weather and Environmental
        'sky-blue': '#0ea5e9',       // Sky-500
        'soil-brown': '#a3a3a3',     // Neutral-400
        'water-blue': '#06b6d4',     // Cyan-500
        
        // Legacy colors for compatibility
        'agri-blue': '#3b82f6',
        'agri-red': '#ef4444',
        'agri-orange': '#f97316',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -2px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes
    }),
  ],
}
