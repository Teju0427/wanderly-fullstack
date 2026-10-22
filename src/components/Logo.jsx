import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Wanderly home">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-brass/70 text-brass transition-transform duration-500 group-hover:rotate-45">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 2 L14.2 9.8 L12 12 L9.8 9.8 Z" />
          <path d="M12 22 L9.8 14.2 L12 12 L14.2 14.2 Z" opacity="0.55" />
        </svg>
      </span>
      <span className="font-display text-xl font-medium tracking-tight text-ink dark:text-paper">
        Wanderly
      </span>
    </Link>
  );
}
