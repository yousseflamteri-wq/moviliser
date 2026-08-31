import { useEffect, useState, useCallback } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickedOffer, setClickedOffer] = useState(false);

  const loadOffers = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch('/api/offers')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        setOffers(Array.isArray(data.offers) ? data.offers : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    loadOffers();

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose, loadOffers]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-2xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl">

        {/* Header Movie Meta */}
        <div className="flex items-start gap-3 border-b border-white/10 pb-4">
          <img src={item.image} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover bg-zinc-800 ring-1 ring-white/10" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-white">{item.title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Server Ready &bull; Fast HD Stream
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Verification Copy */}
        <div className="my-4">
          <h4 className="text-sm font-bold text-white">Free Human Verification</h4>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Complete one quick sponsor task below to confirm you are not a bot and unlock immediate full-length playback.
          </p>
        </div>

        {/* Dynamic Offers from OGAds API */}
        <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-zinc-800/60 animate-pulse border border-white/5" />
            ))
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs text-red-300 space-y-2">
              <p>{error}</p>
              <button
                onClick={loadOffers}
                className="rounded-lg border border-red-400/40 px-3 py-1.5 text-[11px] font-bold text-red-200 hover:bg-red-500/10"
              >
                Try Again
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500 space-y-2">
              <p>No tasks available right now. Please try again in a few minutes.</p>
              <button
                onClick={loadOffers}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-bold text-zinc-300 hover:bg-white/5"
              >
                Refresh
              </button>
            </div>
          ) : (
            offers.map((offer) => (
              <a
                key={offer.offer_id || offer.name}
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setClickedOffer(true)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-red-500/50 hover:bg-red-500/5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {offer.picture && (
                    <img src={offer.picture} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
                  )}
                  <div className="min-w-0">
                    <h5 className="truncate text-xs font-bold text-zinc-100 group-hover:text-red-400">{offer.name_short || offer.name}</h5>
                    <p className="truncate text-[11px] text-zinc-400">{offer.adcopy || 'Complete the step to unlock'}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow group-hover:bg-red-500">
                  Unlock &rarr;
                </span>
              </a>
            ))
          )}
        </div>

        {/* Post-Click Verification Checker */}
        {clickedOffer && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={onComplete}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
            >
              I Completed the Verification &bull; Start Movie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
