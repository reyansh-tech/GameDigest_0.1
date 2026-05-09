/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07080a',
        panel: '#0d0f13',
        card: '#111318',
        line: '#242832',
        muted: '#8d93a1',
        gold: '#f2c230',
        goldSoft: 'rgba(242,194,48,.14)',
        live: '#ef3e36'
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif']
      },
      boxShadow: {
        premium: '0 24px 70px rgba(0,0,0,.42)',
        glow: '0 0 0 1px rgba(242,194,48,.14), 0 24px 60px rgba(0,0,0,.35)'
      }
    }
  },
  plugins: []
};
