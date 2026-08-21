import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

function jsonStoragePlugin(): Plugin {
  const dataDir = path.resolve(__dirname, './data');
  const uploadsDir = path.resolve(dataDir, 'uploads');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return {
    name: 'json-storage-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Serve uploaded files
        if (url.startsWith('/api/uploads/')) {
          const filename = path.basename(url.replace('/api/uploads/', ''));
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filename).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.pdf': 'application/pdf',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.txt': 'text/plain',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Content-Disposition', 'inline');
            return fs.createReadStream(filePath).pipe(res);
          } else {
            res.statusCode = 404;
            return res.end('File not found');
          }
        }

        // File upload endpoint (base64 or json data)
        if (url === '/api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const { fileName, fileData } = JSON.parse(body);
              if (!fileName || !fileData) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Missing fileName or fileData' }));
              }
              const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
              const filePath = path.join(uploadsDir, safeName);
              const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
              fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));

              res.setHeader('Content-Type', 'application/json');
              return res.end(
                JSON.stringify({
                  success: true,
                  url: `/api/uploads/${safeName}`,
                  fileName: safeName,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // JSON CRUD endpoints: /api/data/:key
        if (url.startsWith('/api/data/')) {
          const key = url.replace('/api/data/', '').split('?')[0].trim();
          const filePath = path.join(dataDir, `${key}.json`);

          if (req.method === 'GET') {
            try {
              if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(content || '[]');
              } else {
                fs.writeFileSync(filePath, '[]', 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end('[]');
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          if (req.method === 'POST' || req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                // Ensure valid json
                const parsed = JSON.parse(body);
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, count: Array.isArray(parsed) ? parsed.length : 1 }));
              } catch (err: any) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              }
            });
            return;
          }
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jsonStoragePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/data/**', '**/*.json', '**/data/uploads/**'],
    },
  },
});
