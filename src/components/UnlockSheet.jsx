import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  // 0: Fetching, 1: Selecting best server, 2: Done & Ready
  const [phase, setPhase] = useState(0);
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Step 1: Fetching servers (0 to 1.4s)
    const t1 = setTimeout(() => {
      setPhase(1); // Step 2: Selecting fastest server (1.4s to 2.8s)
    }, 1400);

    // Step 3: Complete handshake at 2.8s
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 2800);

    // Pre-fetch the 3 offers quietly in the background
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
      .catch((err) => setError(err.message));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t1);
      clearTimeout(t2);
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

        {/* 1. CLEAN VIDEO PLAYER */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex flex-col justify-between">
          
          {/* Backdrop Poster */}
          <img 
            src={item.image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/60" />

          {/* Top Header */}
          <div className="relative z-10 flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${phase === 2 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[240px]">
                {item.title}
              </span>
            </div>
            <span className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
              1080p HD
            </span>
          </div>

          {/* Center Content: Server Connection Messages */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            {phase === 0 && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" />
                <p className="text-xs font-semibold text-zinc-300 tracking-wide animate-pulse">
                  Fetching streaming servers...
                </p>
              </div>
            )}

            {phase === 1 && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
                <p className="text-xs font-semibold text-emerald-400 tracking-wide animate-pulse">
                  Selecting the fastest server node...
                </p>
              </div>
            )}
          </div>

          {/* Bottom Video Progress Bar */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-red-600 transition-all duration-700 ease-out" 
                style={{ width: phase === 0 ? '25%' : phase === 1 ? '70%' : '100%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-300">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>00:00 / 02:14:30</span>
              </div>
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                {phase < 2 ? (
                  <span>Initializing Stream...</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Edge Node 1 (Ready)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 2. LOWER SECTION: NOTICE & SMALL CONTINUE BUTTON */}
        <div className="mt-4">
          {phase < 2 ? (
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-500 text-xs font-medium">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              <span>Checking network routes & server capacity...</span>
            </div>
          ) : !showOffers ? (
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300">
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed max-w-md mb-3">
                Due to high traffic, please complete a quick server verification to unlock continuous high-speed streaming.
              </p>

              <button
                onClick={() => setShowOffers(true)}
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 active:scale-95"
              >
                Continue
              </button>
            </div>
          ) : (
            /* Step 2: The 3 Server Offers Only */
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mb-0.5">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Choose Verification Server
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Free Access</span>
              </div>

              {error ? (
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
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3 transition-all hover:border-red-500/50 hover:bg-white/[0.08] active:scale-[0.99]"
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
      </div>
    </div>
  );
}
