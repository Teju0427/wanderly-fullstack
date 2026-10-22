import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { RatingStars, WishlistButton } from './ui';
import { useToast } from '../context/ToastContext';

export default function StayCard({ stay, index = 0 }) {
  const { id, name, location, priceLabel, rating, amenities, image } = stay;
  const { showToast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-light/60 bg-paper shadow-sm shadow-ink/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10 dark:border-teal-light/20 dark:bg-ink-soft sm:flex-row"
    >
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:w-2/5">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <WishlistButton id={id} label={name} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl font-medium text-ink dark:text-paper">{name}</h3>
            <RatingStars rating={rating} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink/60 dark:text-paper/60">
            <MapPin className="h-3.5 w-3.5" /> {location}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <li
                key={a}
                className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] text-ink/70 dark:bg-paper/10 dark:text-paper/70"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-sm font-medium text-ink dark:text-paper">{priceLabel}</span>
          <button
            type="button"
            onClick={() => showToast(`Availability request sent for ${name}`)}
            className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-teal hover:bg-teal hover:text-paper dark:border-paper/20 dark:text-paper dark:hover:border-brass dark:hover:bg-brass dark:hover:text-ink"
          >
            Check availability
          </button>
        </div>
      </div>
    </motion.div>
  );
}
