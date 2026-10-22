import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 sm:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center gap-2.5 rounded-full border border-stone-light/60 bg-paper px-4 py-2.5 text-sm font-medium text-ink shadow-lg shadow-ink/10 dark:border-teal-light/40 dark:bg-ink-soft dark:text-paper"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal dark:text-brass" />
              <span>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-1 rounded-full p-0.5 text-stone hover:text-ink dark:hover:text-paper"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
