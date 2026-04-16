/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glass: "0 25px 50px -12px rgba(15, 23, 42, 0.45)",
      },
      colors: {
        surface: {
          950: "#081120",
          900: "#0f1b2d",
          800: "#17263d",
        },
      },
      backgroundImage: {
        "board-pattern":
          "radial-gradient(circle at 10% 20%, rgba(45, 212, 191, 0.2), transparent 30%), radial-gradient(circle at 85% 15%, rgba(248, 113, 113, 0.16), transparent 25%), radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.12), transparent 40%)",
      },
    },
  },
  plugins: [],
};
