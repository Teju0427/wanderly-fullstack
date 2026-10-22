import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import ExperienceCard from '../components/ExperienceCard';
import StayCard from '../components/StayCard';
import { SectionHeading, Reveal } from '../components/ui';
import { staggerContainer, revealViewport } from '../hooks/useReveal';
import { motion } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import { inspirationArticles, testimonials } from '../data/content';
import { img } from '../data/images';

export default function Home() {
  const { destinations, experiences, stays } = useCatalog();
  return (
    <>
      <Hero />

      {/* Trending Destinations */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Trending now"
            title="Destinations worth the detour"
            description="Six places our travelers keep returning to — chosen for what happens once you arrive, not just how they photograph."
          />
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-teal hover:text-teal-light dark:text-brass dark:hover:text-brass-light"
          >
            View all destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d, i) => (
            <DestinationCard key={d.id} destination={d} index={i} />
          ))}
        </div>
      </section>

      {/* Popular Experiences */}
      <section className="bg-paper-soft py-24 dark:bg-ink-soft">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Beyond sightseeing"
            title="Popular experiences"
            description="Bookable moments, not just itinerary filler — each one led by people who do this daily."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((e, i) => (
              <ExperienceCard key={e.id} experience={e} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow="Where to stay"
          title="Featured stays"
          description="A short list of properties our team has actually slept in — no listing goes up on reputation alone."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {stays.map((s, i) => (
            <StayCard key={s.id} stay={s} index={i} />
          ))}
        </div>
      </section>

      {/* Travel Inspiration — editorial */}
      <section className="bg-ink py-24 text-paper dark:bg-black">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="The Wanderly Journal"
            title="Travel inspiration"
            description="Longer reads for when you're dreaming further ahead than your next booking."
          />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {inspirationArticles.map((article, i) => (
              <Reveal key={article.id} delay={i * 0.1} className="group cursor-pointer">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-5 font-mono text-xs uppercase tracking-widest text-brass-light">
                  {article.readTime}
                </p>
                <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-balance">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{article.excerpt}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading eyebrow="Traveler notes" title="What people say after they're back" align="center" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-2xl border border-stone-light/60 bg-paper-soft p-7 dark:border-teal-light/20 dark:bg-ink-soft"
            >
              <Quote className="h-6 w-6 text-brass" />
              <blockquote className="mt-4 text-[1.05rem] leading-relaxed text-ink/85 dark:text-paper/85">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink dark:text-paper">{t.name}</p>
                  <p className="text-sm text-ink/60 dark:text-paper/60">{t.trip}</p>
                </div>
                <span className="flex items-center gap-1 font-mono text-sm text-ink/70 dark:text-paper/70">
                  {t.rating.toFixed(1)} <Star className="h-3.5 w-3.5 fill-brass text-brass" />
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <img
          src={img('bali', { w: 2000 })}
          alt="Rice terraces at golden hour"
          loading="lazy"
          className="h-[60vh] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-ink/55 text-center">
          <Reveal className="mx-auto max-w-2xl px-6">
            <h2 className="text-balance font-display text-4xl font-medium tracking-tight text-paper sm:text-5xl">
              Your next adventure starts here.
            </h2>
            <Link
              to="/planner"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 font-medium text-ink transition-colors hover:bg-brass-light"
            >
              Start planning <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
