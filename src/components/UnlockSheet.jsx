import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [error, setError] = useState(null);
  const [clickedOffer, setClickedOffer] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Pre-fetch the 3 offers quietly in the background
    setLoadingOffers(true);
    fetch('/api/offers')
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.offers || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setOffers(fetched.slice(0, 3));
        } else {
          setError(data.error || 'No active streaming servers found.');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingOffers(false));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Dimmer */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Centered Modal */}
      <div className="relative w-full max-w-xl mx-auto my-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-5 sm:p-6 shadow-2xl shadow-black backdrop-blur-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 1. CLEAN VIDEO PLAYER (ONLY PLAY BUTTON) */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex flex-col justify-between">
          
          {/* Backdrop Thumbnail */}
          <img 
            src={item.image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

          {/* Top Video Header */}
          <div className="relative z-10 flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[240px]">
                {item.title}
              </span>
            </div>
            <span className="rounded bg-red-600/80 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              1080p HD
            </span>
          </div>

          {/* Center Play Button Only */}
          <div className="relative z-10 flex items-center justify-center">
            <button
              onClick={() => setShowOffers(true)}
              className="group flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/60 ring-4 ring-red-500/20 transition-all duration-300 hover:scale-110 hover:bg-red-500 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Bottom Progress Bar */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-600 w-full" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-300">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>00:00 / 02:14:30</span>
              </div>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fast CDN Node
              </span>
            </div>
          </div>
        </div>

        {/* 2. HIGH TRAFFIC NOTICE & FLOW */}
        <div className="mt-5">
          {!showOffers ? (
            /* Pre-Offer Prompt */
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wide">High Server Load Detected</span>
              </div>

              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed max-w-md">
                Due to high traffic, please complete a quick server verification to unlock continuous high-speed streaming.
              </p>

              <button
                onClick={() => setShowOffers(true)}
                className="mt-4 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-xl shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
              >
                <span>Continue to Verification</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            /* Step 2: Exactly 3 Server Offers Appear */
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 mb-0.5">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Choose Verification Server
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Free Access</span>
              </div>

              {loadingOffers ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-zinc-800/50 animate-pulse border border-white/5" />
                ))
              ) : error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
                  {error}
                </div>
              ) : (
                offers.map((offer, idx) => (
                  <a
                    key={offer.offer_id || idx}
                    href={offer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setClickedOffer(true)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:border-red-500/50 hover:bg-white/[0.08] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/15 border border-red-500/30 text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-zinc-100 group-hover:text-white">
                          {offer.name_short || offer.name || `Server Mirror #${idx + 1}`}
                        </h4>
                        <p className="truncate text-[11px] text-zinc-400">
                          {offer.adcopy || 'Quick verification to start player'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-semibold text-zinc-300 group-hover:text-white">
                        Connect
                      </span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-500 transition">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* Post-Click Confirmation Button */}
        {clickedOffer && (
          <div className="mt-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
            <p className="text-xs text-zinc-200">
              Complete the verification in the opened tab. Click below once finished:
            </p>
            <button
              onClick={onComplete}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black shadow-lg transition hover:bg-emerald-400 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              I Completed Verification • Play Movie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
