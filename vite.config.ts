import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import type { IncomingMessage, ServerResponse } from 'http'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'kanka-proxy',
      configureServer(server) {
        server.middlewares.use('/kanka-proxy', (req: IncomingMessage, res: ServerResponse) => {
          const apiPath = req.url || '/';
          const kankaPath = `/api/1.0${apiPath}`;
          const auth = (req.headers['authorization'] || '').replace('Bearer ', '');
          console.log(`[kanka-proxy] ${req.method} kanka.io${kankaPath} (token: ${auth ? auth.slice(0,20)+'...' : 'NONE'})`);

          const options = {
            hostname: 'app.kanka.io',
            path: kankaPath,
            method: req.method || 'GET',
            headers: {
              'Authorization': `Bearer ${auth}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          };

          const upstream = https.request(options, (upRes) => {
            console.log(`[kanka-proxy] response: ${upRes.statusCode} from kanka.io${kankaPath}`);
            let body = '';
            upRes.on('data', (chunk) => { body += chunk; });
            upRes.on('end', () => {
              res.statusCode = upRes.statusCode || 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(body);
            });
          });

          upstream.on('error', (err) => {
            console.error(`[kanka-proxy] error:`, err.message);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: err.message }));
          });

          upstream.end();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
