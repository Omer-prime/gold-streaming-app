/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5C3BFF',
        primarySoft: '#F2EFFF',
        accent: '#FFB800',
        text: '#111827',
        muted: '#9CA3AF',
        background: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
