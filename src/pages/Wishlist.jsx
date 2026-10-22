import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCatalog } from '../context/CatalogContext';
import DestinationCard from '../components/DestinationCard';
import ExperienceCard from '../components/ExperienceCard';
import StayCard from '../components/StayCard';
import { SectionHeading } from '../components/ui';

export default function Wishlist() {
  const { ids } = useWishlist();
  const { destinations, experiences, stays } = useCatalog();

  const savedDestinations = destinations.filter((d) => ids.includes(d.id));
  const savedExperiences = experiences.filter((e) => ids.includes(e.id));
  const savedStays = stays.filter((s) => ids.includes(s.id));
  const isEmpty = savedDestinations.length + savedExperiences.length + savedStays.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <SectionHeading eyebrow="Saved" title="Your wishlist" description="Everything you've bookmarked, synced to the cloud for this browser." />

      {isEmpty ? (
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-stone-light py-24 text-center dark:border-teal-light/30">
          <Heart className="h-10 w-10 text-stone dark:text-stone-light" />
          <p className="mt-4 font-display text-2xl text-ink dark:text-paper">Nothing saved yet</p>
          <p className="mt-2 max-w-sm text-sm text-ink/60 dark:text-paper/60">
            Tap the heart on any destination, experience, or stay to save it here for later.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper dark:bg-brass dark:text-ink"
          >
            Start exploring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-16">
          {savedDestinations.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Destinations</h2>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedDestinations.map((d, i) => (
                  <DestinationCard key={d.id} destination={d} index={i} />
                ))}
              </div>
            </div>
          )}
          {savedExperiences.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Experiences</h2>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedExperiences.map((e, i) => (
                  <ExperienceCard key={e.id} experience={e} index={i} />
                ))}
              </div>
            </div>
          )}
          {savedStays.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Stays</h2>
              <div className="mt-5 grid grid-cols-1 gap-6">
                {savedStays.map((s, i) => (
                  <StayCard key={s.id} stay={s} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
