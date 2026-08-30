import { useState } from 'react';

export default function MovieGrid({ movies, onSelect }) {
  const [featured, ...rest] = movies;

  return (
    <div>
      {featured && <Hero movie={featured} onWatch={() => onSelect(featured)} />}

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {featured && (
          <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-zinc-200 sm:text-[17px]">
            Browse the library
          </h2>
        )}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {(featured ? rest : movies).map((movie) => (
            <PosterCard key={movie.id} movie={movie} onClick={() => onSelect(movie)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ movie, onWatch }) {
  return (
    <div className="relative h-[52vh] min-h-[360px] w-full overflow-hidden sm:h-[62vh]">
      <img
        src={movie.backdrop || movie.poster}
        alt=""
        className="h-full w-full scale-105 object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]
                          font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-red-500"><circle cx="10" cy="10" r="10" /></svg>
          Featured tonight
        </span>
        <h1 className="max-w-xl text-[32px] font-bold leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-[46px]">
          {movie.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-zinc-300">
          {movie.year && <span>{movie.year}</span>}
          {movie.runtime && <span>· {movie.runtime}</span>}
          {movie.genre && <span>· {movie.genre}</span>}
          <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10.5px] uppercase tracking-wide text-zinc-300">
            Public domain
          </span>
        </div>
        {movie.synopsis && (
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-zinc-300 line-clamp-2 sm:text-[15px]">
            {movie.synopsis}
          </p>
        )}
        <button
          onClick={onWatch}
          className="mt-5 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-zinc-950
                     shadow-xl transition duration-150 hover:scale-[1.02] hover:bg-zinc-100 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M8 5v14l11-7z" /></svg>
          Watch Now
        </button>
      </div>
    </div>
  );
}

function PosterCard({ movie, onClick }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/5
                 transition duration-200 ease-out hover:-translate-y-1 hover:ring-white/25
                 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-900" />
      )}

      <img
        src={movie.poster}
        alt={movie.title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.06]
                    ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-2.5 pt-12 sm:p-3 sm:pt-14">
        <h3 className="text-left text-[12.5px] font-semibold leading-tight text-white line-clamp-2 sm:text-[13.5px]">
          {movie.title}
        </h3>
        {movie.year && (
          <p className="mt-0.5 text-left text-[10.5px] text-zinc-400">{movie.year}</p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/20 opacity-0
                      transition duration-200 group-hover:opacity-100 sm:flex">
        <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-white/95 text-black
                          shadow-xl transition duration-200 group-hover:scale-100">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-4.5 w-4.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </button>
  );
}
