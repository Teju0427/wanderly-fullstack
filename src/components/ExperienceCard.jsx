import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { RatingStars, WishlistButton } from './ui';
import { useToast } from '../context/ToastContext';

export default function ExperienceCard({ experience, index = 0 }) {
  const { id, name, location, priceLabel, duration, rating, image } = experience;
  const { showToast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-stone-light/60 bg-paper shadow-sm shadow-ink/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10 dark:border-teal-light/20 dark:bg-ink-soft"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <WishlistButton id={id} label={name} className="absolute right-3 top-3" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 font-mono text-[11px] text-ink dark:bg-ink/80 dark:text-paper">
          <Clock className="h-3 w-3" /> {duration}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-medium text-ink dark:text-paper">{name}</h3>
          <RatingStars rating={rating} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink/60 dark:text-paper/60">
          <MapPin className="h-3.5 w-3.5" /> {location}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-sm font-medium text-ink dark:text-paper">{priceLabel}</span>
          <button
            type="button"
            onClick={() => showToast(`Request sent for ${name}`)}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition-colors hover:bg-teal dark:bg-brass dark:text-ink dark:hover:bg-brass-light"
          >
            Book experience
          </button>
        </div>
      </div>
    </motion.div>
  );
}
