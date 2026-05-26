import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'
import fs from 'fs'
import type { IncomingMessage, ServerResponse } from 'http'

const CACHE_FILE = path.resolve(__dirname, 'kanka-cache.json');

function kankaRequest(urlStr: string, auth: string, res: ServerResponse, redirects = 5) {
  const url = new URL(urlStr);
  const mod = url.protocol === 'https:' ? https : http;
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'GoldcrestArchive/1.0',
    },
  };
  console.log(`[kanka-proxy] → ${urlStr}`);
  const req = mod.request(options, (upRes) => {
    if ([301,302,303,307,308].includes(upRes.statusCode!) && upRes.headers.location && redirects > 0) {
      const next = upRes.headers.location.startsWith('http') ? upRes.headers.location : `https://api.kanka.io${upRes.headers.location}`;
      upRes.resume();
      kankaRequest(next, auth, res, redirects - 1);
      return;
    }
    let body = '';
    upRes.on('data', (chunk) => { body += chunk; });
    upRes.on('end', () => {
      console.log(`[kanka-proxy] ${upRes.statusCode} — ${body.slice(0, 150)}`);
      res.statusCode = upRes.statusCode || 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(body);
    });
  });
  req.on('error', (err) => {
    console.error(`[kanka-proxy] error:`, err.message);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: err.message }));
  });
  req.end();
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
  });
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'kanka-proxy',
      configureServer(server) {
        // Read cache
        server.middlewares.use('/cache/read', (_req: IncomingMessage, res: ServerResponse) => {
          if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            console.log(`[cache] loaded from ${CACHE_FILE}`);
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'No cache file found' }));
          }
        });

        // Write cache
        server.middlewares.use('/cache/write', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
          const body = await readBody(req);
          fs.writeFileSync(CACHE_FILE, body, 'utf-8');
          console.log(`[cache] saved to ${CACHE_FILE}`);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        });

        // Kanka proxy
        server.middlewares.use('/kanka-proxy', (req: IncomingMessage, res: ServerResponse) => {
          const apiPath = req.url || '/';
          const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
          kankaRequest(`https://api.kanka.io/1.0${apiPath}`, auth, res);
        });
      },
    },
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
