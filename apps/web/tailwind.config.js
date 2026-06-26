/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

module.exports = config;
