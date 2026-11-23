/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sejda: {
          teal: '#00bed6',
          tealDark: '#0891b2',
          mint: '#00e5ff',
          navy: '#2c3e50',
          navyLight: '#34495e',
          blue: '#3498db',
          darkBg: '#1e293b',
          lightBg: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
