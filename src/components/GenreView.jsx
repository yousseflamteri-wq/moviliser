export default function GenreView({ genre, movies, onSelect, onBack }) {
  const filtered = movies.filter((m) => {
    if (!m.genre) return genre.toLowerCase() === 'trending';
    return m.genre.toLowerCase().includes(genre.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-24 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white transition hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold capitalize text-white sm:text-3xl">{genre} Movies</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
        {filtered.map((movie) => (
          <div
            key={movie.id}
            onClick={() => onSelect(movie)}
            className="group relative cursor-pointer transition-transform duration-200 active:scale-95"
          >
            <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 shadow-lg">
              <img
                src={movie.poster}
                alt={movie.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:brightness-110"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-yellow-500 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{movie.rating || '8.5'}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10">
                <h4 className="text-sm font-medium leading-snug text-white line-clamp-2">
                  {movie.title}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
