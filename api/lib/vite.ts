import type { Hono, MiddlewareHandler } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // Serve static assets with correct MIME types
  app.use("/assets/*", serveStatic({ root: "./dist/public" }));
  app.use("/uploads/*", serveStatic({ root: "./public" }));

  // SPA fallback: serve index.html for all non-API routes
  // This enables client-side routing for /admin, /shop, /blog, etc.
  app.get("*", (c) => {
    const reqPath = c.req.path;

    // Don't interfere with API routes
    if (reqPath.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }

    // For browser requests, serve index.html for SPA routing
    const accept = c.req.header("accept") ?? "";
    const isBrowser = accept.includes("text/html");

    // Try to serve as a static file first (images, fonts, etc.)
    if (!isBrowser && reqPath !== "/") {
      const relativePath = reqPath.startsWith("/") ? reqPath.slice(1) : reqPath;
      const filePath = path.resolve(distPath, relativePath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return c.newResponse(fs.readFileSync(filePath), 200, {
          "Content-Type": getContentType(filePath),
        });
      }
    }

    // Serve index.html for all SPA routes
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".json": "application/json",
    ".webp": "image/webp",
  };
  return types[ext] || "application/octet-stream";
}
