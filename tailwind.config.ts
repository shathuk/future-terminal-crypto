import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117", panel: "#151b23", raised: "#1c242e", line: "#262f3b",
        ink: "#e6edf3", mute: "#8b98a8", up: "#2bb39a", down: "#e5534b", warn: "#d29922", accent: "#4c8dff",
      },
    },
  },
  plugins: [],
};
export default config;
