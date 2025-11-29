/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f5',
          100: '#eeeeee',
          200: '#e0e0e0',
          300: '#bdbdbd',
          400: '#9e9e9e',
          500: '#757575',
          600: '#616161',
          700: '#424242',
          800: '#212121',
          900: '#000000', // black
          950: '#000000',
        },
        secondary: {
          50: '#ffffff',
          100: '#f9f9f9',
          200: '#f5f5f5',
          300: '#eeeeee',
          400: '#e0e0e0',
          500: '#bdbdbd',
          600: '#9e9e9e',
          700: '#757575',
          800: '#424242',
          900: '#212121',
          950: '#000000',
        },
        success: {
          50: '#f0f0f0',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#b8b8b8',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#202020',
          900: '#000000',
        },
        warning: {
          500: '#808080',
          600: '#606060',
        },
        danger: {
          500: '#404040',
          600: '#202020',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
