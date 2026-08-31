import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickedOffer, setClickedOffer] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Pre-fetch offers in the background while the user reads Step 1
    fetch('/api/offers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.offers)) {
          setOffers(data.offers);
        } else if (data.offers && Array.isArray(data.offers)) {
          setOffers(data.offers);
        } else {
          setError(data.error || 'No current verification offers available.');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-8">
        
        {/* Universal Header */}
        <div className="flex items-center gap-4 mb-6">
          <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover bg-zinc-800 ring-1 ring-white/10" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-white">{item.title}</h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              4K HDR • High Quality Stream
            </p>
          </div>
          {step === 2 && (
            <button onClick={onClose} className="text-zinc-400 hover:text-white shrink-0 p-1 transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {step === 1 ? (
          /* STEP 1: The Intro Prompt */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-[15px] leading-relaxed text-zinc-300 mb-6">
              To stream <span className="font-bold text-white">{item.title}</span> in High Quality, please complete one quick offer from our partners. It's what keeps the library free.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full rounded-full bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-500 active:scale-95"
            >
              Continue
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition"
            >
              Maybe later
            </button>
          </div>
        ) : (
          /* STEP 2: The Offer Wall */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-4 border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-white">Select an offer to continue</h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Playback will begin immediately after successful completion.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-zinc-800/60 animate-pulse border border-white/5" />
                ))
              ) : error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs text-red-300">
                  {error}
                </div>
              ) : offers.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No tasks available right now. Please try again in a few minutes.
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

            {clickedOffer && (
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={onComplete}
                  className="w-full rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
                >
                  I Completed the Offer &bull; Start Movie
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
