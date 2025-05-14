import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import vercel from 'vite-plugin-vercel';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: process.env.PORT as unknown as number,
    cors: {
      origin: true,
    },
  },
  plugins: [
    react(),
    vercel()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
