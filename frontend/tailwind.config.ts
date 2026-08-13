import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Grounded in the wood-fired grill / kitchen order-slip subject —
        // not the generic cream+terracotta or near-black+neon defaults.
        char: {
          900: "#1F1B16", // warm near-black, back-of-house screens
          800: "#2A241D",
          700: "#3A322A",
        },
        ember: {
          400: "#F0754A",
          500: "#E85333", // primary action / fire accent
          600: "#C7401F",
          700: "#A1311C",
        },
        brass: {
          400: "#D6A54A",
          500: "#C08A2E", // secondary accent, admin surfaces
          600: "#9C6F22",
        },
        paper: {
          50: "#FFFDFA",
          100: "#F6F0E4", // front-of-house background, paper stock
          200: "#EDE3CE",
          300: "#DCCBA8",
        },
        herb: {
          500: "#4B5D3A", // ready / success
          600: "#3C4A2E",
        },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        order: "0 6px 16px rgba(31,27,22,0.18)",
        card: "0 2px 10px rgba(31,27,22,0.08)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 1px 1px, rgba(31,27,22,0.035) 1px, transparent 0)",
        // Warm orange -> coral -> berry, used on the sign-in screen and
        // primary call-to-action surfaces to give the app some punch
        // instead of sitting entirely on the muted paper/char palette.
        "flame-gradient":
          "linear-gradient(135deg, #FF9142 0%, #FF5C6C 55%, #C0396E 100%)",
        "flame-gradient-soft":
          "linear-gradient(135deg, #FFB177 0%, #FF7A8A 100%)",
        "flame-gradient-page":
          "linear-gradient(160deg, #FFF4EC 0%, #FFE7E1 45%, #FDE3EE 100%)",
        "flame-gradient-dark":
          "linear-gradient(160deg, #241A1F 0%, #3A1F22 50%, #2E1826 100%)",
      },
      backgroundSize: {
        grain: "14px 14px",
      },
    },
  },
  plugins: [],
};

export default config;
