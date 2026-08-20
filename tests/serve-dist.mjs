import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = process.argv[2] ?? "dist";
const dist = path.resolve(import.meta.dirname, "..", outputDirectory);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url ?? "/", "http://local").pathname,
  );
  const relativePath = pathname.endsWith("/")
    ? `${pathname.slice(1)}index.html`
    : pathname.slice(1);
  const filePath = path.resolve(dist, relativePath);

  if (!filePath.startsWith(`${dist}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type":
        contentTypes[path.extname(filePath)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.listen(4321, "127.0.0.1");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
