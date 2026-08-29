import { useState } from 'react';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import UnlockSheet from './components/UnlockSheet';

// Example catalog - replace with your D1 DB fetch later
const MOVIES = [
  {
    id: 'night-of-the-living-dead',
    title: 'Night of the Living Dead',
    year: 1968,
    runtime: '1h 36m',
    genre: 'Horror',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Night_of_the_Living_Dead_affiche.jpg',
    backdrop: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Night_of_the_Living_Dead_affiche.jpg',
    synopsis: 'A group of strangers barricade themselves inside a rural farmhouse as the recently deceased rise as flesh-eating ghouls.',
    cast: ['Duane Jones', 'Judith O\u2019Dea', 'Karl Hardman'],
    videoEmbedUrl: 'https://archive.org/embed/night_of_the_living_dead',
  }
];

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

  // This fires when they click "Continue" on the sheet to load offers.
  // Note: Actual unlock logic (postback) usually happens via polling or API webhook in the background.
  const handleUnlockContinue = () => {
    console.log("Loading CPA offers for:", unlockingMovie.title);
    // If you want to bypass the locker for testing, uncomment the next two lines:
    // markUnlocked(unlockingMovie.id);
    // setUnlockingMovie(null);
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
          // Mapping movie data to the format UnlockSheet expects
          item={{ 
            title: unlockingMovie.title, 
            image: unlockingMovie.poster, 
            words: 'HD Movie' // Repurposed from 'words'
          }}
          onContinue={handleUnlockContinue}
          onClose={closeUnlockSheet}
        />
      )}
    </div>
  );
}
