import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const uiRoot = path.dirname(fileURLToPath(import.meta.url));
const eveSrc = path.resolve(uiRoot, "../node_modules/eve/dist/src");
const reactPkg = path.resolve(uiRoot, "node_modules/react");
const reactDomPkg = path.resolve(uiRoot, "node_modules/react-dom");

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      react: reactPkg,
      "react-dom": reactDomPkg,
    },
  },
  plugins: [
    react(),
    {
      name: "eve-hash-imports",
      resolveId(id) {
        if (!id.startsWith("#") || !id.endsWith(".js")) return null;
        return path.join(eveSrc, id.slice(1));
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/eve": { target: "http://127.0.0.1:8787", timeout: 0 },
      "/.well-known/workflow": { target: "http://127.0.0.1:8787", timeout: 0 },
    },
  },
});
