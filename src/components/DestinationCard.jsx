import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { RatingStars, WishlistButton } from './ui';

export default function DestinationCard({ destination, index = 0 }) {
  const { id, name, region, code, coords, tagline, metadata, rating, priceLabel, image } = destination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-light/60 bg-paper shadow-sm shadow-ink/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10 dark:border-teal-light/20 dark:bg-ink-soft"
    >
      <Link to={`/destination/${id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${name}, ${region}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0" />
        <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-ink dark:bg-ink/80 dark:text-paper">
          {coords}
        </span>
        <WishlistButton id={id} label={name} className="absolute right-4 top-4" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-paper">
          <div>
            <p className="font-display text-2xl font-medium leading-tight">{name}</p>
            <p className="flex items-center gap-1 text-xs text-paper/80">
              <MapPin className="h-3 w-3" /> {region}
            </p>
          </div>
          <RatingStars rating={rating} />
        </div>
      </Link>

      {/* Boarding-pass stub */}
      <div className="relative px-5 pb-5 pt-4">
        <div className="ticket-notch relative flex items-center justify-between pb-4 ticket-divider">
          <span className="font-mono text-[11px] uppercase tracking-widest text-stone dark:text-stone-light">
            {tagline}
          </span>
          <span className="font-mono text-lg font-semibold tracking-wider text-teal dark:text-brass">
            {code}
          </span>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-xs text-stone dark:text-stone-light">{metadata}</p>
            <p className="font-mono text-sm font-medium text-ink dark:text-paper">from {priceLabel}</p>
          </div>
          <Link
            to={`/destination/${id}`}
            className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-teal hover:bg-teal hover:text-paper dark:border-paper/20 dark:text-paper dark:hover:border-brass dark:hover:bg-brass dark:hover:text-ink"
          >
            Explore <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
