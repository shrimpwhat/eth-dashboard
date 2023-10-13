import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  resolve: {
    alias: {
      buffer: "buffer/",
      events: "events",
    },
  },
  plugins: [react()],
});
