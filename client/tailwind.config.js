/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vision UI Space-Dark theme surfaces
        surface: {
          base: '#060b26',    // Deep space indigo
          card: '#0a0e31',    // Semi-translucent card body
          raised: '#101540',  // Elevated element body
          hover: '#1b215c',   // Card hover accent
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          blue: '#0075ff',    // Neon blue primary
          cyan: '#00f5ff',    // Neon cyan highlights
          purple: '#b100ff',  // Electric violet
          pink: '#e00096',    // Vivid magenta
          success: '#05cd99', // Bright emerald
          warning: '#ffb547', // Solar yellow
          danger: '#ee5d50',  // Flame red
        },
        accent: {
          DEFAULT: '#0075ff', // Override default accent with neon blue
          muted: '#093a8d',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 117, 255, 0.4)',
        'neon-purple': '0 0 15px rgba(177, 0, 255, 0.4)',
        'neon-cyan': '0 0 15px rgba(0, 245, 255, 0.4)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'scanner': 'scanner 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite alternate',
      },
      keyframes: {
        scanner: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.3' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px rgba(0, 117, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 117, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};
