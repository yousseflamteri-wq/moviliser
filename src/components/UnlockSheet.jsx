import { useEffect, useState } from 'react';

export default function UnlockSheet({ item, onUnlocked, onClose }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    // Fetch live OGAds offers from the Cloudflare Function
    fetch('/api/offers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.offers) {
          setOffers(data.offers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOfferClick = (link) => {
    window.open(link, '_blank');
    // Start playback immediately when the user clicks an offer
    setTimeout(() => {
      onUnlocked();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#121214] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Header */}
        <div className="flex items-start gap-4 pb-5 border-b border-white/10">
          <img
            src={item.image}
            alt=""
            className="h-20 w-14 rounded-lg object-cover bg-zinc-800 ring-1 ring-white/10 shrink-0"
          />
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Stream Ready
            </span>
            <h3 className="text-base font-bold text-white leading-tight mt-1 line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Complete 1 quick sponsor verification to unlock full HD stream.</p>
          </div>
        </div>

        {/* Dynamic Offers List */}
        <div className="py-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Choose an offer to continue:
          </h4>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-zinc-800/60 animate-pulse" />
              ))}
            </div>
          ) : offers.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {offers.map((offer) => (
                <div
                  key={offer.offerid || offer.name_short}
                  onClick={() => handleOfferClick(offer.link)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-red-500/50 hover:bg-zinc-800/80 cursor-pointer transition active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {offer.picture && (
                      <img src={offer.picture} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-red-400 truncate">
                        {offer.name_short}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">{offer.adcopy}</p>
                    </div>
                  </div>
                  <button className="shrink-0 text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg shadow-sm">
                    Free
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <button
                onClick={() => {
                  onUnlocked();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-500 transition"
              >
                Continue to Stream
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-center text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
