import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SearchBar from './SearchBar';
import { img } from '../data/images';

export default function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : '/explore');
  };

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={img('goa', { w: 2400 })}
          alt="Aerial view of a palm-lined coastline"
          className="h-full w-full object-cover"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <div className="absolute inset-0 bg-ink/10" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-28 text-paper sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-brass-light"
        >
          Wanderly · Travel Discovery
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Discover places worth remembering.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85"
        >
          Curated destinations, considered stays, and experiences worth building a trip around —
          all in one unhurried place to plan from.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <SearchBar value={query} onChange={setQuery} className="flex-1 !bg-paper/95" />
          <button
            type="submit"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-brass px-6 py-3.5 font-medium text-ink transition-colors hover:bg-brass-light"
          >
            Search <ArrowRight className="h-4 w-4" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-paper/20 pt-8 font-mono text-sm text-paper/80"
        >
          <span><strong className="text-paper">120+</strong> destinations</span>
          <span><strong className="text-paper">24</strong> countries</span>
          <span><strong className="text-paper">38,000+</strong> trips planned</span>
        </motion.div>
      </div>
    </section>
  );
}
