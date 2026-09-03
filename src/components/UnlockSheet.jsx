import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  const [loadingPhase, setLoadingPhase] = useState(0); // 0: Fetching, 1: Selecting, 2: Ready
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);
  const [clickedOffer, setClickedOffer] = useState(false);

  const phaseMessages = [
    'Fetching streaming servers...',
    'Selecting the best high-speed server...',
    'Stream Ready • Complete quick step to play'
  ];

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Phase 1 -> Phase 2
    const t1 = setTimeout(() => setLoadingPhase(1), 1200);

    // Fetch offers and slice to exactly 3
    fetch('/api/offers')
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.offers || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setOffers(fetched.slice(0, 3)); // EXACTLY 3 OFFERS
        } else {
          setError(data.error || 'No active streaming servers found.');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setTimeout(() => setLoadingPhase(2), 2400);
      });

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t1);
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

      {/* Centered Modal Container */}
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

        {/* 1. MOCKED CINEBY / FLUXTV VIDEO PLAYER */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex flex-col justify-between">
          
          {/* Backdrop Blur Thumbnail */}
          <img 
            src={item.image} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

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

          {/* Center Loading Status */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            {loadingPhase < 2 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500 absolute">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-200 animate-pulse">
                  {phaseMessages[loadingPhase]}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/20">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Server Connected • Ready to Stream
                </p>
                <p className="text-[11px] text-zinc-400">
                  Unlock 1 server mirror below to start playback
                </p>
              </div>
            )}
          </div>

          {/* Bottom Video Controls Mock */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-red-600 transition-all duration-700 ease-out" 
                style={{ width: loadingPhase === 0 ? '30%' : loadingPhase === 1 ? '75%' : '100%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-300">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>00:00 / 02:14:30</span>
              </div>
              <span>Fast CDN Node 1</span>
            </div>
          </div>
        </div>

        {/* 2. THE 3 STREAMING SERVER OFFERS */}
        <div className="mt-5">
          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
              {error}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Choose Fastest Stream Server
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Free Access</span>
              </div>

              {loadingPhase < 2 && offers.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-zinc-800/50 animate-pulse border border-white/5" />
                ))
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
                          {offer.adcopy || 'Quick verification to launch full stream'}
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

        {/* Post-Click Confirmation */}
        {clickedOffer && (
          <div className="mt-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
            <p className="text-xs text-zinc-200">
              Complete the verification in the opened tab. Click below once done:
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
