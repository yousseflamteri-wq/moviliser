import { useEffect, useState } from 'react';
import { PosterCard } from './MovieGrid';

export default function MovieDetails({ movie, allMovies, unlocked, onWatchNow, onSelect, onClose }) {
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => { setShowTrailer(false); }, [movie?.id]);

  if (!movie) return null;

  const recommended = (allMovies || []).filter(
    (m) => m.id !== movie.id && m.genres?.some((g) => movie.genres?.includes(g))
  );

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-zinc-950 animate-fade">
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-4 z-[75] flex h-10 w-10 items-center justify-center rounded-full
                   bg-black/50 text-white backdrop-blur-md ring-1 ring-white/10 transition
                   hover:bg-black/70 hover:ring-white/20 sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {unlocked ? (
        <VideoPlayer movie={movie} embedUrl={movie.videoEmbedUrl} />
      ) : showTrailer && movie.trailerEmbedUrl ? (
        <VideoPlayer movie={movie} embedUrl={movie.trailerEmbedUrl} label="Trailer" onBack={() => setShowTrailer(false)} />
      ) : (
        <>
          <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[64vh]">
            <img
              src={movie.backdrop || movie.poster}
              alt=""
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-8">
              <h1 className="text-[34px] font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-lg sm:text-[46px]">
                {movie.title}
              </h1>
            </div>
          </div>

          <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {movie.year && <Pill icon="calendar">{movie.year}</Pill>}
              {movie.runtime && <Pill icon="clock">{movie.runtime}</Pill>}
              {movie.genres?.map((g) => (
                <Pill key={g} icon="tag">{g}</Pill>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onWatchNow}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600
                           py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-red-600/25
                           transition duration-150 hover:scale-[1.01] hover:bg-red-500 active:scale-[0.99]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              {movie.trailerEmbedUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center justify-center gap-2 rounded-full bg-white/10 py-3.5
                             text-[15px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm
                             transition duration-150 hover:bg-white/15 sm:px-8"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Trailer
                </button>
              )}
            </div>

            {movie.synopsis && (
              <div className="mt-8">
                <h2 className="mb-2 text-[19px] font-bold text-white">Overview</h2>
                <p className="text-[15px] leading-relaxed text-zinc-400">{movie.synopsis}</p>
              </div>
            )}

            {movie.cast?.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-[19px] font-bold text-white">Cast</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-zinc-800/70 px-3.5 py-1.5 text-[13px] font-medium text-zinc-200 ring-1 ring-white/5"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {recommended.length > 0 && (
            <div className="relative mx-auto max-w-6xl pb-20">
              <h2 className="mb-3 px-5 text-[19px] font-bold text-white sm:px-8">Recommended</h2>
              <div className="flex gap-3 overflow-x-auto scroll-smooth px-5 pb-2 [-ms-overflow-style:none]
                              [scrollbar-width:none] sm:gap-4 sm:px-8 [&::-webkit-scrollbar]:hidden">
                {recommended.map((m) => (
                  <div key={m.id} className="w-[42vw] shrink-0 sm:w-[200px]">
                    <PosterCard movie={m} onClick={() => onSelect(m)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Pill({ icon, children }) {
  const icons = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    tag: <><path d="M20.59 13.41L11 4H4v7l9.59 9.59a2 2 0 002.82 0l4.18-4.18a2 2 0 000-2.82z" /><circle cx="7.5" cy="7.5" r="1" fill="currentColor" /></>,
  };
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-zinc-800/70 px-3 py-1.5 text-[13px] font-medium text-zinc-200 ring-1 ring-white/5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-red-500">
        {icons[icon]}
      </svg>
      {children}
    </span>
  );
}

function VideoPlayer({ movie, embedUrl, label, onBack }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-white sm:text-[20px]">
            {movie.title}{label ? <span className="ml-2 text-zinc-500">· {label}</span> : null}
          </h2>
          {onBack && (
            <button onClick={onBack} className="text-[13px] font-medium text-zinc-400 hover:text-white">
              ← Back to details
            </button>
          )}
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
          {embedUrl ? (
            <iframe
              src={embedUrl}
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
