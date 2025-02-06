/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    theme: {
      extend: {
        fontFamily: {
          inter: ['Inter', 'sans-serif'],
          montserrat: ['Montserrat', 'sans-serif'],
          poppins: ['Poppins', 'sans-serif'],
          cormorant: ['Cormorant Garamond', 'serif'],
        },
        screens: {
          'max-xl': { 'max': '1200px' }, // Custom max-width breakpoint
          'max-900': { 'max': '900px' }, // Custom max-width breakpoint
          'max-640': { 'max': '640px' }, // Custom max-width breakpoint
        },
      },
    },
  
  plugins: [],
}

