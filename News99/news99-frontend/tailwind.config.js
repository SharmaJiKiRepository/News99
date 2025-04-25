/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'gray-750': '#2d3748', // A custom color between gray-700 and gray-800
      },
    },
  },
  plugins: [],
}

