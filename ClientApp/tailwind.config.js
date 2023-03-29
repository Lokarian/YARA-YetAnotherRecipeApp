/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background : '#e8eddb',
        card : '#fef6db',
        text: '#595236',
        primary: '#798154',
        highlight: '#eca881',
        success: '#c4ecd4',
        warning: '#C25F59'
      }
    },
  },
  plugins: [],
}
