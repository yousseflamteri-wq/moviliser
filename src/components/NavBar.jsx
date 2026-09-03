import { useState, useEffect } from 'react';
import { Search, Film, Bookmark, Home } from 'lucide-react';

export default function Navbar({ onSearch, activeTab = 'home', onTabChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/40'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onTabChange && onTabChange('home')}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 font-black text-white shadow-lg shadow-red-600/30">
              M
            </span>
            <span className="text-lg font-black tracking-tight text-white">
              MOVI<span className="text-red-500">LISER</span>
            </span>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange && onTabChange('home')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'home'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </button>
            <button
              onClick={() => onTabChange && onTabChange('movies')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'movies'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              Movies
            </button>
            <button
              onClick={() => onTabChange && onTabChange('watchlist')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'watchlist'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Watchlist
            </button>
          </div>
        </div>

        {/* Right Search Input */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search movies, actors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-40 sm:w-60 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-1.5 pl-9 text-xs text-white placeholder-zinc-500 backdrop-blur-md outline-none transition-all duration-300 focus:w-56 sm:focus:w-72 focus:border-red-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-red-500/50"
            />
            <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </form>
        </div>
      </div>
    </nav>
  );
}
