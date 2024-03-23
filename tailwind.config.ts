import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import defaultColors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        ai: "linear-gradient(135deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 100%);",
      },
      minHeight: {
        // @ts-expect-error screen can be an array
        screen: ["100vh", "100dvh"],
      },
      height: {
        // @ts-expect-error screen can be an array
        screen: ["100vh", "100dvh"],
      },
      fontFamily: {
        sans: ["Wanted\\ Sans", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: defaultColors.blue[600],
          secondary: defaultColors.zinc[600],
          accent: defaultColors.amber[600],
          neutral: defaultColors.slate[500],
          "base-100": defaultColors.slate[50],
        },
      },
    ],
  },
};

export default config;
