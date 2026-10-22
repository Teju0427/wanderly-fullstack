import { getPool } from '../db/pool.js';

const CACHE_MS = Number(process.env.CATALOG_CACHE_SECONDS ?? 300) * 1000;
let cache = null; // { at, data }

function groupBy(rows, key) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return map;
}

/** Loads the full catalog from Azure SQL and shapes it exactly like src/data/*. */
async function loadFromDb() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT Id, Name, Region, Code, Coords, Tagline, Metadata, Category, Rating, Price, PriceLabel,
           Duration, ImageUrl, Description, BestTime, Budget
      FROM dbo.Destinations ORDER BY SortOrder, Name;
    SELECT DestinationId, ImageUrl FROM dbo.DestinationGallery ORDER BY DestinationId, Position;
    SELECT DestinationId, Activity FROM dbo.DestinationThingsToDo ORDER BY DestinationId, Position;
    SELECT DestinationId, Tip FROM dbo.DestinationTips ORDER BY DestinationId, Position;
    SELECT DestinationId, ExperienceId FROM dbo.DestinationExperiences ORDER BY DestinationId, Position;
    SELECT DestinationId, StayId FROM dbo.DestinationStays ORDER BY DestinationId, Position;
    SELECT Id, Name, Location, Category, Rating, Price, PriceLabel, Duration, ImageUrl, Description
      FROM dbo.Experiences ORDER BY SortOrder, Name;
    SELECT Id, Name, Location, Category, Rating, Price, PriceLabel, ImageUrl
      FROM dbo.Stays ORDER BY SortOrder, Name;
    SELECT StayId, Amenity FROM dbo.StayAmenities ORDER BY StayId, Position;
  `);

  const [dest, gallery, todo, tips, destExp, destStay, exp, stay, amen] = result.recordsets;
  const g = groupBy(gallery, 'DestinationId');
  const t = groupBy(todo, 'DestinationId');
  const tp = groupBy(tips, 'DestinationId');
  const de = groupBy(destExp, 'DestinationId');
  const ds = groupBy(destStay, 'DestinationId');
  const am = groupBy(amen, 'StayId');

  const destinations = dest.map((d) => ({
    id: d.Id,
    name: d.Name,
    region: d.Region,
    code: d.Code,
    coords: d.Coords,
    tagline: d.Tagline,
    metadata: d.Metadata,
    category: d.Category,
    rating: Number(d.Rating),
    price: d.Price,
    priceLabel: d.PriceLabel,
    duration: d.Duration,
    image: d.ImageUrl,
    gallery: (g.get(d.Id) ?? []).map((r) => r.ImageUrl),
    description: d.Description,
    bestTime: d.BestTime,
    budget: d.Budget,
    thingsToDo: (t.get(d.Id) ?? []).map((r) => r.Activity),
    experienceIds: (de.get(d.Id) ?? []).map((r) => r.ExperienceId),
    stayIds: (ds.get(d.Id) ?? []).map((r) => r.StayId),
    tips: (tp.get(d.Id) ?? []).map((r) => r.Tip),
  }));

  const experiences = exp.map((e) => ({
    id: e.Id,
    name: e.Name,
    location: e.Location,
    category: e.Category,
    rating: Number(e.Rating),
    price: e.Price,
    priceLabel: e.PriceLabel,
    duration: e.Duration,
    image: e.ImageUrl,
    description: e.Description,
  }));

  const stays = stay.map((s) => ({
    id: s.Id,
    name: s.Name,
    location: s.Location,
    category: s.Category,
    rating: Number(s.Rating),
    price: s.Price,
    priceLabel: s.PriceLabel,
    amenities: (am.get(s.Id) ?? []).map((r) => r.Amenity),
    image: s.ImageUrl,
  }));

  return { destinations, experiences, stays };
}

export async function getCatalog() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  const data = await loadFromDb();
  cache = { at: Date.now(), data };
  return data;
}

export function clearCatalogCache() {
  cache = null;
}

/** Returns 'destination' | 'experience' | 'stay' | null for a catalog id. */
export async function getItemType(itemId) {
  const { destinations, experiences, stays } = await getCatalog();
  if (destinations.some((d) => d.id === itemId)) return 'destination';
  if (experiences.some((e) => e.id === itemId)) return 'experience';
  if (stays.some((s) => s.id === itemId)) return 'stay';
  return null;
}
