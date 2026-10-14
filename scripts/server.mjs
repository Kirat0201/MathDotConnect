import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};
const allowed = new Set([
  'index.html',
  'app.js',
  'style.css',
  'explore_equations.html',
  'your_fav_equations.html',
  'share_your_fav_equations.html',
  'src/catalog.js',
  'src/domain.js',
]);

export function makeServer() {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    res.setHeader('Cache-Control', 'no-cache');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }
    let path;
    try {
      path =
        decodeURIComponent(
          new URL(req.url, 'http://localhost').pathname,
        ).replace(/^\//, '') || 'index.html';
    } catch {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }
    if (path === 'healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(req.method === 'HEAD' ? undefined : '{"status":"ok"}');
      return;
    }
    if (!allowed.has(path)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    try {
      const full = await realpath(resolve(root, path));
      if (!full.startsWith(root + sep)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const info = await stat(full);
      if (!info.isFile()) throw new Error('Not a file');
      res.writeHead(200, {
        'Content-Type': types[extname(full)] || 'application/octet-stream',
        'Content-Length': info.size,
      });
      res.end(req.method === 'HEAD' ? undefined : await readFile(full));
    } catch {
      if (!res.headersSent) res.writeHead(404);
      res.end('Not found');
    }
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || '127.0.0.1';
  const server = makeServer();
  server.listen(port, host, () =>
    console.log(`MathDotConnect: http://${host}:${server.address().port}`),
  );
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => server.close(() => process.exit(0)));
}
