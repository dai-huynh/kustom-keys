/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{pug, html}"],
  theme: {
    extend: {
      backgroundImage: {
        "kustom-keys":
          "url('/public/images/kustom-keys-high-resolution-logo-black-on-transparent-background_1.svg')",
      },
      fontFamily: {
        comfortaa: ["Comfortaa", "cursive"],
        "open-sans": ["Open Sans", "sans-serif"],
      },
      screens: {
        md: "700px",
      },
    },
  },
  plugins: [],
};
