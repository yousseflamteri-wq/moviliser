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

  const related = (allMovies || []).filter(
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
          <div className="relative h-[48vh] w-full overflow-hidden sm:h-[58vh]">
            <img
              src={movie.backdrop || movie.poster}
              alt=""
              className="h-full w-full scale-110 object-cover object-top [animation:kenburns_18s_ease-in-out_infinite_alternate]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-zinc-950/40" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>

          <div className="relative mx-auto -mt-28 max-w-4xl px-5 sm:-mt-36 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-9">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-64 w-44 shrink-0 self-start rounded-xl object-cover shadow-2xl ring-1 ring-white/10 sm:h-[22rem] sm:w-60"
              />

              <div className="min-w-0 pt-2 sm:pt-6">
                <h1 className="text-[30px] font-bold leading-[1.05] tracking-tight text-white sm:text-[42px]">
                  {movie.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-zinc-400">
                  {movie.year && <span className="font-medium text-zinc-300">{movie.year}</span>}
                  {movie.runtime && <span>{movie.runtime}</span>}
                  {movie.genres?.length > 0 && <span>{movie.genres.join(', ')}</span>}
                  <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 text-[10.5px]
                                   font-medium uppercase tracking-wide text-zinc-400">
                    Public Domain
                  </span>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={onWatchNow}
                    className="flex items-center justify-center gap-2 rounded-full bg-red-600
                               py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-red-600/25
                               transition duration-150 hover:scale-[1.015] hover:bg-red-500 active:scale-[0.985]
                               sm:px-11"
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
                        <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
                      </svg>
                      Play Trailer
                    </button>
                  )}
                </div>

                {movie.synopsis && (
                  <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-zinc-300">
                    {movie.synopsis}
                  </p>
                )}

                {movie.cast?.length > 0 && (
                  <p className="mt-5 text-[13.5px] leading-relaxed text-zinc-400">
                    <span className="font-semibold text-zinc-200">Starring </span>
                    {movie.cast.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="relative mx-auto mt-14 max-w-6xl pb-20">
              <h2 className="mb-3 px-5 text-[15px] font-semibold tracking-tight text-zinc-200 sm:px-8 sm:text-[17px]">
                More {movie.genres[0]}
              </h2>
              <div className="flex gap-3 overflow-x-auto scroll-smooth px-5 pb-2 [-ms-overflow-style:none]
                              [scrollbar-width:none] sm:gap-4 sm:px-8 [&::-webkit-scrollbar]:hidden">
                {related.map((m) => (
                  <div key={m.id} className="w-[42vw] shrink-0 sm:w-[200px]">
                    <PosterCard movie={m} onClick={() => onSelect(m)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes kenburns { from { transform: scale(1.1) translateY(0); } to { transform: scale(1.18) translateY(-1%); } }
      `}</style>
    </div>
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
