import { useEffect } from 'react';
import { MOVIES } from '../movies.js';

export default function MovieDetails({
  movie,
  unlocked,
  onWatchNow,
  onClose,
  onSelect,
  watchlist = [],
  onToggleWatchlist,
  onOpenTrailer,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!movie) return null;

  const isSaved = watchlist.includes(movie.id);
  const recommendedMovies = MOVIES.filter((m) => m.id !== movie.id).slice(0, 10);
  const genres = movie.genre ? movie.genre.split(',').map((g) => g.trim()) : [];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0a0a0a] animate-in fade-in duration-300 pb-12 [&::-webkit-scrollbar]:hidden">
      
      {/* Hero Image Section */}
      <div className="relative h-[45vh] w-full bg-zinc-900 shrink-0">
        <img
          src={movie.backdrop || movie.poster}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur ring-1 ring-white/10 active:scale-95 z-20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto -mt-16 max-w-2xl px-5">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-3">
          <span className="cursor-pointer hover:text-white" onClick={onClose}>Home</span>
          <span>&rsaquo;</span>
          <span className="text-zinc-300 capitalize">{genres[0] || 'Movies'}</span>
          <span>&rsaquo;</span>
          <span className="text-red-500 line-clamp-1">{movie.title}</span>
        </nav>

        {/* Title & Rating */}
        <h1 className="text-2xl font-bold leading-tight text-zinc-100 sm:text-3xl">{movie.title}</h1>
        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-yellow-500">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>{movie.rating || '8.5'}</span>
        </div>

        {/* Metadata Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {movie.year && (
            <div className="flex items-center gap-1.5 rounded-md border border-white/5 bg-[#18181b] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              {movie.year}
            </div>
          )}
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
            4K HDR
          </div>
          {movie.runtime && (
            <div className="rounded-md border border-white/5 bg-[#18181b] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              {movie.runtime}
            </div>
          )}
          {genres.map((g) => (
            <div key={g} className="rounded-md border border-white/5 bg-[#18181b] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              {g}
            </div>
          ))}
        </div>

        {/* Watch Now, Trailer Lightbox, and Watchlist */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={unlocked ? null : onWatchNow}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-sm text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>{unlocked ? 'Now Playing' : 'Watch Now'}</span>
          </button>

          {movie.trailerUrl && (
            <button
              onClick={() => onOpenTrailer(movie.trailerUrl, movie.title)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-zinc-400">
                <path d="M8 5v14l11-7z" />
              </svg>
              Trailer
            </button>
          )}

          <button
            onClick={() => onToggleWatchlist(movie.id)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition active:scale-95 ${
              isSaved
                ? 'border-red-600 bg-red-600/20 text-red-500'
                : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Video Player when Unlocked */}
        {unlocked && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
            <iframe src={movie.videoEmbedUrl} allowFullScreen className="h-full w-full border-0" />
          </div>
        )}

        {/* Overview */}
        <div className="mt-8">
          <h3 className="text-[15px] font-semibold text-zinc-100">Overview</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">{movie.synopsis}</p>
        </div>

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[15px] font-semibold text-zinc-100">Cast</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">{movie.cast.join(', ')}</p>
          </div>
        )}

        {/* Recommended Row */}
        {recommendedMovies.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-3 text-[15px] font-semibold text-zinc-100">Recommended</h3>
            <div className="-mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 pb-4 [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-3">
                {recommendedMovies.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      onClose();
                      setTimeout(() => onSelect && onSelect(rec), 150);
                    }}
                    className="w-28 shrink-0 snap-start cursor-pointer transition active:scale-95 sm:w-32"
                  >
                    <img
                      src={rec.poster}
                      alt={rec.title}
                      className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-white/10"
                    />
                    <h4 className="mt-2 truncate text-[12px] font-medium text-zinc-300">{rec.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
