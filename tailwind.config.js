/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "LXGW WenKai",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "ui-sans-serif",
          "system-ui",
        ],
      },
      colors: {
        cream: "#fff8e7",
        rice: "#fbf2df",
        petal: "#f5cfd4",
        sage: "#b7c8ad",
        butter: "#f3d990",
        mist: "#a9bfd2",
        mauve: "#c5b8c9",
        ink: "#4c4654",
        dusk: "#2e2d4f",
      },
      boxShadow: {
        soft: "0 16px 44px rgba(91, 73, 80, 0.12)",
        glow: "0 0 28px rgba(244, 216, 136, 0.5)",
      },
    },
  },
  plugins: [],
};
