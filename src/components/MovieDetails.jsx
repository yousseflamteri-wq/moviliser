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
  // 'idle' = normal view | 'buffering' = fake loading | 'locked' = verification required
  const [streamState, setStreamState] = useState('idle');

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

  // 1. Triggers the fake buffering sequence
  const handleInitialPlay = () => {
    setStreamState('buffering');
    
    // 2. Wait 2.5 seconds to build trust, then lock the player
    setTimeout(() => {
      setStreamState('locked');
    }, 2500);
  };

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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/80"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto -mt-20 max-w-4xl px-5">
        
        {/* Dynamic Player Area */}
        {(streamState !== 'idle' || unlocked) ? (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl relative flex items-center justify-center animate-in zoom-in-95 duration-300">
            
            {unlocked ? (
              /* Real iframe once CPA is completed */
              <iframe src={movie.videoEmbedUrl} allowFullScreen className="h-full w-full absolute inset-0 z-10" />
            ) : (
              <>
                {/* Fake Player Background */}
                <img src={movie.backdrop || movie.poster} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Buffering State */}
                {streamState === 'buffering' && (
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <svg className="h-10 w-10 animate-spin text-red-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Connecting to Premium Server...</p>
                      <p className="text-xs text-zinc-400 mt-1">Locating 4K stream</p>
                    </div>
                  </div>
                )}

                {/* Locked State (Triggers OGAds) */}
                {streamState === 'locked' && (
                  <div className="relative z-10 flex flex-col items-center gap-4 bg-black/60 p-6 rounded-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                    <div className="rounded-full bg-red-600/20 p-3 text-red-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="text-center max-w-xs">
                      <p className="text-base font-bold text-white">Verification Required</p>
                      <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                        Due to high traffic, please verify you are human to start streaming <span className="font-semibold text-white">{movie.title}</span>.
                      </p>
                    </div>
                    {/* THIS BUTTON OPENS THE OFFER WALL */}
                    <button
                      onClick={onWatchNow} 
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Verify & Continue Watching
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Normal Movie Info (Idle State) */
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
                  onClick={handleInitialPlay} // Changed to trigger the fake buffering sequence
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
        )}

        {/* Synopsis & Cast (Dims when player is active) */}
        <div className={`mt-8 space-y-4 transition-opacity duration-300 ${streamState !== 'idle' && !unlocked ? 'opacity-40 pointer-events-none' : ''}`}>
          <h3 className="text-sm font-bold text-zinc-200">Synopsis</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{movie.synopsis}</p>

          {movie.cast?.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-zinc-500">Starring: </span>
              <span className="text-xs text-zinc-300">{movie.cast.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Recommended Row (Dims when player is active) */}
        {recommendedMovies.length > 0 && (
          <div className={`mt-12 transition-opacity duration-300 ${streamState !== 'idle' && !unlocked ? 'opacity-40 pointer-events-none' : ''}`}>
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
