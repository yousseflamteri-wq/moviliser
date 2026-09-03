import { useState, useEffect, useRef } from 'react';

export default function MovieGrid({ movies = [], onSelect, onSeeAll, watchlist = [], onToggleWatchlist }) {
  const heroMovies = movies.slice(0, 5);
  const [heroIdx, setHeroIdx] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const carouselRef = useRef(null);
  const rowRefs = useRef({});

  // Sync scroll position with dots
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    const scrollLeft = carouselRef.current.scrollLeft;
    const newIdx = Math.round(scrollLeft / width);
    if (newIdx !== heroIdx && newIdx >= 0 && newIdx < heroMovies.length) {
      setHeroIdx(newIdx);
    }
  };

  // Click dot to jump smoothly to that movie
  const scrollToIndex = (index) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({
      left: index * carouselRef.current.offsetWidth,
      behavior: 'smooth',
    });
    setHeroIdx(index);
  };

  // Optional: Auto slide every 6 seconds
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(() => {
      const nextIdx = (heroIdx + 1) % heroMovies.length;
      scrollToIndex(nextIdx);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroIdx, heroMovies.length]);

  const scrollRow = (genre, direction) => {
    const el = rowRefs.current[genre];
    if (el) {
      const offset = direction === 'left' ? -420 : 420;
      el.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const categorized = movies.reduce((acc, movie) => {
    const genre = movie.genre ? movie.genre.split(',')[0].trim() : 'Trending';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  const genresList = Object.keys(categorized);

  if (!movies.length) return null;

  return (
    <div className="flex flex-col gap-8 pb-16 overflow-x-hidden pt-14 bg-[#09090b]">

      {/* Modern Cineby Snap Hero */}
      {heroMovies.length > 0 && (
        <div className="relative w-full overflow-hidden">
          {/* Scroll Snap Carousel Track */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex w-full h-[520px] sm:h-[600px] overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {heroMovies.map((movie) => (
              <div
                key={movie.id}
                className="relative w-full flex-[0_0_100%] snap-start snap-always h-full flex items-end overflow-hidden"
              >
                {/* Backdrop Image */}
                <img
                  src={movie.backdrop || movie.poster}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent sm:w-2/3" />

                {/* Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-12">
                  <div className="max-w-xl flex flex-col items-start gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                        Featured
                      </span>
                      <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-yellow-400 backdrop-blur-md border border-white/10">
                        ★ {movie.rating || '8.8'}
                      </span>
                      <span className="text-xs text-zinc-400">{movie.year || '2024'}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {movie.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-lg leading-relaxed">
                      {movie.overview || movie.synopsis || `Stream ${movie.title} in HD quality with adaptive fast edge routing.`}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => onSelect(movie)}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch Now
                      </button>

                      <button
                        onClick={() => onToggleWatchlist(movie.id)}
                        className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={watchlist?.includes(movie.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        Watchlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Indicator Dots */}
          <div className="absolute bottom-4 left-5 sm:left-8 z-20 flex items-center gap-1.5">
            {heroMovies.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === heroIdx ? 'w-6 bg-red-600' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Genre Pills Bar */}
      <div className="mx-auto flex w-full max-w-7xl overflow-x-auto px-4 sm:px-8 [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 pb-1">
          {genresList.map((genre) => (
            <button
              key={genre}
              onClick={() => onSeeAll(genre)}
              className="shrink-0 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-1.5 text-xs font-semibold capitalize text-zinc-300 backdrop-blur-md transition hover:border-white/25 hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Media Rows */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-8">
        {Object.entries(categorized).map(([genre, rowMovies]) => (
          <div key={genre} className="group/row relative flex flex-col">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-1 rounded-full bg-red-600" />
                <h3 className="text-lg font-bold text-white tracking-tight">{genre}</h3>
              </div>
              <button
                onClick={() => onSeeAll(genre)}
                className="text-xs font-semibold text-zinc-400 hover:text-red-400 transition"
              >
                Explore all &rarr;
              </button>
            </div>

            {/* Row Navigation Arrows */}
            <button
              onClick={() => scrollRow(genre, 'left')}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/10 opacity-0 transition group-hover/row:opacity-100 hover:bg-red-600 -ml-3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scrollRow(genre, 'right')}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/10 opacity-0 transition group-hover/row:opacity-100 hover:bg-red-600 -mr-3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Poster Carousel */}
            <div
              ref={(el) => (rowRefs.current[genre] = el)}
              className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-4">
                {rowMovies.map((movie) => {
                  const isSaved = watchlist?.includes(movie.id);
                  return (
                    <div
                      key={movie.id}
                      onClick={() => onSelect(movie)}
                      className="group relative w-36 shrink-0 snap-start sm:w-44 cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 active:scale-95"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/[0.07] shadow-lg group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-red-600/10 transition-all">
                        {!loadedImages[movie.id] && (
                          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                        )}
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          loading="lazy"
                          onLoad={() => handleImageLoad(movie.id)}
                          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                            loadedImages[movie.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                        />

                        {/* Top Rating Pill */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-md border border-white/10">
                          ★ {movie.rating || '8.5'}
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(movie.id);
                          }}
                          className={`absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition ${
                            isSaved
                              ? 'bg-red-600 text-white'
                              : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>

                        {/* Hover Overlay with Center Play Circle */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 ml-0.5">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>

                        {/* Bottom Gradient Title */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent p-3 pt-8">
                          <h4 className="text-xs font-semibold leading-snug text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium text-zinc-400">{movie.year || '2024'}</span>
                            <span className="text-[9px] rounded border border-white/10 bg-white/5 px-1 font-bold text-zinc-300">
                              HD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

