import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { revealVariants, revealViewport } from '../hooks/useReveal';

export function RatingStars({ rating, size = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-ink/70 dark:text-paper/70">
      <Star className={`${size} fill-brass text-brass`} />
      {rating.toFixed(1)}
    </span>
  );
}

export function WishlistButton({ id, label, className = '' }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id, label);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from wishlist` : `Save ${label} to wishlist`}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur transition-transform hover:scale-110 dark:bg-ink/80 dark:text-paper ${className}`}
    >
      <motion.span whileTap={{ scale: 0.8 }} className="flex">
        <Heart className={`h-4 w-4 transition-colors ${active ? 'fill-clay text-clay' : 'text-ink dark:text-paper'}`} />
      </motion.span>
    </button>
  );
}

export function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass">{eyebrow}</span>
      )}
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink text-balance dark:text-paper sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink/70 dark:text-paper/70">{description}</p>
      )}
    </Reveal>
  );
}

export function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={revealVariants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-ink/5 text-ink dark:bg-paper/10 dark:text-paper',
    brass: 'bg-brass/15 text-clay dark:bg-brass/20 dark:text-brass-light',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
