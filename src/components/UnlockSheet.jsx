import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);
  const [clickedOffer, setClickedOffer] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Simulate fast edge handshake then load offers
    const timer = setTimeout(() => {
      fetch('/api/offers')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.offers) && data.offers.length > 0) {
            setOffers(data.offers);
          } else {
            setError(data.error || 'No active streaming mirrors available right now.');
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 600);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Dark Glass Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-[2rem] sm:rounded-2xl border border-white/10 bg-[#0e121a]/95 p-6 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Movie Header Bar */}
        <div className="flex items-center gap-4 border-b border-white/[0.08] pb-5">
          <img
            src={item.image}
            alt=""
            className="h-16 w-12 shrink-0 rounded-lg object-cover ring-1 ring-white/15 shadow-lg"
          />
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                CDN Server Ready
              </span>
            </div>
            <h3 className="truncate text-base font-bold text-white mt-0.5">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400">
              4K Ultra HD • Adaptive Bitrate
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  Allocating High-Speed Buffer...
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Connecting to nearest low-latency streaming edge
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
              <p className="text-xs text-red-200 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Available Fast Mirrors
                </span>
                <span className="text-[11px] font-medium text-emerald-400">100% Free</span>
              </div>

              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                {offers.map((offer, idx) => (
                  <a
                    key={offer.offer_id || idx}
                    href={offer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setClickedOffer(true)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition-all hover:border-red-500/40 hover:bg-white/[0.06] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-zinc-100 group-hover:text-white">
                          {offer.name_short || offer.name || `Mirror Server #${idx + 1}`}
                        </h4>
                        <p className="truncate text-[11px] text-zinc-400">
                          {offer.adcopy || 'Verify once to launch 4K stream'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-semibold text-zinc-400 group-hover:text-white">
                        Connect
                      </span>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-400 transition-colors">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Post-Click Verification Card */}
        {clickedOffer && (
          <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-emerald-300">
                  Awaiting Connection Finalization
                </h5>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                  Complete the brief step in your new tab. Once completed, click below to initialize streaming.
                </p>
                <button
                  onClick={onComplete}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black shadow-lg transition hover:bg-emerald-400 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Launch Movie Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-zinc-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            SSL Stream Encryption
          </span>
          <span>Fast Edge Routing</span>
        </div>
      </div>
    </div>
  );
}
