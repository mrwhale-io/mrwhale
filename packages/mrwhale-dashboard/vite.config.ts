import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const options = {
  target: "http://localhost:53134",
  changeOrigin: true,
  secure: false,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/authorize": options,
      "/api": options,
    },
  },
});
