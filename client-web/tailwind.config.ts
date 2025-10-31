import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6FCF4',
          500: '#00B050', // accent green
          600: '#0ACB8B', // primary teal-green
          700: '#008A60'
        },
        jamboGreen: '#00B050',
        jamboBlack: '#000000'
      }
    }
  },
  plugins: []
} satisfies Config;