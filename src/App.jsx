import { useState, useEffect } from 'react';
import { MOVIES } from './movies.js';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import UnlockSheet from './components/UnlockSheet';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [unlockingMovie, setUnlockingMovie] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(() => new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openDetails = (movie) => setSelectedMovie(movie);
  const closeDetails = () => setSelectedMovie(null);

  const handleWatchNow = () => {
    if (!selectedMovie) return;
    setUnlockingMovie(selectedMovie);
  };

  const handleUnlockContinue = () => {
    // TODO: this is where your real CPA offer flow goes (open the inline
    // offers modal, redirect to the OGAds locker, etc.). Once that flow
    // reports success, call markUnlocked so the video actually plays —
    // right now this just unlocks immediately as a stand-in.
    console.log("Triggering CPA offer flow for:", unlockingMovie?.title);
    if (unlockingMovie) {
      markUnlocked(unlockingMovie.id);
    }
    setUnlockingMovie(null);
  };

  const markUnlocked = (movieId) => {
    setUnlockedIds((prev) => {
      const next = new Set(prev);
      next.add(movieId);
      return next;
    });
  };

  const closeUnlockSheet = () => setUnlockingMovie(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-red-500/30">
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-zinc-950/95 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Free<span className="text-red-600">Reel</span>
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-sm font-semibold text-zinc-300 hover:text-white transition">Sign In</button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 ring-2 ring-transparent hover:ring-white/20 transition cursor-pointer" />
          </div>
        </div>
      </header>

      <main className="pb-24">
        <MovieGrid movies={MOVIES} onSelect={openDetails} />
      </main>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          allMovies={MOVIES}
          unlocked={unlockedIds.has(selectedMovie.id)}
          onWatchNow={handleWatchNow}
          onSelect={openDetails}
          onClose={closeDetails}
        />
      )}

      {unlockingMovie && (
        <UnlockSheet
          item={{ title: unlockingMovie.title, image: unlockingMovie.poster }}
          onContinue={handleUnlockContinue}
          onClose={closeUnlockSheet}
        />
      )}
    </div>
  );
}
