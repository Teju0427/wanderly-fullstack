import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Check, MapPin, Wallet, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import ExperienceCard from '../components/ExperienceCard';
import StayCard from '../components/StayCard';
import { RatingStars, WishlistButton, Reveal } from '../components/ui';
import { useToast } from '../context/ToastContext';

export default function DestinationDetail() {
  const { id } = useParams();
  const { getDestination, experiences, stays } = useCatalog();
  const destination = getDestination(id);
  const [activeImage, setActiveImage] = useState(0);
  const { showToast } = useToast();

  if (!destination) return <Navigate to="/explore" replace />;

  const relatedExperiences = experiences.filter((e) => destination.experienceIds.includes(e.id));
  const relatedStays = stays.filter((s) => destination.stayIds.includes(s.id));

  return (
    <div className="pb-24">
      {/* Gallery */}
      <div className="relative">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
          <motion.img
            key={activeImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            src={destination.gallery[activeImage]}
            alt={destination.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <Link
            to="/explore"
            className="absolute left-5 top-6 inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-4 py-2 text-sm font-medium text-ink backdrop-blur dark:bg-ink/80 dark:text-paper sm:left-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Explore
          </Link>
          <div className="absolute bottom-6 left-5 right-5 flex items-end justify-between sm:left-8 sm:right-8">
            <div className="text-paper">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-brass-light">
                <MapPin className="h-3.5 w-3.5" /> {destination.region}
              </p>
              <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
                {destination.name}
              </h1>
            </div>
            <WishlistButton id={destination.id} label={destination.name} className="!h-11 !w-11" />
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 px-5 py-3 sm:px-8">
          {destination.gallery.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveImage(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                activeImage === i ? 'border-teal dark:border-brass' : 'border-transparent opacity-70'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-8 sm:px-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Reveal className="flex flex-wrap items-center gap-4">
            <RatingStars rating={destination.rating} size="h-4 w-4" />
            <span className="h-1 w-1 rounded-full bg-stone" />
            <span className="text-sm text-ink/70 dark:text-paper/70">{destination.duration} recommended</span>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-6 font-display text-xl italic leading-relaxed text-ink/85 dark:text-paper/85">
              {destination.tagline}
            </p>
            <p className="mt-4 leading-relaxed text-ink/75 dark:text-paper/75">{destination.description}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Things to do</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {destination.thingsToDo.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-stone-light/60 bg-paper-soft p-4 text-sm text-ink/80 dark:border-teal-light/20 dark:bg-ink-soft dark:text-paper/80"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-brass" /> {item}
                </li>
              ))}
            </ul>
          </Reveal>

          {relatedExperiences.length > 0 && (
            <Reveal delay={0.15} className="mt-12">
              <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Popular experiences here</h2>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {relatedExperiences.map((e, i) => (
                  <ExperienceCard key={e.id} experience={e} index={i} />
                ))}
              </div>
            </Reveal>
          )}

          {relatedStays.length > 0 && (
            <Reveal delay={0.2} className="mt-12">
              <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Recommended stays</h2>
              <div className="mt-5 grid grid-cols-1 gap-6">
                {relatedStays.map((s, i) => (
                  <StayCard key={s.id} stay={s} index={i} />
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.25} className="mt-12">
            <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Travel tips</h2>
            <ul className="mt-4 space-y-3">
              {destination.tips.map((tip) => (
                <li key={tip} className="border-l-2 border-brass py-1 pl-4 text-sm leading-relaxed text-ink/75 dark:text-paper/75">
                  {tip}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Sidebar */}
        <Reveal delay={0.1} className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft">
            <p className="font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              At a glance
            </p>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-brass" />
                <div>
                  <dt className="text-ink/60 dark:text-paper/60">Best time to visit</dt>
                  <dd className="font-medium text-ink dark:text-paper">{destination.bestTime}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-brass" />
                <div>
                  <dt className="text-ink/60 dark:text-paper/60">Estimated budget</dt>
                  <dd className="font-medium text-ink dark:text-paper">{destination.budget}</dd>
                </div>
              </div>
            </dl>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => showToast(`${destination.name} added to your plan`)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-teal dark:bg-brass dark:text-ink dark:hover:bg-brass-light"
              >
                Plan this trip <ArrowRight className="h-4 w-4" />
              </button>
              <WishlistButton
                id={destination.id}
                label={destination.name}
                className="!h-auto !w-auto border border-ink/15 px-4 py-3 dark:border-paper/20"
              />
            </div>
            <Link
              to="/planner"
              state={{ destinationId: destination.id }}
              className="mt-3 block text-center text-sm text-teal hover:underline dark:text-brass"
            >
              Or build a full itinerary →
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
