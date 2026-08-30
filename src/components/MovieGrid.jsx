export default function MovieGrid({ movies, onSelect }) {
  if (!movies || movies.length === 0) return null;

  const heroMovie = movies[0];
  
  // Group remaining movies by their first genre
  const categorized = movies.slice(1).reduce((acc, movie) => {
    const genre = movie.genre ? movie.genre.split(',')[0].trim() : 'Trending Now';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] w-full cursor-pointer group" onClick={() => onSelect(heroMovie)}>
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" /> {/* Skeleton */}
        <img 
          src={heroMovie.backdrop || heroMovie.poster} 
          alt={heroMovie.title} 
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-2 drop-shadow-lg">
              {heroMovie.title}
            </h2>
            <div className="flex items-center gap-3 text-sm font-medium text-zinc-300 mb-5 drop-shadow">
              <span>{heroMovie.year}</span>
              <span className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-xs text-white backdrop-blur">HD</span>
              <span>{heroMovie.runtime}</span>
            </div>
            <p className="mb-6 line-clamp-3 text-base leading-relaxed text-zinc-200 drop-shadow md:text-lg">
              {heroMovie.synopsis}
            </p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M8 5v14l11-7z" /></svg>
                Play
              </button>
              <button className="rounded-full bg-zinc-500/40 px-6 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-zinc-500/60">
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Carousels */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 sm:px-8">
        {Object.entries(categorized).map(([genre, rowMovies]) => (
          <div key={genre} className="flex flex-col">
            <h3 className="mb-4 text-lg font-bold text-white sm:text-xl">{genre}</h3>
            <div className="-mx-5 flex snap-x snap-mandatory overflow-x-auto px-5 pb-4 scrollbar-hide sm:-mx-8 sm:px-8">
              <div className="flex gap-4 sm:gap-5">
                {rowMovies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => onSelect(movie)}
                    className="group relative w-32 shrink-0 snap-start sm:w-40 md:w-48 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:z-10 focus:outline-none"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-white/10 shadow-lg group-hover:ring-white/30 group-hover:shadow-2xl">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                        <div className="rounded-full bg-white/20 p-3 backdrop-blur-md transition-transform duration-300 scale-90 group-hover:scale-100">
                          <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-1"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
