/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ---- Showroom material palette ---- */
        stone: {
          50: '#FAF7F5',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        wood: { DEFAULT: '#A67B5B', dark: '#8A6446', light: '#C49A78' },
        aluminum: { DEFAULT: '#E2E8F0', dark: '#CBD5E1', light: '#F1F5F9' },
        leather: '#5B4636',

        /* ---- Legacy ilkal-* tokens remapped onto the stone system ----
           Every existing page references these, so remapping them migrates
           the whole site to Material-Minimalism in one move. */
        ilkal: {
          deep: '#1C1917',   // Stone-900 — primary text / dark sections
          maroon: '#292524', // Stone-800 — headings, solid buttons
          rose: '#A67B5B',   // warm wood — secondary accent
          gold: '#A67B5B',   // warm wood — was the "shimmer" accent
          cream: '#FAF7F5',  // Stone-50 — page background
        },
      },
      fontFamily: {
        /* Display = Cabinet Grotesk, Body = Satoshi.
           serif/sans/script aliases kept so existing class names keep working. */
        display: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Satoshi"', 'system-ui', 'sans-serif'],
        serif: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        script: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { display: '-0.05em' },
      borderRadius: { '4xl': '2rem' /* 32px */ },
      backdropBlur: { showroom: '12px' },
      boxShadow: {
        card: '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.06)',
        'card-hover': '0 12px 40px rgba(28,25,23,0.12)',
        active: '0 20px 50px rgba(28,25,23,0.18)',
      },
      transitionTimingFunction: { showroom: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in-up': 'fadeUp 0.8s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
