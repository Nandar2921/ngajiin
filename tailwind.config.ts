import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
      },
      colors: {
        dark: {
          bg: '#1a1a2e',
          card: '#16213e',
          text: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
module.exports = {
  darkMode: 'class',
  // ... sisanya
}
export default config;