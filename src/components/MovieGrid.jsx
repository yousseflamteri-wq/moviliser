export default function MovieGrid({ movies, onSelect }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <button
            key={movie.id}
            onClick={() => onSelect(movie)}
            className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/5
                       transition duration-200 hover:ring-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-80"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10">
              <h3 className="text-left text-[13px] font-semibold leading-tight text-white line-clamp-2 sm:text-[14px]">
                {movie.title}
              </h3>
              {movie.year && (
                <p className="mt-0.5 text-left text-[11px] text-zinc-400">{movie.year}</p>
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center opacity-0
                            transition duration-200 group-hover:opacity-100 sm:flex">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
