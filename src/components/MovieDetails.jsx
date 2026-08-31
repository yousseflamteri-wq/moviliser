import { useState, useEffect } from 'react';
import { MOVIES } from '../movies.js';
import TrailerModal from './TrailerModal';

export default function MovieDetails({ 
  movie, 
  unlocked, 
  onWatchNow, 
  onClose, 
  onSelect,
  watchlist,
  onToggleWatchlist
}) {
  const [showTrailer, setShowTrailer] = useState(false);

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

  const isSaved = watchlist?.includes(movie.id);
  const recommendedMovies = MOVIES.filter((m) => m.id !== movie.id).slice(0, 8);
  const genres = movie.genre ? movie.genre.split(',').map((g) => g.trim()) : [];

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0a0a] animate-in fade-in duration-200 pb-16 [&::-webkit-scrollbar]:hidden">
      
      {/* Hero Backdrop */}
      <div className="relative h-[48vh] w-full bg-zinc-900 shrink-0">
        <img src={movie.backdrop || movie.poster} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />

        {/* Top Floating Controls */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6 z-20">
          <nav className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <button onClick={onClose} className="hover:text-white transition">Home</button>
            <span>/</span>
            <span className="capitalize">{genres[0] || 'Movies'}</span>
            <span>/</span>
            <span className="text-white truncate max-w-[120px]">{movie.title}</span>
          </nav>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/80 transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto -mt-20 max-w-4xl px-5">
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-36 sm:w-48 aspect-[2/3] shrink-0 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 bg-zinc-800"
          />

          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-2xl font-black text-white sm:text-4xl">{movie.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-xs font-bold text-yellow-400">
                ★ {movie.rating || '8.8'}
              </span>
              <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-zinc-200">
                4K HDR
              </span>
              {movie.year && <span className="text-xs text-zinc-400">{movie.year}</span>}
              {movie.runtime && <span className="text-xs text-zinc-400">&bull; {movie.runtime}</span>}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onWatchNow} // Directly triggers the 2-step UnlockSheet
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              {movie.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/80 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-zinc-700 active:scale-95"
                >
                  Trailer
                </button>
              )}

              <button
                onClick={() => onToggleWatchlist(movie.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition active:scale-95 ${
                  isSaved 
                    ? 'border-red-600 bg-red-600/20 text-red-500' 
                    : 'border-white/10 bg-zinc-800/80 text-zinc-300 hover:text-white'
                }`}
                title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Video Player (Appears seamlessly after CPA completion) */}
        {unlocked && (
          <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <iframe src={movie.videoEmbedUrl} allowFullScreen className="h-full w-full" />
          </div>
        )}

        {/* Synopsis & Cast */}
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Synopsis</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{movie.synopsis}</p>

          {movie.cast?.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-zinc-500">Starring: </span>
              <span className="text-xs text-zinc-300">{movie.cast.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Recommended Row */}
        {recommendedMovies.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-4 text-sm font-bold text-zinc-200">More Like This</h3>
            <div className="-mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 pb-4 [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-3">
                {recommendedMovies.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      onClose();
                      setTimeout(() => onSelect(rec), 100);
                    }}
                    className="w-28 shrink-0 snap-start cursor-pointer transition active:scale-95"
                  >
                    <img src={rec.poster} alt={rec.title} className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-white/10" />
                    <h4 className="mt-1.5 truncate text-[11px] font-semibold text-zinc-300">{rec.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Internal Trailer Video Lightbox */}
      {showTrailer && (
        <TrailerModal
          trailerUrl={movie.trailerUrl}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
