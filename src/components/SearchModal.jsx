import { useState, useEffect, useRef } from 'react';

export default function SearchModal({ movies, isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim() === '' 
    ? [] 
    : movies.filter((m) => 
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        (m.genre && m.genre.toLowerCase().includes(query.toLowerCase())) ||
        (m.cast && m.cast.some((c) => c.toLowerCase().includes(query.toLowerCase())))
      ).slice(0, 8);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-zinc-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, genres, or cast..."
            className="w-full bg-transparent text-base font-medium text-white placeholder-zinc-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-zinc-500 hover:text-zinc-300">
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Live Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              Type the title of a movie or a genre to search.
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              No movies found matching &ldquo;<span className="text-zinc-300">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    onSelect(movie);
                    onClose();
                  }}
                  className="flex items-center gap-4 rounded-xl p-2.5 transition-colors duration-150 hover:bg-white/5 cursor-pointer"
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-16 w-11 shrink-0 rounded-lg object-cover bg-zinc-800 ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-white">{movie.title}</h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                      <span>{movie.year}</span>
                      <span>&bull;</span>
                      <span className="truncate">{movie.genre}</span>
                      {movie.runtime && (
                        <>
                          <span>&bull;</span>
                          <span>{movie.runtime}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs font-bold text-yellow-500 ring-1 ring-white/10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{movie.rating || '8.5'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
