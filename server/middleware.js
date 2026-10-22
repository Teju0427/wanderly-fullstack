import { getPool, sql } from './db/pool.js';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Wraps an async route handler so rejected promises reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Visitors already upserted by this process (avoids a write on every request).
const knownVisitors = new Set();

/**
 * Anonymous identity: the browser generates a UUID once and sends it as
 * `X-Visitor-Id`. We make sure a Visitors row exists for it.
 */
export const requireVisitor = asyncHandler(async (req, _res, next) => {
  const id = req.get('x-visitor-id');
  if (!id || !UUID_RE.test(id)) throw new HttpError(400, 'Missing or invalid X-Visitor-Id header');
  const visitorId = id.toLowerCase();

  if (!knownVisitors.has(visitorId)) {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, visitorId)
      .query(`
        MERGE dbo.Visitors WITH (HOLDLOCK) AS t
        USING (SELECT @id AS Id) AS s ON t.Id = s.Id
        WHEN MATCHED THEN UPDATE SET LastSeenAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT (Id) VALUES (s.Id);
      `);
    if (knownVisitors.size > 50000) knownVisitors.clear();
    knownVisitors.add(visitorId);
  }
  req.visitorId = visitorId;
  next();
});

/** Tiny fixed-window rate limiter (per instance) for public write endpoints. */
export function rateLimit({ windowMs = 60_000, max = 5 } = {}) {
  const hits = new Map();
  return (req, _res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      if (hits.size > 10000) hits.clear();
      return next();
    }
    entry.count += 1;
    if (entry.count > max) return next(new HttpError(429, 'Too many requests — please try again in a minute.'));
    next();
  };
}

export function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // mssql: 547 = FK/CHECK constraint violation, 2627/2601 = duplicate key
  if (err?.number === 547) return res.status(400).json({ error: 'Request references an unknown item.' });
  if (err?.number === 2627 || err?.number === 2601) return res.status(409).json({ error: 'Already exists.' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large.' });

  if (err?.name === 'ConnectionError' || err?.code === 'ESOCKET' || err?.code === 'ETIMEOUT') {
    console.error('[db] connection problem:', err.message);
    return res.status(503).json({ error: 'Database is temporarily unavailable.' });
  }

  const status = err?.status ?? 500;
  if (status >= 500 && status !== 503) console.error('[api]', err);
  res.status(status).json({ error: status >= 500 && status !== 503 ? 'Something went wrong on our side.' : err.message });
}
