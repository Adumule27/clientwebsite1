import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const CLIENT_DIR = path.resolve(__dirname, 'dist/client');
const SERVER_ENTRY = path.resolve(__dirname, 'dist/server/index.js');

// Standard MIME types for web assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

// Verify production build existence
if (!fs.existsSync(SERVER_ENTRY)) {
  console.error(`[Server] Error: Server entry not found at ${SERVER_ENTRY}`);
  console.error(`[Server] Please run 'npm run build' before starting the server.`);
  process.exit(1);
}

// Dynamically load the compiled TanStack Start server entry
let serverHandler;
try {
  const mod = await import(SERVER_ENTRY);
  serverHandler = mod.default || mod;
  if (typeof serverHandler.fetch !== 'function' && typeof mod.createServerEntry === 'function') {
    // If default is not the handler object directly, check if createServerEntry is exported
    serverHandler = mod.default?.fetch ? mod.default : mod;
  }
} catch (err) {
  console.error('[Server] Fatal: Failed to load server entry module:', err);
  process.exit(1);
}

function getSafeFilePath(clientDir, urlPath) {
  try {
    const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
    const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
    const candidatePath = path.join(clientDir, safePath);

    // Prevent directory traversal outside of CLIENT_DIR
    if (!candidatePath.startsWith(clientDir)) {
      return null;
    }
    return candidatePath;
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Health check endpoint for Render, load balancers, and container orchestrators
    if (pathname === '/healthz' || pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('OK');
      return;
    }

    // Attempt to serve static client asset if available in dist/client
    if (fs.existsSync(CLIENT_DIR)) {
      const candidatePath = getSafeFilePath(CLIENT_DIR, pathname);
      if (candidatePath && fs.existsSync(candidatePath)) {
        const stat = fs.statSync(candidatePath);
        if (stat.isFile()) {
          const ext = path.extname(candidatePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';

          // Cache control: immutable for hashed build assets, standard for other static files
          if (pathname.startsWith('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }

          // ETag validation
          const etag = `"${stat.size}-${stat.mtimeMs}"`;
          res.setHeader('ETag', etag);

          if (req.headers['if-none-match'] === etag) {
            res.statusCode = 304;
            res.end();
            return;
          }

          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size,
          });

          if (req.method === 'HEAD') {
            res.end();
            return;
          }

          const stream = fs.createReadStream(candidatePath);
          stream.pipe(res);
          return;
        }
      }
    }

    // SSR & API routing through TanStack Start's Web API fetch handler
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `${HOST}:${PORT}`;
    const fullUrl = `${protocol}://${host}${rawUrl}`;

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          for (const item of val) headers.append(key, item);
        } else {
          headers.set(key, val);
        }
      }
    }

    let body = undefined;
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body,
      duplex: body ? 'half' : undefined,
    });

    const webResponse = await serverHandler.fetch(webRequest);

    res.statusCode = webResponse.status;
    webResponse.headers.forEach((val, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, val);
      }
    });

    if (webResponse.body && req.method !== 'HEAD') {
      const reader = webResponse.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    }
    res.end();
  } catch (err) {
    console.error('[Server] Request processing error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Internal Server Error');
    } else {
      res.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[Server] Production Node.js server listening on http://${HOST}:${PORT}`);
  console.log(`[Server] Health check endpoint available at http://${HOST}:${PORT}/healthz`);
});

// Graceful shutdown handling
function shutdown(signal) {
  console.log(`[Server] Received ${signal}. Closing HTTP server...`);
  server.close(() => {
    console.log('[Server] HTTP server closed gracefully. Exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Server] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
