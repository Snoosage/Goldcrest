import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'
import type { IncomingMessage, ServerResponse } from 'http'

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
      const next = upRes.headers.location.startsWith('http') ? upRes.headers.location : `https://kanka.io${upRes.headers.location}`;
      console.log(`[kanka-proxy] redirect ${upRes.statusCode} → ${next}`);
      upRes.resume();
      kankaRequest(next, auth, res, redirects - 1);
      return;
    }
    let body = '';
    upRes.on('data', (chunk) => { body += chunk; });
    upRes.on('end', () => {
      console.log(`[kanka-proxy] ${upRes.statusCode} — ${body.slice(0, 300)}`);
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

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'kanka-proxy',
      configureServer(server) {
        server.middlewares.use('/kanka-proxy', (req: IncomingMessage, res: ServerResponse) => {
          const apiPath = req.url || '/';
          const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
          const url = `https://api.kanka.io/1.0${apiPath}`;
          kankaRequest(url, auth, res);
        });
      },
    },
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
