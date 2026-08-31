import { useState } from 'react';

export default function GenreView({ genre, movies, onSelect, onBack, watchlist, onToggleWatchlist }) {
  const [decadeFilter, setDecadeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});

  const filtered = movies.filter((m) => {
    // Genre match
    const matchesGenre =
      genre.toLowerCase() === 'watchlist'
        ? watchlist.includes(m.id)
        : !m.genre
        ? genre.toLowerCase() === 'trending'
        : m.genre.toLowerCase().includes(genre.toLowerCase());

    if (!matchesGenre) return false;

    // Decade filter
    if (decadeFilter === '2020s' && (m.year < 2020 || !m.year)) return false;
    if (decadeFilter === '2010s' && (m.year < 2010 || m.year > 2019)) return false;
    if (decadeFilter === 'classics' && m.year >= 2010) return false;

    // Rating filter
    const ratingNum = parseFloat(m.rating || 8.5);
    if (ratingFilter > 0 && ratingNum < ratingFilter) return false;

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-20 animate-in fade-in duration-300">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-6">
        <button onClick={onBack} className="hover:text-white transition">Home</button>
        <span>&rsaquo;</span>
        <span className="text-red-500 capitalize">{genre === 'watchlist' ? 'My Watchlist' : genre}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold capitalize text-white sm:text-3xl">
            {genre === 'watchlist' ? 'My Watchlist' : `${genre} Movies`}
          </h2>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', '2020s', '2010s', 'classics'].map((dec) => (
            <button
              key={dec}
              onClick={() => setDecadeFilter(dec)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                decadeFilter === dec
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {dec}
            </button>
          ))}
          <button
            onClick={() => setRatingFilter(ratingFilter === 8 ? 0 : 8)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
              ratingFilter === 8
                ? 'bg-yellow-500 text-black font-bold'
                : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            ★ 8.0+
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 text-sm">
          No titles found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
          {filtered.map((movie) => {
            const isSaved = watchlist.includes(movie.id);
            const isLoaded = loadedImages[movie.id];

            return (
              <div
                key={movie.id}
                onClick={() => onSelect(movie)}
                className="group relative cursor-pointer transition-transform duration-200 active:scale-95"
              >
                <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 relative">
                  
                  {/* Shimmer Skeleton Placeholder */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
                  )}

                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoadedImages((prev) => ({ ...prev, [movie.id]: true }))}
                    className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-105 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(movie.id);
                    }}
                    className={`absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition ${
                      isSaved ? 'bg-red-600 text-white' : 'bg-black/60 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>

                  {/* Rating */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-yellow-500 backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{movie.rating || '8.5'}</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10">
                    <h4 className="text-xs font-semibold leading-snug text-white line-clamp-1">
                      {movie.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{movie.year}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
