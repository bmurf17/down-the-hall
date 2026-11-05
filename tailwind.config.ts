import type { Config } from "tailwindcss";

const hsl = (variable: string) => `hsl(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: [
          "var(--font-fraunces)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
      animation: {
        "fade-in-grow": "fade-in 400ms, grow 400ms",
        "stamp-in": "stamp-in 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      keyframes: {
        "stamp-in": {
          from: {
            opacity: "0",
            transform: "scale(1.8) rotate(-18deg)",
          },
          to: {
            opacity: "1",
            transform: "scale(1) rotate(-8deg)",
          },
        },
        grow: {
          from: {
            transform: "scale(0.75)",
          },
          to: {
            transform: "scale(1)",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
      },
      colors: {
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        text: hsl("--foreground"),
        navbar: {
          DEFAULT: hsl("--navbar"),
          foreground: hsl("--navbar-foreground"),
        },
        card: {
          DEFAULT: hsl("--card"),
          foreground: hsl("--card-foreground"),
        },
        popover: {
          DEFAULT: hsl("--popover"),
          foreground: hsl("--popover-foreground"),
        },
        primary: {
          DEFAULT: hsl("--primary"),
          foreground: hsl("--primary-foreground"),
        },
        secondary: {
          DEFAULT: hsl("--secondary"),
          foreground: hsl("--secondary-foreground"),
        },
        muted: {
          DEFAULT: hsl("--muted"),
          foreground: hsl("--muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("--accent"),
          foreground: hsl("--accent-foreground"),
        },
        destructive: {
          DEFAULT: hsl("--destructive"),
          foreground: hsl("--destructive-foreground"),
        },
        border: hsl("--border"),
        input: hsl("--input"),
        ring: hsl("--ring"),
        chart: {
          1: hsl("--chart-1"),
          2: hsl("--chart-2"),
          3: hsl("--chart-3"),
          4: hsl("--chart-4"),
          5: hsl("--chart-5"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
