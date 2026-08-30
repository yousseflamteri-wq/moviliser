import { useEffect } from 'react';

export default function MovieDetails({ movie, unlocked, onWatchNow, onClose }) {
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

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-zinc-950 animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="fixed right-5 top-5 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md ring-1 ring-white/10 transition hover:bg-black/80 hover:scale-105"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {unlocked ? (
        <VideoPlayer movie={movie} />
      ) : (
        <div className="min-h-screen">
          <div className="relative h-[50vh] w-full sm:h-[60vh] overflow-hidden">
            <img 
              src={movie.backdrop || movie.poster} 
              alt="" 
              className="h-full w-full object-cover animate-[pulse_20s_ease-in-out_infinite_alternate] scale-110" 
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent sm:via-zinc-950/40" />
          </div>

          <div className="relative mx-auto -mt-32 max-w-6xl px-5 pb-24 sm:-mt-40 sm:px-8">
            <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
              <div className="w-40 shrink-0 sm:w-64">
                <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 bg-zinc-900">
                  <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-end pt-2 sm:pt-8">
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{movie.title}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-200">{movie.year}</span>
                  <span className="flex items-center rounded border border-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    4K HDR
                  </span>
                  {movie.runtime && <span>{movie.runtime}</span>}
                  {movie.genre && <span>{movie.genre}</span>}
                </div>

                <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                  <button
                    onClick={onWatchNow}
                    className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-900/50 transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M8 5v14l11-7z" /></svg>
                    Watch Now
                  </button>
                  {movie.trailerUrl && (
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-md bg-zinc-800/80 px-8 py-3.5 text-base font-semibold text-white ring-1 ring-white/10 backdrop-blur transition-all hover:bg-zinc-700 hover:scale-[1.02] active:scale-95"
                    >
                      Play Trailer
                    </a>
                  )}
                </div>

                {movie.synopsis && (
                  <p className="mt-10 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                    {movie.synopsis}
                  </p>
                )}

                {movie.cast?.length > 0 && (
                  <div className="mt-8 border-t border-white/5 pt-6">
                    <span className="block text-sm font-medium text-zinc-500 mb-1">Starring</span>
                    <span className="text-sm text-zinc-300">{movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoPlayer({ movie }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 py-16">
      <div className="w-full max-w-6xl">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
          {movie.videoEmbedUrl ? (
            <iframe
              src={movie.videoEmbedUrl}
              allow="autoplay; fullscreen"
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">No video source</div>
          )}
        </div>
      </div>
    </div>
  );
}
