/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#14100d',
          1: '#1a1410',
          2: '#221a14',
          3: '#2a2018',
          4: '#332720',
        },
        copper: {
          50:  '#f5dec8',
          100: '#e8b591',
          200: '#db9f75',
          300: '#c8794a',
          400: '#a85f33',
          500: '#804012',
          600: '#5c2d0a',
          700: '#3e2411',
        },
        // 'ink' en lugar de 'text' para evitar conflictos con utilities text-*
        ink: {
          1: '#f4e6d7',
          2: '#c9b29c',
          3: '#8a7866',
          4: '#574a3f',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Times New Roman', 'serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,121,74,0.18), transparent 60%)',
      },
      boxShadow: {
        'copper-glow': '0 0 0 1px rgba(200,121,74,0.4), 0 0 24px rgba(200,121,74,0.18), 0 4px 16px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
