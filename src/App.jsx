import { useState, useEffect } from 'react';
import { MOVIES } from './movies.js';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import UnlockSheet from './components/UnlockSheet';
import GenreView from './components/GenreView';
import SearchModal from './components/SearchModal';
import TrailerModal from './components/TrailerModal';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [unlockingMovie, setUnlockingMovie] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(() => new Set());
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [trailerData, setTrailerData] = useState(null);

  // Watchlist persisted via LocalStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('freereel_watchlist') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('freereel_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (movieId) => {
    setWatchlist((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
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
    setUnlockingMovie(selectedMovie);
  };

  const handleUnlockSuccess = () => {
    if (unlockingMovie) {
      setUnlockedIds((prev) => new Set([...prev, unlockingMovie.id]));
    }
  };

  const closeUnlockSheet = () => setUnlockingMovie(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-red-500/30">
      
      {/* Header */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled || activeGenre
            ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-2xl'
            : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <h1
              onClick={() => setActiveGenre(null)}
              className="text-2xl font-black tracking-tighter text-white cursor-pointer select-none"
            >
              Free<span className="text-red-600">Reel</span>
            </h1>

            {/* Watchlist Quick Tab */}
            <button
              onClick={() => setActiveGenre('watchlist')}
              className={`text-xs font-semibold transition ${
                activeGenre === 'watchlist' ? 'text-red-500' : 'text-zinc-400 hover:text-white'
              }`}
            >
              My List ({watchlist.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition hover:border-white/20 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">⌘K</kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-24">
        {activeGenre ? (
          <GenreView
            genre={activeGenre}
            movies={MOVIES}
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
          />
        )}
      </main>

      {/* Search Modal */}
      <SearchModal
        movies={MOVIES}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={openDetails}
      />

      {/* Trailer Lightbox Modal */}
      {trailerData && (
        <TrailerModal
          trailerUrl={trailerData.url}
          title={trailerData.title}
          onClose={() => setTrailerData(null)}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          unlocked={unlockedIds.has(selectedMovie.id)}
          onWatchNow={handleWatchNow}
          onClose={closeDetails}
          onSelect={openDetails}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
          onOpenTrailer={(url, title) => setTrailerData({ url, title })}
        />
      )}

      {/* OGAds Native Unlock Sheet */}
      {unlockingMovie && (
        <UnlockSheet
          item={{ title: unlockingMovie.title, image: unlockingMovie.poster }}
          onUnlocked={handleUnlockSuccess}
          onClose={closeUnlockSheet}
        />
      )}
    </div>
  );
}
