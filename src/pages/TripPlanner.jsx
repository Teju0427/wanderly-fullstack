import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cloud, CloudOff, LoaderCircle, Minus, Plus, Trash2, Wallet } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { api } from '../lib/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SectionHeading } from '../components/ui';
import { useToast } from '../context/ToastContext';

const STAY_COST_PER_NIGHT = 6500;

function buildEmptyItinerary(days) {
  return Array.from({ length: days }, (_, i) => ({ day: i + 1, activityIds: [] }));
}

export default function TripPlanner() {
  const location = useLocation();
  const { showToast } = useToast();
  const { destinations, experiences } = useCatalog();

  const [destinationId, setDestinationId] = useLocalStorage(
    'wanderly:planner:destination',
    location.state?.destinationId ?? destinations[0].id
  );
  const [days, setDays] = useLocalStorage('wanderly:planner:days', 4);
  const [itinerary, setItinerary] = useLocalStorage('wanderly:planner:itinerary', buildEmptyItinerary(4));
  const [activeDay, setActiveDay] = useState(1);
  const [syncState, setSyncState] = useState('loading'); // loading | saving | saved | offline
  const hydrated = useRef(false);

  // Load the saved trip from the server (Azure SQL) once.
  useEffect(() => {
    let cancelled = false;
    const requestedDestination = location.state?.destinationId;
    api('/trip')
      .then(({ trip }) => {
        if (cancelled) return;
        if (trip) {
          setDays(trip.days);
          setItinerary(trip.itinerary);
          setDestinationId(requestedDestination ?? trip.destinationId);
        } else if (requestedDestination) {
          setDestinationId(requestedDestination);
        }
        hydrated.current = true;
        setSyncState('saved');
      })
      .catch(() => {
        if (cancelled) return;
        if (requestedDestination) setDestinationId(requestedDestination);
        setSyncState('offline');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save to the server whenever the plan changes.
  useEffect(() => {
    if (!hydrated.current) return undefined;
    setSyncState('saving');
    const timer = window.setTimeout(() => {
      api('/trip', { method: 'PUT', body: { destinationId, days, itinerary } })
        .then(() => setSyncState('saved'))
        .catch(() => setSyncState('offline'));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [destinationId, days, itinerary]);

  // Keep itinerary length in sync with the days count.
  useEffect(() => {
    setItinerary((prev) => {
      if (prev.length === days) return prev;
      if (prev.length < days) {
        return [...prev, ...buildEmptyItinerary(days - prev.length).map((d, i) => ({ ...d, day: prev.length + i + 1 }))];
      }
      return prev.slice(0, days);
    });
    setActiveDay((d) => Math.min(d, days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const destination = destinations.find((d) => d.id === destinationId) ?? destinations[0];

  const addActivity = (activityId) => {
    setItinerary((prev) =>
      prev.map((d) => (d.day === activeDay ? { ...d, activityIds: [...d.activityIds, activityId] } : d))
    );
  };

  const removeActivity = (day, index) => {
    setItinerary((prev) =>
      prev.map((d) => (d.day === day ? { ...d, activityIds: d.activityIds.filter((_, i) => i !== index) } : d))
    );
  };

  const totalActivityCost = useMemo(
    () =>
      itinerary.reduce(
        (sum, day) =>
          sum + day.activityIds.reduce((s, id) => s + (experiences.find((e) => e.id === id)?.price ?? 0), 0),
        0
      ),
    [itinerary, experiences]
  );

  const stayCost = STAY_COST_PER_NIGHT * Math.max(days - 1, 0);
  const totalBudget = totalActivityCost + stayCost;
  const currentDay = itinerary.find((d) => d.day === activeDay) ?? { activityIds: [] };

  const resetPlan = () => {
    setItinerary(buildEmptyItinerary(days));
    showToast('Itinerary cleared');
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <SectionHeading
        eyebrow="Plan your trip"
        title="Build your itinerary"
        description="Pick a destination, set your trip length, and drop in experiences day by day. Everything here saves automatically."
      />
      <p className="mt-4 flex items-center gap-1.5 font-mono text-xs text-stone dark:text-stone-light" aria-live="polite">
        {syncState === 'loading' && (<><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading your saved trip…</>)}
        {syncState === 'saving' && (<><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Saving…</>)}
        {syncState === 'saved' && (<><Cloud className="h-3.5 w-3.5 text-teal dark:text-brass" /> Saved to the cloud</>)}
        {syncState === 'offline' && (<><CloudOff className="h-3.5 w-3.5" /> Offline — saved on this device only</>)}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft">
            <label htmlFor="destination-select" className="text-sm font-medium text-ink dark:text-paper">
              Destination
            </label>
            <select
              id="destination-select"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-stone-light bg-paper px-3 py-2.5 text-sm text-ink focus:border-teal focus:outline-none dark:border-teal-light/30 dark:bg-ink dark:text-paper"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.region}
                </option>
              ))}
            </select>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-medium text-ink dark:text-paper">Number of days</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDays((d) => Math.max(1, d - 1))}
                  aria-label="Decrease days"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-light text-ink hover:border-teal dark:border-teal-light/30 dark:text-paper dark:hover:border-brass"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center font-mono text-sm text-ink dark:text-paper">{days}</span>
                <button
                  onClick={() => setDays((d) => Math.min(14, d + 1))}
                  aria-label="Increase days"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-light text-ink hover:border-teal dark:border-teal-light/30 dark:text-paper dark:hover:border-brass"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <img
              src={destination.image}
              alt={destination.name}
              className="mt-5 aspect-video w-full rounded-xl object-cover"
            />
          </div>

          <div className="rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              <Wallet className="h-3.5 w-3.5" /> Estimated budget
            </p>
            <p className="mt-3 font-display text-3xl font-medium text-ink dark:text-paper">
              ₹{totalBudget.toLocaleString('en-IN')}
            </p>
            <dl className="mt-4 space-y-2 text-sm text-ink/70 dark:text-paper/70">
              <div className="flex justify-between">
                <dt>Stay ({Math.max(days - 1, 0)} nights)</dt>
                <dd>₹{stayCost.toLocaleString('en-IN')}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Experiences</dt>
                <dd>₹{totalActivityCost.toLocaleString('en-IN')}</dd>
              </div>
            </dl>
            <button
              onClick={resetPlan}
              className="mt-5 flex items-center gap-1.5 text-sm text-stone hover:text-clay dark:hover:text-clay"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear itinerary
            </button>
          </div>

          <div className="rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft">
            <p className="font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              Add an experience
            </p>
            <ul className="mt-4 space-y-2">
              {experiences.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => addActivity(e.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-stone-light/60 px-3 py-2.5 text-left text-sm transition-colors hover:border-teal dark:border-teal-light/20 dark:hover:border-brass"
                  >
                    <span className="text-ink dark:text-paper">{e.name}</span>
                    <span className="flex items-center gap-2 font-mono text-xs text-ink/60 dark:text-paper/60">
                      {e.priceLabel}
                      <Plus className="h-3.5 w-3.5 text-teal dark:text-brass" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Itinerary */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {itinerary.map((d) => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  activeDay === d.day
                    ? 'border-teal bg-teal text-paper dark:border-brass dark:bg-brass dark:text-ink'
                    : 'border-stone-light text-ink/70 hover:border-teal/50 dark:border-teal-light/30 dark:text-paper/70'
                }`}
              >
                Day {d.day}
              </button>
            ))}
          </div>

          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 min-h-[320px] rounded-2xl border border-stone-light/60 bg-paper p-6 dark:border-teal-light/20 dark:bg-ink-soft"
          >
            <h3 className="font-display text-xl font-medium text-ink dark:text-paper">
              Day {activeDay} in {destination.name}
            </h3>
            {currentDay.activityIds.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-stone-light py-10 text-center text-sm text-stone dark:border-teal-light/30 dark:text-stone-light">
                No activities yet — add one from the list on the left.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {currentDay.activityIds.map((id, index) => {
                  const activity = experiences.find((e) => e.id === id);
                  if (!activity) return null;
                  return (
                    <motion.li
                      key={`${id}-${index}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 rounded-xl border border-stone-light/60 p-3 dark:border-teal-light/20"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/10 font-mono text-xs text-teal dark:bg-brass/15 dark:text-brass">
                        {index + 1}
                      </span>
                      <img src={activity.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-ink dark:text-paper">{activity.name}</p>
                        <p className="text-xs text-ink/60 dark:text-paper/60">
                          {activity.duration} · {activity.priceLabel}
                        </p>
                      </div>
                      <button
                        onClick={() => removeActivity(activeDay, index)}
                        aria-label={`Remove ${activity.name} from day ${activeDay}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone hover:bg-clay/10 hover:text-clay"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
