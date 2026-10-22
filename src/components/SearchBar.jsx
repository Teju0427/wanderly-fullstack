import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search destinations or experiences…', className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-full border border-stone-light/70 bg-paper px-5 py-3.5 shadow-lg shadow-ink/5 transition-colors focus-within:border-teal dark:border-teal-light/30 dark:bg-ink-soft dark:shadow-black/20 dark:focus-within:border-brass ${className}`}
    >
      <Search className="h-5 w-5 shrink-0 text-stone dark:text-stone-light" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search destinations or experiences"
        className="w-full bg-transparent text-[0.95rem] text-ink placeholder:text-stone focus:outline-none dark:text-paper dark:placeholder:text-stone-light"
      />
    </div>
  );
}
