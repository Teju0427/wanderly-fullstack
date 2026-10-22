import { Router } from 'express';
import { getPool, sql, isDbConfigured } from '../db/pool.js';
import { getCatalog, getItemType } from '../repositories/catalog.js';
import { asyncHandler, HttpError, rateLimit, requireVisitor, UUID_RE } from '../middleware.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[a-z0-9-]{1,64}$/;
const MAX_DAYS = 14;
const MAX_ACTIVITIES_PER_DAY = 20;

/* ------------------------------ Health ------------------------------ */

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    if (!isDbConfigured()) return res.status(503).json({ status: 'degraded', database: 'not-configured' });
    try {
      const pool = await getPool();
      await pool.request().query('SELECT 1 AS ok');
      res.json({ status: 'ok', database: 'connected' });
    } catch (e) {
      res.status(503).json({ status: 'degraded', database: 'unreachable', detail: e.message });
    }
  })
);

/* ------------------------------ Catalog ----------------------------- */

const catalogCache = (res) => res.set('Cache-Control', 'public, max-age=60');

router.get(
  '/catalog',
  asyncHandler(async (_req, res) => {
    catalogCache(res).json(await getCatalog());
  })
);

router.get(
  '/destinations',
  asyncHandler(async (req, res) => {
    let { destinations } = await getCatalog();
    const { q, category, maxPrice, minRating } = req.query;
    if (q) {
      const needle = String(q).toLowerCase();
      destinations = destinations.filter((d) =>
        [d.name, d.region, d.tagline].some((f) => f?.toLowerCase().includes(needle))
      );
    }
    if (category && category !== 'All') destinations = destinations.filter((d) => d.category === category);
    if (maxPrice) destinations = destinations.filter((d) => d.price <= Number(maxPrice));
    if (minRating) destinations = destinations.filter((d) => d.rating >= Number(minRating));
    catalogCache(res).json(destinations);
  })
);

router.get(
  '/destinations/:id',
  asyncHandler(async (req, res) => {
    const { destinations } = await getCatalog();
    const d = destinations.find((x) => x.id === req.params.id);
    if (!d) throw new HttpError(404, 'Destination not found');
    catalogCache(res).json(d);
  })
);

router.get(
  '/experiences',
  asyncHandler(async (_req, res) => {
    catalogCache(res).json((await getCatalog()).experiences);
  })
);

router.get(
  '/stays',
  asyncHandler(async (_req, res) => {
    catalogCache(res).json((await getCatalog()).stays);
  })
);

/* ------------------------------ Wishlist ---------------------------- */

router.get(
  '/wishlist',
  requireVisitor,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const { recordset } = await pool
      .request()
      .input('visitorId', sql.UniqueIdentifier, req.visitorId)
      .query(`SELECT ItemId, ItemType, CreatedAt FROM dbo.WishlistItems
              WHERE VisitorId = @visitorId ORDER BY CreatedAt`);
    res.set('Cache-Control', 'no-store').json({
      items: recordset.map((r) => ({ itemId: r.ItemId, itemType: r.ItemType, savedAt: r.CreatedAt })),
    });
  })
);

router.post(
  '/wishlist',
  requireVisitor,
  asyncHandler(async (req, res) => {
    const itemId = String(req.body?.itemId ?? '');
    if (!ID_RE.test(itemId)) throw new HttpError(400, 'itemId is required');
    const itemType = await getItemType(itemId);
    if (!itemType) throw new HttpError(404, 'Unknown item');

    const pool = await getPool();
    await pool
      .request()
      .input('visitorId', sql.UniqueIdentifier, req.visitorId)
      .input('itemId', sql.NVarChar(64), itemId)
      .input('itemType', sql.NVarChar(16), itemType)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WishlistItems WHERE VisitorId = @visitorId AND ItemId = @itemId)
          INSERT INTO dbo.WishlistItems (VisitorId, ItemId, ItemType) VALUES (@visitorId, @itemId, @itemType);
      `)
      .catch((e) => {
        if (e.number !== 2627) throw e; // concurrent duplicate insert — already saved
      });
    res.status(201).json({ itemId, itemType });
  })
);

router.delete(
  '/wishlist/:itemId',
  requireVisitor,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    await pool
      .request()
      .input('visitorId', sql.UniqueIdentifier, req.visitorId)
      .input('itemId', sql.NVarChar(64), req.params.itemId)
      .query('DELETE FROM dbo.WishlistItems WHERE VisitorId = @visitorId AND ItemId = @itemId;');
    res.status(204).end();
  })
);

/* ---------------------------- Trip planner -------------------------- */

router.get(
  '/trip',
  requireVisitor,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('visitorId', sql.UniqueIdentifier, req.visitorId)
      .query(`
        SELECT Id, DestinationId, Days, UpdatedAt FROM dbo.Trips WHERE VisitorId = @visitorId;
        SELECT a.DayNumber, a.ExperienceId
          FROM dbo.TripActivities a
          JOIN dbo.Trips t ON t.Id = a.TripId
         WHERE t.VisitorId = @visitorId
         ORDER BY a.DayNumber, a.Position;
      `);
    const [trips, activities] = result.recordsets;
    res.set('Cache-Control', 'no-store');
    if (trips.length === 0) return res.json({ trip: null });

    const trip = trips[0];
    const itinerary = Array.from({ length: trip.Days }, (_, i) => ({ day: i + 1, activityIds: [] }));
    for (const a of activities) itinerary[a.DayNumber - 1]?.activityIds.push(a.ExperienceId);
    res.json({ trip: { destinationId: trip.DestinationId, days: trip.Days, itinerary, updatedAt: trip.UpdatedAt } });
  })
);

function validateTrip(body) {
  const destinationId = String(body?.destinationId ?? '');
  const days = Number(body?.days);
  if (!ID_RE.test(destinationId)) throw new HttpError(400, 'destinationId is required');
  if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) throw new HttpError(400, `days must be 1–${MAX_DAYS}`);
  if (!Array.isArray(body.itinerary)) throw new HttpError(400, 'itinerary must be an array');

  const activities = [];
  for (const entry of body.itinerary) {
    const day = Number(entry?.day);
    if (!Number.isInteger(day) || day < 1 || day > days) continue; // ignore days beyond the trip length
    const ids = Array.isArray(entry.activityIds) ? entry.activityIds : [];
    if (ids.length > MAX_ACTIVITIES_PER_DAY) throw new HttpError(400, `Max ${MAX_ACTIVITIES_PER_DAY} activities per day`);
    ids.forEach((id, position) => {
      if (typeof id !== 'string' || !ID_RE.test(id)) throw new HttpError(400, 'Invalid activity id');
      activities.push({ day, position, id });
    });
  }
  return { destinationId, days, activities };
}

router.put(
  '/trip',
  requireVisitor,
  asyncHandler(async (req, res) => {
    const { destinationId, days, activities } = validateTrip(req.body);
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      const upsert = await new sql.Request(tx)
        .input('visitorId', sql.UniqueIdentifier, req.visitorId)
        .input('destinationId', sql.NVarChar(64), destinationId)
        .input('days', sql.TinyInt, days)
        .query(`
          DECLARE @out TABLE (Id INT);
          MERGE dbo.Trips WITH (HOLDLOCK) AS t
          USING (SELECT @visitorId AS VisitorId) AS s ON t.VisitorId = s.VisitorId
          WHEN MATCHED THEN UPDATE SET DestinationId = @destinationId, Days = @days, UpdatedAt = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN INSERT (VisitorId, DestinationId, Days) VALUES (@visitorId, @destinationId, @days)
          OUTPUT inserted.Id INTO @out;
          SELECT Id FROM @out;
        `);
      const tripId = upsert.recordset[0].Id;

      await new sql.Request(tx).input('tripId', sql.Int, tripId).query('DELETE FROM dbo.TripActivities WHERE TripId = @tripId;');

      if (activities.length > 0) {
        const r = new sql.Request(tx).input('tripId', sql.Int, tripId);
        const rows = activities.map((a, i) => {
          r.input(`d${i}`, sql.TinyInt, a.day);
          r.input(`p${i}`, sql.SmallInt, a.position);
          r.input(`e${i}`, sql.NVarChar(64), a.id);
          return `(@tripId, @d${i}, @p${i}, @e${i})`;
        });
        await r.query(`INSERT INTO dbo.TripActivities (TripId, DayNumber, Position, ExperienceId) VALUES ${rows.join(', ')};`);
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback().catch(() => {});
      throw e;
    }
    res.json({ ok: true });
  })
);

router.delete(
  '/trip',
  requireVisitor,
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    await pool
      .request()
      .input('visitorId', sql.UniqueIdentifier, req.visitorId)
      .query('DELETE FROM dbo.Trips WHERE VisitorId = @visitorId;');
    res.status(204).end();
  })
);

/* --------------------------- Contact & newsletter ------------------- */

router.post(
  '/contact',
  rateLimit({ max: 5 }),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    const message = String(req.body?.message ?? '').trim();
    const errors = {};
    if (!name) errors.name = 'Enter your name.';
    else if (name.length > 120) errors.name = 'Name is too long.';
    if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'That email doesn’t look right.';
    if (message.length < 10) errors.message = 'A few more details would help (10+ characters).';
    else if (message.length > 4000) errors.message = 'Please keep it under 4000 characters.';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });

    const visitorId = req.get('x-visitor-id');
    const pool = await getPool();
    const { recordset } = await pool
      .request()
      .input('name', sql.NVarChar(120), name)
      .input('email', sql.NVarChar(254), email)
      .input('message', sql.NVarChar(4000), message)
      .input('visitorId', sql.UniqueIdentifier, visitorId && UUID_RE.test(visitorId) ? visitorId : null)
      .query(`INSERT INTO dbo.ContactMessages (Name, Email, Message, VisitorId)
              OUTPUT inserted.Id, inserted.CreatedAt
              VALUES (@name, @email, @message, @visitorId);`);
    res.status(201).json({ id: recordset[0].Id, receivedAt: recordset[0].CreatedAt });
  })
);

router.post(
  '/newsletter',
  rateLimit({ max: 5 }),
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, 'Enter a valid email to subscribe');
    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar(254), email)
      .query(`IF NOT EXISTS (SELECT 1 FROM dbo.NewsletterSubscribers WHERE Email = @email)
                INSERT INTO dbo.NewsletterSubscribers (Email) VALUES (@email);`)
      .catch((e) => {
        if (e.number !== 2627) throw e;
      });
    res.status(201).json({ ok: true });
  })
);

router.use((_req, _res, next) => next(new HttpError(404, 'Not found')));

export default router;
