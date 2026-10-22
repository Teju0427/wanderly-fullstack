// Builds an idempotent T-SQL seed script from the same data files the
// frontend ships with (src/data/*), so the catalog has one source of truth.
import destinations from '../../src/data/destinations.js';
import experiences from '../../src/data/experiences.js';
import stays from '../../src/data/stays.js';

const str = (v) => (v === undefined || v === null ? 'NULL' : `N'${String(v).replace(/'/g, "''")}'`);
const num = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid number in seed data: ${v}`);
  return String(n);
};

function mergeBlock(table, columns, rows) {
  if (rows.length === 0) return '';
  const values = rows.map((r) => `  (${r.join(', ')})`).join(',\n');
  const [key, ...rest] = columns;
  return `MERGE dbo.${table} AS target
USING (VALUES
${values}
) AS source (${columns.join(', ')})
ON target.${key} = source.${key}
WHEN MATCHED THEN UPDATE SET
  ${rest.map((c) => `${c} = source.${c}`).join(',\n  ')},
  UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN
  INSERT (${columns.join(', ')}) VALUES (${columns.map((c) => `source.${c}`).join(', ')});
`;
}

function insertBlock(table, columns, rows) {
  if (rows.length === 0) return '';
  const values = rows.map((r) => `  (${r.join(', ')})`).join(',\n');
  return `INSERT INTO dbo.${table} (${columns.join(', ')}) VALUES\n${values};\n`;
}

export function buildSeedSql() {
  const parts = [];
  parts.push('SET XACT_ABORT ON;', 'SET NOCOUNT ON;', 'BEGIN TRANSACTION;', '');

  parts.push(
    mergeBlock(
      'Experiences',
      ['Id', 'Name', 'Location', 'Category', 'Rating', 'Price', 'PriceLabel', 'Duration', 'ImageUrl', 'Description', 'SortOrder'],
      experiences.map((e, i) => [
        str(e.id), str(e.name), str(e.location), str(e.category), num(e.rating), num(e.price),
        str(e.priceLabel), str(e.duration), str(e.image), str(e.description), num(i),
      ])
    )
  );

  parts.push(
    mergeBlock(
      'Stays',
      ['Id', 'Name', 'Location', 'Category', 'Rating', 'Price', 'PriceLabel', 'ImageUrl', 'SortOrder'],
      stays.map((s, i) => [
        str(s.id), str(s.name), str(s.location), str(s.category), num(s.rating), num(s.price),
        str(s.priceLabel), str(s.image), num(i),
      ])
    )
  );

  parts.push(
    mergeBlock(
      'Destinations',
      ['Id', 'Name', 'Region', 'Code', 'Coords', 'Tagline', 'Metadata', 'Category', 'Rating', 'Price',
        'PriceLabel', 'Duration', 'ImageUrl', 'Description', 'BestTime', 'Budget', 'SortOrder'],
      destinations.map((d, i) => [
        str(d.id), str(d.name), str(d.region), str(d.code), str(d.coords), str(d.tagline), str(d.metadata),
        str(d.category), num(d.rating), num(d.price), str(d.priceLabel), str(d.duration), str(d.image),
        str(d.description), str(d.bestTime), str(d.budget), num(i),
      ])
    )
  );

  // Child tables: replace the rows belonging to seeded parents.
  const destIds = destinations.map((d) => str(d.id)).join(', ');
  const stayIds = stays.map((s) => str(s.id)).join(', ');
  parts.push(`DELETE FROM dbo.StayAmenities WHERE StayId IN (${stayIds});`);
  for (const t of ['DestinationGallery', 'DestinationThingsToDo', 'DestinationTips', 'DestinationExperiences', 'DestinationStays']) {
    parts.push(`DELETE FROM dbo.${t} WHERE DestinationId IN (${destIds});`);
  }
  parts.push('');

  parts.push(
    insertBlock('StayAmenities', ['StayId', 'Position', 'Amenity'],
      stays.flatMap((s) => (s.amenities ?? []).map((a, i) => [str(s.id), num(i), str(a)])))
  );
  parts.push(
    insertBlock('DestinationGallery', ['DestinationId', 'Position', 'ImageUrl'],
      destinations.flatMap((d) => (d.gallery ?? []).map((u, i) => [str(d.id), num(i), str(u)])))
  );
  parts.push(
    insertBlock('DestinationThingsToDo', ['DestinationId', 'Position', 'Activity'],
      destinations.flatMap((d) => (d.thingsToDo ?? []).map((t, i) => [str(d.id), num(i), str(t)])))
  );
  parts.push(
    insertBlock('DestinationTips', ['DestinationId', 'Position', 'Tip'],
      destinations.flatMap((d) => (d.tips ?? []).map((t, i) => [str(d.id), num(i), str(t)])))
  );
  parts.push(
    insertBlock('DestinationExperiences', ['DestinationId', 'ExperienceId', 'Position'],
      destinations.flatMap((d) => (d.experienceIds ?? []).map((id, i) => [str(d.id), str(id), num(i)])))
  );
  parts.push(
    insertBlock('DestinationStays', ['DestinationId', 'StayId', 'Position'],
      destinations.flatMap((d) => (d.stayIds ?? []).map((id, i) => [str(d.id), str(id), num(i)])))
  );

  parts.push('COMMIT TRANSACTION;');
  return parts.filter(Boolean).join('\n');
}
