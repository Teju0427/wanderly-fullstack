import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Heart, MapPinned } from 'lucide-react';
import { SectionHeading, Reveal } from '../components/ui';
import { stats, team } from '../data/content';
import { img } from '../data/images';

const values = [
  {
    icon: Compass,
    title: 'Curated, not crowdsourced',
    text: 'Every destination, stay, and experience on Wanderly passes through a human reviewer before it\'s published.',
  },
  {
    icon: MapPinned,
    title: 'Built from real trips',
    text: 'Our team travels the routes we list. If we wouldn\'t book it again ourselves, it doesn\'t stay on the site.',
  },
  {
    icon: Heart,
    title: 'Designed for the return trip',
    text: 'We optimize for the version of your trip you\'ll actually remember fondly — not just the one that\'s easiest to book.',
  },
];

export default function About() {
  return (
    <div className="pb-24">
      {/* Story hero */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        <img
          src={img('clouds', { w: 2200 })}
          alt="View of clouds from an airplane window at sunrise"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 pb-20 pt-32 text-paper sm:px-8">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass-light">Our story</span>
          <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight sm:text-5xl">
            We started Wanderly because most trips are planned in twelve open browser tabs.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="font-display text-xl italic leading-relaxed text-ink/85 dark:text-paper/85">
            Wanderly began as a shared spreadsheet between three friends who kept trip-planning for each other.
          </p>
          <p className="mt-6 leading-relaxed text-ink/75 dark:text-paper/75">
            What started as recommendations passed between friends turned into a small, opinionated catalogue of
            places worth the trip — and eventually, into Wanderly. We're not trying to list every destination on
            Earth. We're trying to make sure that every one we do list has actually earned its place.
          </p>
          <p className="mt-4 leading-relaxed text-ink/75 dark:text-paper/75">
            That means fewer listings than a typical travel site, and more confidence in each one. If it's on
            Wanderly, someone on our team has been there, stayed there, or done it — recently.
          </p>
        </Reveal>
      </section>

      {/* Mission / values */}
      <section className="bg-paper-soft py-20 dark:bg-ink-soft">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="Why we exist" title="What we believe about travel" align="center" />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal
                key={v.title}
                delay={i * 0.08}
                className="rounded-2xl border border-stone-light/60 bg-paper p-7 dark:border-teal-light/20 dark:bg-ink"
              >
                <v.icon className="h-6 w-6 text-teal dark:text-brass" />
                <h3 className="mt-4 font-display text-lg font-medium text-ink dark:text-paper">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-paper/70">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <p className="font-display text-4xl font-medium text-teal dark:text-brass">{s.value}</p>
              <p className="mt-2 text-sm text-ink/60 dark:text-paper/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-paper-soft py-20 dark:bg-ink-soft">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="The team" title="Who's behind Wanderly" />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {team.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} className="text-center sm:text-left">
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal/10 font-display text-2xl text-teal dark:bg-brass/15 dark:text-brass sm:mx-0"
                  aria-hidden="true"
                >
                  {p.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <h3 className="mt-4 font-display text-lg font-medium text-ink dark:text-paper">{p.name}</h3>
                <p className="text-sm text-brass">{p.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-paper/70">{p.bio}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <Reveal>
          <h2 className="text-balance font-display text-3xl font-medium tracking-tight text-ink dark:text-paper sm:text-4xl">
            Ready to see where Wanderly would take you?
          </h2>
          <Link
            to="/explore"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-paper transition-colors hover:bg-teal dark:bg-brass dark:text-ink dark:hover:bg-brass-light"
          >
            Explore destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
