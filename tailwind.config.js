/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{pug, html}"],
  theme: {
    screens: {
      sm: "640px",
      md: "880px",
      lg: "1024px",
      xl: "1440px",
    },
    fontFamily: {
      // comfortaa: ["Comfortaa", "cursive"],
    },
    extend: {
      boxShadow: { black: "10px 5px 5px black" },
      colors: {},
    },
  },
  plugins: [],
};
