import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'kanka-proxy',
      configureServer(server) {
        server.middlewares.use('/kanka-proxy', async (req: IncomingMessage, res: ServerResponse) => {
          const apiPath = req.url || '/';
          const kankaUrl = `https://kanka.io/api/1.0${apiPath}`;
          const auth = req.headers['authorization'] || '';
          try {
            const upstream = await fetch(kankaUrl, {
              method: req.method || 'GET',
              headers: {
                'Authorization': auth,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });
            const body = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(body);
          } catch (err) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: String(err) }));
          }
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
