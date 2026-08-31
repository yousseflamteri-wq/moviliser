import { useState } from 'react';

export default function GenreView({ genre, movies, onSelect, onBack, watchlist, onToggleWatchlist }) {
  const [selectedDecade, setSelectedDecade] = useState('ALL');
  const [minRating, setMinRating] = useState('ALL');
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filtered = movies.filter((m) => {
    const matchesGenre = genre.toLowerCase() === 'all' || 
      (m.genre && m.genre.toLowerCase().includes(genre.toLowerCase()));
    if (!matchesGenre) return false;

    // Decade filter
    if (selectedDecade !== 'ALL') {
      const year = Number(m.year);
      if (selectedDecade === '2020s' && (year < 2020 || year > 2029)) return false;
      if (selectedDecade === '2010s' && (year < 2010 || year > 2019)) return false;
      if (selectedDecade === '2000s' && (year < 2000 || year > 2009)) return false;
      if (selectedDecade === 'Classics' && year >= 2000) return false;
    }

    // Rating filter
    if (minRating !== 'ALL') {
      const rating = Number(m.rating || 8.5);
      if (rating < Number(minRating)) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-24 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-6">
        <button onClick={onBack} className="hover:text-white transition flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Home
        </button>
        <span>/</span>
        <span className="text-white capitalize">{genre === 'watchlist' ? 'My Watchlist' : genre}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold capitalize text-white sm:text-3xl">
          {genre === 'watchlist' ? 'My Saved Watchlist' : `${genre} Movies`}
        </h2>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', '2020s', '2010s', 'Classics'].map((dec) => (
            <button
              key={dec}
              onClick={() => setSelectedDecade(dec)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedDecade === dec 
                  ? 'bg-red-600 text-white' 
                  : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:text-white'
              }`}
            >
              {dec}
            </button>
          ))}
          
          <button
            onClick={() => setMinRating(minRating === '8.0' ? 'ALL' : '8.0')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              minRating === '8.0'
                ? 'bg-yellow-500 text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:text-white'
            }`}
          >
            ★ 8.0+
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-zinc-500">
          No titles found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-5">
          {filtered.map((movie) => {
            const isSaved = watchlist?.includes(movie.id);
            return (
              <div
                key={movie.id}
                onClick={() => onSelect(movie)}
                className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95"
              >
                <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/10 shadow-lg relative">
                  {!loadedImages[movie.id] && (
                    <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                  )}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => handleImageLoad(movie.id)}
                    className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
                      loadedImages[movie.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Watchlist Toggle Bookmark */}
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
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-md border border-white/10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{movie.rating || '8.5'}</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2.5 pt-8">
                    <h4 className="text-xs font-semibold leading-snug text-zinc-100 line-clamp-1">{movie.title}</h4>
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
