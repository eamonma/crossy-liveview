module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        hasHover: { raw: "(hover: hover)" },
      },
    },
    fontFamily: {
      sans: ["Source Sans Pro", "sans-serif"],
      serif: ["Source Serif Pro", "serif"],
    },
  },
  plugins: [],
}
