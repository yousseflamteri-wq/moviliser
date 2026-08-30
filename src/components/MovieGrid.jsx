import { useState, useEffect } from 'react';

export default function MovieGrid({ movies, onSelect }) {
  // Use the first 5 movies for the hero auto-slider
  const heroMovies = movies.slice(0, 5);
  const [heroIdx, setHeroIdx] = useState(0);

  // Auto-slide effect for the hero carousel (slides every 4 seconds)
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroMovies.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  // Group the rest of the movies by their primary genre for the rows
  const categorized = movies.reduce((acc, movie) => {
    // Safely extract the first genre from the string (e.g., "Action, Sci-Fi" -> "Action")
    const genre = movie.genre ? movie.genre.split(',')[0].trim() : 'Trending';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  if (!movies || movies.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 pb-12 overflow-x-hidden pt-20">
      
      {/* 3D Auto-Sliding Hero Carousel */}
      <div className="relative flex flex-col items-center w-full min-h-[420px] sm:min-h-[500px]">
        <div className="relative flex w-full max-w-3xl h-[350px] sm:h-[450px] items-center justify-center">
          {heroMovies.map((movie, index) => {
            // Calculate relative position for the 3D stacking effect
            let position = 'opacity-0 scale-75 z-0 translate-x-0 hidden';
            
            if (index === heroIdx) {
              position = 'opacity-100 scale-100 z-20 translate-x-0'; // Center Active
            } else if (index === (heroIdx - 1 + heroMovies.length) % heroMovies.length) {
              position = 'opacity-40 scale-90 z-10 -translate-x-[55%] sm:-translate-x-[65%]'; // Left
            } else if (index === (heroIdx + 1) % heroMovies.length) {
              position = 'opacity-40 scale-90 z-10 translate-x-[55%] sm:translate-x-[65%]'; // Right
            }

            return (
              <div 
                key={movie.id}
                className={`absolute transition-all duration-700 ease-in-out w-[65%] sm:w-[45%] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer ${position}`}
                onClick={() => onSelect(movie)}
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Fake Rating Badge on Hero */}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs font-bold text-yellow-500 backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <span>8.9</span>
                </div>
                
                <div className="absolute top-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {movie.year || '2024'}
                </div>

                {/* Bottom Title Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 text-center">
                  <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                    {movie.title}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified Watch Now Button (triggers the active hero movie) */}
        <button 
          onClick={() => onSelect(heroMovies[heroIdx])}
          className="z-30 -mt-4 sm:-mt-8 flex w-[60%] max-w-[280px] items-center justify-center gap-2 rounded-lg bg-[#d11013] py-3.5 text-[15px] font-bold text-white shadow-lg transition active:scale-95 hover:bg-red-700"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch Now
        </button>
      </div>

      {/* Dynamic Genre Rows */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-8 mt-4">
        {Object.entries(categorized).map(([genre, rowMovies]) => (
          <div key={genre} className="flex flex-col">
            
            {/* Row Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-white">{genre}</h3>
              <button className="text-[13px] font-medium text-red-600 hover:text-red-500">
                See All
              </button>
            </div>

            {/* Scrollable Card Container */}
            <div className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3 sm:gap-4">
                {rowMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => onSelect(movie)}
                    className="relative w-32 shrink-0 snap-start sm:w-36 md:w-44 cursor-pointer transition-transform active:scale-95 group"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:brightness-110"
                      />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-yellow-500 backdrop-blur-sm">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span>{movie.rating || '8.5'}</span>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-10">
                        <h4 className="text-[13px] font-medium leading-snug text-white line-clamp-2">
                          {movie.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
