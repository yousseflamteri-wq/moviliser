import { useState, useEffect, useRef } from 'react';

export default function MovieGrid({ movies, onSelect, onSeeAll }) {
  const heroMovies = movies.slice(0, 5);
  const [heroIdx, setHeroIdx] = useState(0);
  const dragStartX = useRef(null);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroMovies.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const nextSlide = () => setHeroIdx((prev) => (prev + 1) % heroMovies.length);
  const prevSlide = () => setHeroIdx((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);

  const handleTouchStart = (e) => { dragStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!dragStartX.current) return;
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    dragStartX.current = null;
  };

  const handleMouseDown = (e) => { dragStartX.current = e.clientX; };
  const handleMouseUp = (e) => {
    if (!dragStartX.current) return;
    const diff = dragStartX.current - e.clientX;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    dragStartX.current = null;
  };

  const categorized = movies.reduce((acc, movie) => {
    const genre = movie.genre ? movie.genre.split(',')[0].trim() : 'Trending';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  const genresList = Object.keys(categorized);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 pb-12 overflow-x-hidden pt-20">
      
      {/* Interactive Quick-Filter Pills */}
      <div className="mx-auto flex w-full max-w-7xl overflow-x-auto px-4 sm:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-2 pb-2">
          {genresList.map((genre) => (
            <button
              key={genre}
              onClick={() => onSeeAll(genre)}
              className="shrink-0 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-1.5 text-xs font-semibold capitalize text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Hero Carousel with Ambient Radial Glow */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 bg-red-600/15 blur-[120px] pointer-events-none rounded-full" />
        
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="relative flex w-full max-w-4xl mx-auto h-[410px] sm:h-[490px] items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y select-none"
        >
          {heroMovies.map((movie, index) => {
            let styleClasses = 'opacity-0 scale-75 z-0 pointer-events-none translate-x-0';
            const isActive = index === heroIdx;
            const isPrev = index === (heroIdx - 1 + heroMovies.length) % heroMovies.length;
            const isNext = index === (heroIdx + 1) % heroMovies.length;
            
            if (isActive) {
              styleClasses = 'opacity-100 scale-100 z-20 translate-x-0 shadow-2xl shadow-black/80 ring-1 ring-white/20 pointer-events-auto'; 
            } else if (isPrev) {
              styleClasses = 'opacity-35 scale-90 z-10 -translate-x-[55%] sm:-translate-x-[65%] blur-[0.5px] pointer-events-auto'; 
            } else if (isNext) {
              styleClasses = 'opacity-35 scale-90 z-10 translate-x-[55%] sm:translate-x-[65%] blur-[0.5px] pointer-events-auto'; 
            }

            return (
              <div 
                key={movie.id}
                className={`absolute transform-gpu will-change-transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-[70%] sm:w-[50%] max-w-[310px] aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 ${styleClasses}`}
                onClick={() => {
                  if (isActive) onSelect(movie);
                  else setHeroIdx(index);
                }}
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  decoding="async"
                  className="w-full h-full object-cover pointer-events-none"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-md border border-white/10 shadow-lg">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{movie.rating || '8.8'}</span>
                </div>

                <div className="absolute top-3 right-3 rounded-md bg-black/75 px-2 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
                  {movie.year || '2024'}
                </div>

                {/* Bottom Card Scrim */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-20 pb-5 text-center">
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-1 mb-1">
                    {movie.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mb-3">{movie.genre}</p>
                  
                  <div className={`w-full flex justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button 
                      tabIndex={isActive ? 0 : -1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(movie);
                      }}
                      className="flex w-full max-w-[220px] items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Genre Carousel Rows */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-8 mt-6">
        {Object.entries(categorized).map(([genre, rowMovies]) => (
          <div key={genre} className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-red-600" />
                <h3 className="text-base sm:text-lg font-bold text-white capitalize tracking-tight">{genre}</h3>
              </div>
              <button 
                onClick={() => onSeeAll(genre)}
                className="text-xs font-semibold text-red-500 hover:text-red-400 transition"
              >
                See All &rarr;
              </button>
            </div>

            <div className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3 sm:gap-4">
                {rowMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => onSelect(movie)}
                    className="relative w-32 shrink-0 snap-start sm:w-36 md:w-44 cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/[0.08] shadow-lg shadow-black/40 group-hover:border-white/25 group-hover:shadow-2xl">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-105"
                      />
                      
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-md border border-white/10">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{movie.rating || '8.5'}</span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2.5 pt-8">
                        <h4 className="text-xs font-semibold leading-snug text-zinc-100 line-clamp-1 group-hover:text-white">
                          {movie.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{movie.year}</p>
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
