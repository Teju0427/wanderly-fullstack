import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import DestinationCard from '../components/DestinationCard';
import { useCatalog } from '../context/CatalogContext';

const sortOptions = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
];

export default function Explore() {
  const { destinations, categories } = useCatalog();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(70000);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = destinations.filter((d) => {
      const matchesQuery =
        query.trim() === '' ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.region.toLowerCase().includes(query.toLowerCase()) ||
        d.tagline.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || d.category === category;
      const matchesPrice = d.price <= maxPrice;
      const matchesRating = d.rating >= minRating;
      return matchesQuery && matchesCategory && matchesPrice && matchesRating;
    });

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [destinations, query, category, sort, maxPrice, minRating]);

  const resetFilters = () => {
    setCategory('All');
    setMaxPrice(70000);
    setMinRating(0);
    setSort('popular');
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <div className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass">Explore</span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink dark:text-paper sm:text-5xl">
          Find your next trip
        </h1>
        <p className="mt-4 text-ink/70 dark:text-paper/70">
          Filter by mood, budget, or rating — every result here is a place someone on our team has actually vetted.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar value={query} onChange={setQuery} className="flex-1" />
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-full border border-stone-light px-5 py-3.5 text-sm font-medium text-ink transition-colors hover:border-teal dark:border-teal-light/40 dark:text-paper dark:hover:border-brass sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      {/* Category nav */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              category === c
                ? 'border-teal bg-teal text-paper dark:border-brass dark:bg-brass dark:text-ink'
                : 'border-stone-light text-ink/70 hover:border-teal/50 dark:border-teal-light/30 dark:text-paper/70'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft sm:grid-cols-3"
        >
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="price" className="text-sm font-medium text-ink dark:text-paper">
                Max price
              </label>
              <span className="font-mono text-sm text-ink/70 dark:text-paper/70">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              id="price"
              type="range"
              min={10000}
              max={70000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-teal dark:accent-brass"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="rating" className="text-sm font-medium text-ink dark:text-paper">
                Minimum rating
              </label>
              <span className="font-mono text-sm text-ink/70 dark:text-paper/70">{minRating.toFixed(1)}+</span>
            </div>
            <input
              id="rating"
              type="range"
              min={0}
              max={4.9}
              step={0.1}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="mt-3 w-full accent-teal dark:accent-brass"
            />
          </div>

          <div>
            <label htmlFor="sort" className="text-sm font-medium text-ink dark:text-paper">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-3 w-full rounded-lg border border-stone-light bg-paper px-3 py-2.5 text-sm text-ink focus:border-teal focus:outline-none dark:border-teal-light/30 dark:bg-ink dark:text-paper"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="inline-flex w-fit items-center gap-1 text-sm text-stone hover:text-ink dark:hover:text-paper sm:col-span-3"
          >
            <X className="h-3.5 w-3.5" /> Reset filters
          </button>
        </motion.div>
      )}

      <p className="mt-8 text-sm text-stone dark:text-stone-light">
        {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'} found
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d, i) => (
            <DestinationCard key={d.id} destination={d} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-stone-light py-20 text-center dark:border-teal-light/30">
          <p className="font-display text-2xl text-ink dark:text-paper">Nothing matches yet</p>
          <p className="mt-2 text-ink/60 dark:text-paper/60">Try widening your price range or clearing a filter.</p>
          <button
            onClick={resetFilters}
            className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper dark:bg-brass dark:text-ink"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
