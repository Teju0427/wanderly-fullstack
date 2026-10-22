import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import staticDestinations, { categories } from '../data/destinations';
import staticExperiences from '../data/experiences';
import staticStays from '../data/stays';
import { api } from '../lib/api';

const CatalogContext = createContext(null);

/**
 * Serves destinations / experiences / stays from the API (Azure SQL).
 * The bundled data is used as the initial state so the first paint is
 * instant, and as a fallback if the API is unreachable.
 */
export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState({
    destinations: staticDestinations,
    experiences: staticExperiences,
    stays: staticStays,
    source: 'bundled',
  });

  useEffect(() => {
    let cancelled = false;
    api('/catalog')
      .then((data) => {
        if (cancelled || !Array.isArray(data?.destinations) || data.destinations.length === 0) return;
        setCatalog({ ...data, source: 'api' });
      })
      .catch(() => {
        // API unavailable — keep the bundled catalog.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...catalog,
      categories,
      getDestination: (id) => catalog.destinations.find((d) => d.id === id),
    }),
    [catalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
