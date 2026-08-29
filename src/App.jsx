import { useState } from 'react';
import { MOVIES } from './movies.js'; // Importing the dynamically generated file
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import UnlockSheet from './components/UnlockSheet';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [unlockingMovie, setUnlockingMovie] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(() => new Set());

  const openDetails = (movie) => setSelectedMovie(movie);
  const closeDetails = () => setSelectedMovie(null);

  const handleWatchNow = () => {
    if (!selectedMovie) return;
    setUnlockingMovie(selectedMovie);
  };

  const handleUnlockContinue = () => {
    console.log("Loading CPA offers for:", unlockingMovie.title);
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
    <div className="min-h-screen bg-zinc-950 font-display">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-[20px] font-bold tracking-tight text-white">
            Free<span className="text-red-500">Reel</span>
          </h1>
          <span className="text-[12px] text-zinc-500">Public Domain Movies</span>
        </div>
      </header>

      <MovieGrid movies={MOVIES} onSelect={openDetails} />

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          unlocked={unlockedIds.has(selectedMovie.id)}
          onWatchNow={handleWatchNow}
          onClose={closeDetails}
        />
      )}

      {unlockingMovie && (
        <UnlockSheet
          item={{ 
            title: unlockingMovie.title, 
            image: unlockingMovie.poster, 
            words: 'HD Movie' 
          }}
          onContinue={handleUnlockContinue}
          onClose={closeUnlockSheet}
        />
      )}
    </div>
  );
}
