import { useState, useEffect } from 'react';
import { MOVIES } from './movies.js';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import UnlockSheet from './components/UnlockSheet';
import GenreView from './components/GenreView';
import SearchModal from './components/SearchModal';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [unlockingMovie, setUnlockingMovie] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(() => new Set());
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Watchlist stored in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('moviliser_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('moviliser_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  const toggleWatchlist = (id) => {
    setWatchlist((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openDetails = (movie) => setSelectedMovie(movie);
  const closeDetails = () => setSelectedMovie(null);

  const handleWatchNow = () => {
    if (!selectedMovie) return;
    if (unlockedIds.has(selectedMovie.id)) return;
    setUnlockingMovie(selectedMovie);
  };

  const handleUnlockComplete = () => {
    if (!unlockingMovie) return;
    setUnlockedIds((prev) => new Set([...prev, unlockingMovie.id]));
    setUnlockingMovie(null);
  };

  const closeUnlockSheet = () => setUnlockingMovie(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-red-500/30">
      <header 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled || activeGenre 
            ? 'bg-[#09090b]/85 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8">
          <h1 
            onClick={() => setActiveGenre(null)} 
            className="text-2xl font-black tracking-tighter text-white cursor-pointer select-none"
          >
            Free<span className="text-red-600">Reel</span>
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveGenre('watchlist')}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeGenre === 'watchlist'
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:text-white'
              }`}
            >
              <svg viewBox="0 0 24 24" fill={watchlist.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>My List</span>
              {watchlist.length > 0 && (
                <span className="ml-0.5 rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-200">
                  {watchlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition hover:border-white/20 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <kbd className="hidden sm:inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">⌘K</kbd>
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24">
        {activeGenre ? (
          <GenreView 
            genre={activeGenre} 
            movies={activeGenre === 'watchlist' ? MOVIES.filter(m => watchlist.includes(m.id)) : MOVIES} 
            onSelect={openDetails} 
            onBack={() => setActiveGenre(null)}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
          />
        ) : (
          <MovieGrid 
            movies={MOVIES} 
            onSelect={openDetails} 
            onSeeAll={(genre) => setActiveGenre(genre)} 
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
          />
        )}
      </main>

      <SearchModal
        movies={MOVIES}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={openDetails}
      />

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          unlocked={unlockedIds.has(selectedMovie.id)}
          onWatchNow={handleWatchNow}
          onClose={closeDetails}
          onSelect={openDetails}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
        />
      )}

      {unlockingMovie && (
        <UnlockSheet
          item={{ title: unlockingMovie.title, image: unlockingMovie.poster }}
          onComplete={handleUnlockComplete}
          onClose={closeUnlockSheet}
        />
      )}
    </div>
  );
}
