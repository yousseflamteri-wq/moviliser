import { useEffect } from 'react';

export default function MovieDetails({ movie, unlocked, onWatchNow, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    // Lock scroll underneath the full screen view
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => { 
      window.removeEventListener('keydown', onKey); 
      document.body.style.overflow = ''; 
      document.documentElement.style.overflow = '';
    };
  }, [onClose]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[50] overflow-y-auto bg-zinc-950 animate-fade">
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-4 z-[55] flex h-10 w-10 items-center justify-center rounded-full
                   bg-black/60 text-white backdrop-blur transition hover:bg-black/80 sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {unlocked ? (
        <VideoPlayer movie={movie} />
      ) : (
        <>
          <div className="relative h-[46vh] w-full sm:h-[56vh]">
            <img src={movie.backdrop || movie.poster} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto -mt-24 max-w-4xl px-5 pb-16 sm:-mt-32 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-64 w-44 shrink-0 self-start rounded-xl object-cover shadow-2xl ring-1 ring-white/10 sm:h-80 sm:w-56"
              />

              <div className="min-w-0 pt-2">
                <h1 className="text-[28px] font-bold leading-tight text-white sm:text-[36px]">{movie.title}</h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-400">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.runtime && <span>· {movie.runtime}</span>}
                  {movie.genre && <span>· {movie.genre}</span>}
                </div>

                <button
                  onClick={onWatchNow}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-red-600
                             py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-red-600/20
                             transition hover:bg-red-500 sm:w-auto sm:px-10"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </button>

                {movie.synopsis && (
                  <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-zinc-300">{movie.synopsis}</p>
                )}

                {movie.cast?.length > 0 && (
                  <p className="mt-4 text-[13.5px] text-zinc-400">
                    <span className="font-semibold text-zinc-300">Starring:</span> {movie.cast.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function VideoPlayer({ movie }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-5xl">
        <h2 className="mb-4 text-[18px] font-semibold text-white sm:text-[20px]">{movie.title}</h2>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
          {movie.videoEmbedUrl ? (
            <iframe
              src={movie.videoEmbedUrl}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-500">
              No video source configured for this title yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
