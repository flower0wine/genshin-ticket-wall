import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://flower0wine.github.io/genshin-ticket-wall/
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/genshin-ticket-wall/" : "/",
  plugins: [react()],
  build: { target: "es2022" },
}));