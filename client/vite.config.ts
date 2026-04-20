import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env vars for this mode so we can use them inside vite.config
  const env = loadEnv(mode, process.cwd(), "");

  // In dev the proxy target is always local; in prod there is no proxy.
  const backendTarget = env.VITE_API_BASE_URL || "http://localhost:5000";

  return {
    plugins: [
      tailwindcss(), // Tailwind v4 — no config file needed
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        // Only active during `npm run dev`.
        // All /api calls are forwarded to the backend server.
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
