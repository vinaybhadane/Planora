import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import handler from './api/analyze.js';

// Synchronously load .env into process.env so serverless handlers in dev middleware have access
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore error if .env cannot be loaded
}

function localApiPlugin(): Plugin {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/plan' || url === '/api/analyze') {
          // Pre-parse POST body stream for Vite Connect middleware
          if (req.method === 'POST') {
            const rawBody = await new Promise<string>((resolve) => {
              let acc = '';
              req.on('data', (c) => { acc += c; });
              req.on('end', () => resolve(acc));
              req.on('error', () => resolve(''));
              req.resume?.();
            });
            try {
              (req as unknown as { body: Record<string, unknown> }).body = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              (req as unknown as { body: Record<string, unknown> }).body = {};
            }
          }

          const adaptedRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code;
              return adaptedRes;
            },
            json(body: unknown) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(body));
            },
          });

          try {
            await handler(
              req as unknown as Parameters<typeof handler>[0],
              adaptedRes as unknown as Parameters<typeof handler>[1]
            );
          } catch (err: unknown) {
            console.error('[vite:local-api error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            const message = err instanceof Error ? err.message : 'Internal Server Error';
            res.end(JSON.stringify({ error: message }));
          }
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
});
