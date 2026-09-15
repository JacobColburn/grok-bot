import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: set VITE_BASE=/grok-bot/invoicepad/ for GitHub Pages; default / for root hosts
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
});
