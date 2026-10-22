import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import apiRouter from './routes/api.js';
import { errorHandler, securityHeaders } from './middleware.js';
import { isDbConfigured, closePool } from './db/pool.js';
import { migrate } from './db/migrate.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, '..', 'dist');
const PORT = Number(process.env.PORT ?? 8080); // Azure App Service injects PORT

const app = express();
app.set('trust proxy', true); // behind Azure's front-end load balancer
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json({ limit: '32kb' }));

app.use('/api', apiRouter);

// Serve the built React app (npm run build → dist/) with SPA fallback.
if (existsSync(distDir)) {
  app.use(
    '/assets',
    express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false })
  );
  app.use(express.static(distDir, { maxAge: 0, index: false }));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.set('Cache-Control', 'no-cache').sendFile(path.join(distDir, 'index.html'));
  });
} else {
  console.warn('[web] dist/ not found — run `npm run build` to serve the frontend from this server.');
}

app.use(errorHandler);

async function start() {
  if (!isDbConfigured()) {
    console.warn('[db] No database configured — API data endpoints will return 503. See .env.example.');
  } else if (process.env.DB_AUTO_MIGRATE !== 'false') {
    // Creates tables if missing and upserts the catalog. Safe on every boot.
    try {
      await migrate({ seed: true });
    } catch (e) {
      console.error('[db] auto-migration failed (server keeps running):', e.message);
    }
  }

  const server = app.listen(PORT, () => console.log(`[web] Wanderly listening on http://localhost:${PORT}`));

  const shutdown = () => {
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();

export default app;
