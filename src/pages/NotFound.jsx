import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <Compass className="h-12 w-12 text-brass" />
      <p className="mt-6 font-mono text-sm uppercase tracking-widest text-stone dark:text-stone-light">
        Error 404
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium text-ink dark:text-paper sm:text-4xl">
        This route isn't on the map.
      </h1>
      <p className="mt-3 max-w-sm text-ink/60 dark:text-paper/60">
        The page you're looking for may have moved. Let's get you back to solid ground.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-teal dark:bg-brass dark:text-ink dark:hover:bg-brass-light"
      >
        Back home <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
