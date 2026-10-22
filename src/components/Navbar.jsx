import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Moon, Sun, X } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';

const navItems = [
  { to: '/explore', label: 'Explore' },
  { to: '/about', label: 'About' },
  { to: '/planner', label: 'Trip Planner' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { count } = useWishlist();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-stone-light/50 bg-paper/90 backdrop-blur-md dark:border-teal-light/30 dark:bg-ink/90'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Logo />

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `text-[0.95rem] font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-teal dark:text-brass'
                      : 'text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <NavLink
            to="/wishlist"
            aria-label="View wishlist"
            className="relative hidden rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink sm:flex dark:text-paper/70 dark:hover:bg-paper/10 dark:hover:text-paper"
          >
            <Heart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] font-semibold text-paper">
                {count}
              </span>
            )}
          </NavLink>

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink dark:text-paper/70 dark:hover:bg-paper/10 dark:hover:text-paper"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <NavLink
            to="/explore"
            className="hidden rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-teal sm:inline-block dark:bg-brass dark:text-ink dark:hover:bg-brass-light"
          >
            Plan a trip
          </NavLink>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5 md:hidden dark:text-paper/70 dark:hover:bg-paper/10"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-stone-light/50 bg-paper md:hidden dark:border-teal-light/30 dark:bg-ink"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={item.to}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                <NavLink
                  to="/wishlist"
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-paper/10"
                >
                  Wishlist
                  {count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[11px] font-semibold text-paper">
                      {count}
                    </span>
                  )}
                </NavLink>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
