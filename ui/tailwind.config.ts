import type { Config } from "tailwindcss";

const config = {
  // No necesitas dark si no lo vas a usar
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
} satisfies Config;

export default config;
