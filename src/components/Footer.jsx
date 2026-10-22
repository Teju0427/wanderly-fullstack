import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Camera, PlayCircle } from 'lucide-react';
import Logo from './Logo';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      showToast('Enter a valid email to subscribe');
      return;
    }
    setSending(true);
    try {
      await api('/newsletter', { method: 'POST', body: { email } });
      setSubmitted(true);
      showToast('You\'re on the list');
      setEmail('');
    } catch (err) {
      showToast(err.status === 400 ? err.message : 'Couldn\u2019t subscribe right now — please try again');
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="border-t border-stone-light/50 bg-paper-soft dark:border-teal-light/20 dark:bg-ink-soft">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs font-display text-lg italic text-ink/70 dark:text-paper/70">
              Discover places worth remembering.
            </p>
            <div className="mt-6 flex gap-3">
              {[Camera, AtSign, PlayCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Wanderly on social media"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-light text-ink/60 transition-colors hover:border-teal hover:text-teal dark:border-teal-light/40 dark:text-paper/60 dark:hover:border-brass dark:hover:text-brass"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              Navigate
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/" className="text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper">Home</Link></li>
              <li><Link to="/explore" className="text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper">Explore</Link></li>
              <li><Link to="/planner" className="text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper">Trip Planner</Link></li>
              <li><Link to="/about" className="text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper">About</Link></li>
              <li><Link to="/contact" className="text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              Destinations
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {['Goa', 'Kerala', 'Manali', 'Jaipur', 'Bali', 'Dubai'].map((d) => (
                <li key={d}>
                  <Link
                    to={`/destination/${d.toLowerCase()}`}
                    className="text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper"
                  >
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <h4 className="font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-ink/70 dark:text-paper/70">
              One dispatch a month. New destinations, no noise.
            </p>
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full min-w-0 rounded-full border border-stone-light bg-paper px-4 py-2 text-sm text-ink placeholder:text-stone focus:border-teal focus:outline-none dark:border-teal-light/40 dark:bg-ink dark:text-paper"
              />
              <button
                type="submit"
                disabled={sending}
                className="shrink-0 disabled:opacity-60 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-teal dark:bg-brass dark:text-ink dark:hover:bg-brass-light"
              >
                Join
              </button>
            </form>
            {submitted && <p className="mt-2 text-xs text-teal dark:text-brass">Thanks — check your inbox soon.</p>}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone-light/50 pt-6 text-xs text-stone dark:border-teal-light/20 sm:flex-row">
          <p>© {new Date().getFullYear()} Wanderly. All rights reserved.</p>
          <p>Photography via Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}
