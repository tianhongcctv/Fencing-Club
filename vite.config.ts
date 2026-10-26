import devServer from "@hono/vite-dev-server";
import path from "path";
const __dirname = import.meta.dirname;
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { inspectAttr } from "kimi-plugin-inspect-react";
import { hasValidAccessCookie, loginPage } from "./api/routes/access-gate";

// The Hono development adapter normally handles API routes only. This small
// Vite middleware applies the same gate to pages and assets in preview mode.
function developmentAccessGate(): Plugin {
  return {
    name: "development-access-gate",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "/").split("?")[0];
        if (
          pathname.startsWith("/api/") ||
          pathname.startsWith("/access/") ||
          hasValidAccessCookie(req.headers.cookie)
        ) {
          next();
          return;
        }
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
        if (req.method !== "GET") {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Unauthorized" }));
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(loginPage());
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    developmentAccessGate(),
    devServer({
      entry: "api/boot.ts",
      exclude: [/^\/(?!(?:api|access)\/).*$/],
    }),
    inspectAttr(),
    react(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      db: path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
