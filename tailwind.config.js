/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        security: {
          bg: '#101830',        // Deep CCTV Monitor Navy
          card: '#0F1629',      // Rich Navy Surface
          cardAlt: '#141B32',   // Elevated Card Surface
          blue: '#1A3370',      // Royal Navy Blue
          lightBlue: '#4A90E2', // Premium Tech Blue
          gold: '#C9A84C',      // Rich Antique Gold
          goldHover: '#B8962F', // Deep Gold Hover
          textGray: '#A0AEC0',  // Warm Silver Gray
          goldLight: 'rgba(201, 168, 76, 0.08)',
          border: '#1C2540',    // Subtle Navy Border
          accent: '#2A3F6F',    // Accent Navy
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(201, 168, 76, 0.12), 0 0 50px rgba(201, 168, 76, 0.06)',
        'blue-glow': '0 0 25px rgba(74, 144, 226, 0.12), 0 0 50px rgba(74, 144, 226, 0.06)',
        'card-glow': '0 8px 40px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
